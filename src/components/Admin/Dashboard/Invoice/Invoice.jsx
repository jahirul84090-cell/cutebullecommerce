"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  PlusCircle,
  Trash2,
  Save,
  Users,
  Truck,
  ShoppingCart,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Combobox } from "@/components/ui/combobox";

export default function ManualInvoiceCreatorPage() {
  const router = useRouter();
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZipCode, setShippingZipCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingPhoneNumber, setShippingPhoneNumber] = useState("");
  const [lineItems, setLineItems] = useState([
    { productId: "", productName: "", quantity: 1, price: 0, snapshot: {} },
  ]);
  const [deliveryFee, setDeliveryFee] = useState(0); // New state for delivery fee
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] =
    useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch("/api/admin/product");
        if (!response.ok) {
          throw new Error("Failed to fetch products.");
        }
        const data = await response.json();
        setAvailableProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products: " + error.message);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoadingPaymentMethods(true);
      try {
        const response = await fetch("/api/admin/payment-methods");
        if (!response.ok) {
          throw new Error("Failed to fetch payment methods.");
        }
        const data = await response.json();
        setAvailablePaymentMethods(data.paymentMethods || []);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Failed to load payment methods: " + error.message);
      } finally {
        setIsLoadingPaymentMethods(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { productId: "", productName: "", quantity: 1, price: 0, snapshot: {} },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newLineItems);
  };

  const handleItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    if (field === "productId") {
      const selectedProduct = availableProducts.find((p) => p.id === value);
      if (selectedProduct) {
        newLineItems[index].productId = selectedProduct.id;
        newLineItems[index].productName = selectedProduct.name;
        newLineItems[index].price = selectedProduct.price;
        newLineItems[index].snapshot = {
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          imageUrl: selectedProduct.mainImage,
          category: selectedProduct.category?.name,
        };
      } else {
        newLineItems[index].productId = "";
        newLineItems[index].productName = "";
        newLineItems[index].price = 0;
        newLineItems[index].snapshot = {};
      }
    } else if (field === "price" || field === "quantity") {
      newLineItems[index][field] = parseFloat(value) || 0;
    } else {
      newLineItems[index][field] = value;
    }
    setLineItems(newLineItems);
  };

  const calculateSubtotal = () => {
    return lineItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(deliveryFee || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !customerEmail ||
      !customerName ||
      !shippingStreet ||
      !shippingCity ||
      !shippingZipCode ||
      !shippingCountry ||
      !shippingPhoneNumber ||
      !selectedPaymentMethodName ||
      lineItems.some(
        (item) =>
          !item.productId ||
          !item.productName ||
          item.quantity <= 0 ||
          item.price <= 0
      )
    ) {
      toast.error(
        "Please fill in all required fields and add at least one item."
      );
      setIsSubmitting(false);
      return;
    }

    const payload = {
      customerEmail,
      customerName,
      shippingAddress: {
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zipCode: shippingZipCode,
        country: shippingCountry,
        phoneNumber: shippingPhoneNumber,
      },
      lineItems,
      deliveryFee: parseFloat(deliveryFee), // Include delivery fee
      paymentMethod: selectedPaymentMethodName,
    };

    try {
      const response = await fetch("/api/admin/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invoice.");
      }

      const { newOrder } = await response.json();
      toast.success("Invoice created successfully!");
      router.push(`/dashboard/order/manage`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl min-h-screen ">
      <ToastContainer position="top-center" autoClose={5000} />
      <Card className="shadow-2xl border-none rounded-xl overflow-hidden">
        <CardHeader className="  p-6 sm:p-8">
          <CardTitle className="text-3xl font-extrabold tracking-wide flex items-center">
            <Save className="mr-3 h-8 w-8 text-blue-400" /> Manual Invoice
            Creator
          </CardTitle>
          <CardDescription className="text-gray-300 mt-1">
            Fill out the details below to generate a new order and invoice.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                    <Users className="mr-2 h-5 w-5 text-blue-600" /> Customer
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g., john.doe@example.com"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                    <Truck className="mr-2 h-5 w-5 text-blue-600" /> Shipping
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={shippingStreet}
                        onChange={(e) => setShippingStreet(e.target.value)}
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="Anytown"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        placeholder="CA"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip / Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingZipCode}
                        onChange={(e) => setShippingZipCode(e.target.value)}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        placeholder="USA"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={shippingPhoneNumber}
                        onChange={(e) => setShippingPhoneNumber(e.target.value)}
                        placeholder="e.g., +15551234567"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-8" />

            <Card className="bg-white border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                  <ShoppingCart className="mr-2 h-5 w-5 text-blue-600" /> Line
                  Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="font-semibold text-blue-600 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-end gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                      <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label>Product</Label>
                        {isLoadingProducts ? (
                          <div className="flex h-10 items-center justify-center rounded-md bg-white border border-gray-300">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                          </div>
                        ) : (
                          <Combobox
                            items={availableProducts.map((p) => ({
                              label: `${p.name} ($${p.price.toFixed(2)})`,
                              value: p.id,
                            }))}
                            value={item.productId}
                            onValueChange={(value) =>
                              handleItemChange(index, "productId", value)
                            }
                            placeholder="Search products..."
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          min="1"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          min="0.01"
                          step="0.01"
                          required
                          disabled
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Separator className="my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-gray-50 border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                    <CreditCard className="mr-2 h-5 w-5 text-blue-600" />{" "}
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method Name</Label>
                    {isLoadingPaymentMethods ? (
                      <div className="flex h-10 items-center justify-center rounded-md bg-white border border-gray-300">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <Combobox
                        items={availablePaymentMethods.map((pm) => ({
                          label: pm.name,
                          value: pm.name,
                        }))}
                        value={selectedPaymentMethodName}
                        onValueChange={setSelectedPaymentMethodName}
                        placeholder="Select payment method..."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border border-gray-200 flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-700">
                    <DollarSign className="mr-2 h-5 w-5 text-blue-600" /> Order
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Delivery Fee</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center justify-between text-2xl font-bold text-gray-900">
                    <div className="text-gray-600">Total:</div>
                    <div>${calculateTotal().toFixed(2)}</div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
