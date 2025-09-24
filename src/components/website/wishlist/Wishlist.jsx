"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import useWishlistStore from "@/lib/wishlistStore";
import { useCartWithSession } from "@/lib/cartStore";

const WishlistPage = () => {
  const {
    wishlist,
    isLoading,
    error,
    fetchWishlist,
    toggleWishlist,
    clearWishlist,
  } = useWishlistStore();
  const { addToCart } = useCartWithSession();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddAllToCart = async () => {
    if (wishlist.length === 0) return;

    for (const item of wishlist) {
      await addToCart(item.id, 1, item.selectedSize, item.selectedColor);
    }

    await clearWishlist();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-12 font-sans bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 sm:mb-12 flex-wrap gap-4">
          <div className="flex items-end">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Your Wishlist
            </h1>
            <span className="text-gray-500 font-normal text-sm sm:text-xl ml-2 sm:ml-4">
              ({wishlist.length} items)
            </span>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-full h-10 sm:h-11 px-6 sm:px-7 font-medium border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-white rounded-2xl shadow-lg text-center">
            <p className="text-lg sm:text-xl text-gray-600 font-medium mb-4">
              Your wishlist is empty.
            </p>
            <Link href="/">
              <Button className="rounded-full h-12 px-8 font-semibold bg-purple-600 hover:bg-purple-700 transition-colors">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-4">
              {wishlist.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col sm:flex-row p-4 items-start sm:items-center rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg bg-white"
                >
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 mb-4 sm:mb-0 mr-4 sm:mr-6 bg-gray-100 rounded-xl flex items-center justify-center">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain rounded-xl"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col sm:flex-row sm:items-center w-full">
                    <div className="flex-grow mb-4 sm:mb-0">
                      <h2 className="font-semibold text-base text-gray-800 mb-1 leading-tight">
                        {item.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 sm:ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full"
                        onClick={() => toggleWishlist(item, true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                        onClick={() =>
                          addToCart(
                            item.id,
                            1,
                            item.selectedSize,
                            item.selectedColor
                          )
                        }
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white p-6 sm:p-8">
                <Button
                  className="w-full h-12 sm:h-14 text-base sm:text-lg rounded-full font-semibold bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg"
                  onClick={handleAddAllToCart}
                >
                  Add all to cart
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
