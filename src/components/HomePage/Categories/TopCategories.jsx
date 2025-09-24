import React from "react";
import Image from "next/image";
import Link from "next/link";

const getTopCategories = async () => {
  try {
    const res = await fetch(`${process.env.BASE_URL}/api/admin/categories`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.categories;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const CategoryCard = ({ category }) => {
  return (
    <Link
      href={`/allproducts?categoryId=${category.id}`}
      className="flex flex-col items-center p-4 text-center group cursor-pointer transition-all duration-300 transform hover:scale-105"
    >
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-2">
        <Image
          src={
            category.imageUrl ||
            "https://ik.imagekit.io/obnmhirhl/589_Dk-sDMakN.png"
          }
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <h3 className="text-sm font-semibold text-gray-800 mt-2 line-clamp-2">
        {category.name}
      </h3>
    </Link>
  );
};

const TopCategories = async () => {
  const topCategories = await getTopCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top Categories</h2>
          <p className="text-sm text-gray-600">
            New products with updated stocks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-2">
        {topCategories.length > 0 ? (
          topCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No categories available.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCategories;
