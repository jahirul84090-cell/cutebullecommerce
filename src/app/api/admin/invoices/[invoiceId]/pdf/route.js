// src/app/api/admin/invoices/[invoiceId]/pdf/route.js

import { sendInvoiceEmail } from "@/lib/otpinvoice";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

async function getInvoiceWithOrderDetails(invoiceId) {
  try {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            user: true,
            shippingAddress: true,
            items: {
              include: { product: true },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    return null;
  }
}

function generateInvoiceHtml(invoice) {
  const order = invoice.order;
  const subtotal = order.orderTotal - (order.deliveryFee || 0);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Invoice #${invoice.invoiceNumber}</title>
        <style>
            body { font-family: 'Helvetica Neue', 'Arial', sans-serif; margin: 0; padding: 40px; color: #444; line-height: 1.6; }
            .container { max-width: 800px; margin: 0 auto; padding: 30px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
            .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
            .company-info h1 { margin: 0; font-size: 28px; color: #007bff; font-weight: 700; }
            .company-info p { margin: 2px 0; font-size: 14px; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { margin: 0; color: #555; font-size: 24px; }
            .invoice-info p { margin: 2px 0; font-size: 14px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .details-box { background-color: #f9f9f9; padding: 15px; border-radius: 6px; flex-grow: 1; margin: 0 10px; }
            .details-box h3 { margin-top: 0; font-size: 18px; color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .table-container { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table-container th, .table-container td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
            .table-container th { background-color: #f0f0f0; font-weight: bold; }
            .total-row { border-top: 2px solid #007bff; }
            .total-row td { font-size: 16px; font-weight: bold; }
            .footer-section { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
            .signature { margin-top: 40px; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header-section">
                <div class="company-info">
                    <h1>BD StORE</h1>
                    <p>Dhaka,Bangladesh</p>
                </div>
                <div class="invoice-info">
                    <h2>INVOICE</h2>
                    <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Date:</strong> ${new Date(
                      order.createdAt
                    ).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="details">
                <div class="details-box">
                    <h3>Bill To:</h3>
                    <p><strong>Name:</strong> ${order.user.name || "N/A"}</p>
                    <p><strong>Email:</strong> ${order.user.email}</p>
                </div>
                <div class="details-box">
                    <h3>Ship To:</h3>
                    <p>${order.shippingAddress.street}</p>
                    <p>${order.shippingAddress.city}, ${
    order.shippingAddress.state
  }, ${order.shippingAddress.zipCode}</p>
                </div>
            </div>
            <table class="table-container">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.product.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.pricePaid.toFixed(2)}</td>
                            <td>$${(item.quantity * item.pricePaid).toFixed(
                              2
                            )}</td>
                        </tr>`
                      )
                      .join("")}
                    <tr>
                        <td colspan="2"></td>
                        <td>Subtotal:</td>
                        <td>$${subtotal.toFixed(2)}</td>
                    </tr>
                    ${
                      order.deliveryFee > 0
                        ? `
                    <tr>
                        <td colspan="2"></td>
                        <td>Delivery Fee:</td>
                        <td>$${order.deliveryFee.toFixed(2)}</td>
                    </tr>`
                        : ""
                    }
                    <tr class="total-row">
                        <td colspan="2"></td>
                        <td>Total (${totalItems} items):</td>
                        <td>$${order.orderTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer-section">
                <p>Thank you for your business! For any inquiries, please contact us at support@yourcompany.com.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

async function generatePdfBuffer(invoice) {
  const htmlContent = generateInvoiceHtml(invoice);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return pdfBuffer;
}

export async function GET(request, { params }) {
  try {
    const { invoiceId } = await params;
    const invoice = await getInvoiceWithOrderDetails(invoiceId);

    if (!invoice || !invoice.order) {
      return NextResponse.json(
        { error: "Invoice or Order not found" },
        { status: 404 }
      );
    }
    const pdfBuffer = await generatePdfBuffer(invoice);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { invoiceId } = await params;
    const invoice = await getInvoiceWithOrderDetails(invoiceId);

    if (!invoice || !invoice.order) {
      return NextResponse.json(
        { error: "Invoice or Order not found" },
        { status: 404 }
      );
    }
    const pdfBuffer = await generatePdfBuffer(invoice);
    const emailResult = await sendInvoiceEmail({
      recipientEmail: invoice.order.user.email,
      recipientName: invoice.order.user.name,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.order.id,
      orderTotal: invoice.order.orderTotal,
      pdfBuffer,
    });

    if (emailResult.success) {
      return NextResponse.json(
        { message: "Invoice email sent successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send invoice email." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { error: "Failed to send invoice email." },
      { status: 500 }
    );
  }
}
