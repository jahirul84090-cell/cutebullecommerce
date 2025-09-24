import { notFound } from "next/navigation";
import SingleProductDetail from "@/components/website/single product/SingleProduct";
import React from "react";

const getProductDetails = async (slug) => {
  const url = `${process.env.BASE_URL}/api/admin/product/slug/${slug}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.product || null;
  } catch (error) {
    console.error(`Error fetching product for slug ${slug}:`, error);
    return null;
  }
};

// Add this function to generate dynamic metadata
export async function generateMetadata({ params }) {
  const { slug } = params;
  const product = await getProductDetails(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  return {
    title: product.name,
    description: product.shortdescription,
    keywords: `${product.name}, ${product.category.name}, e-commerce, shopping`,
    openGraph: {
      title: product.name,
      description: product.shortdescription,
      images: [
        {
          url: product.mainImage,
          alt: product.name,
        },
      ],
    },
  };
}

const Page = async ({ params }) => {
  const { slug } = params;
  const productData = await getProductDetails(slug);

  if (!productData) {
    notFound();
  }

  return (
    <>
      <SingleProductDetail productData={productData} />
    </>
  );
};

export default Page;
