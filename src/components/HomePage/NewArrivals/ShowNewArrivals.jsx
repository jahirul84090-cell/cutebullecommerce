"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  ChevronLeft,
  Heart,
  Eye,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useCartWithSession } from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";
import NewArrivalsSkeleton from "./NewArrivalsSkeleton";

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateCartItemQuantity } = useCartWithSession();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const {
    wishlist,
    toggleWishlist,
    isLoading: isWishlistLoading,
  } = useWishlistStore();

  const availableSizes = product.availableSizes
    ? product.availableSizes.split(",").map((s) => s.trim())
    : [];
  const availableColors = product.availableColors
    ? product.availableColors.split(",").map((c) => c.trim())
    : [];

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const [selectedSize, setSelectedSize] = useState(
    availableSizes.length > 0 ? availableSizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState(
    availableColors.length > 0 ? availableColors[0] : null
  );

  const isSoldOut = product.stockAmount <= 0;
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const averageRating = calculateAverageRating(product.reviews);

  const itemIdentifier = `${product.id}-${selectedSize || "no-size"}-${
    selectedColor || "no-color"
  }`;
  const currentCartItem = cartItems.find((item) => item.id === itemIdentifier);
  const isInCart = !!currentCartItem;
  const [addCart, setAddCart] = useState(false);

  const handleAddToCart = async () => {
    setAddCart(true);
    if (product.stockAmount >= 1) {
      await addToCart(product.id, 1, selectedSize, selectedColor);
      setAddCart(false);
    }
  };
  console.log(addCart);
  const handleUpdateQuantity = (newQuantity) => {
    if (
      currentCartItem &&
      newQuantity <= product.stockAmount &&
      newQuantity >= 1
    ) {
      updateCartItemQuantity(
        currentCartItem.dbItemId,
        newQuantity,
        currentCartItem.id
      );
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product, isWishlisted);
  };

  return (
    <div className="flex-none w-[calc(80%-1rem)] sm:w-[calc(40%-1rem)] md:w-[calc(25%-1rem)] lg:w-[calc(20%-1rem)] xl:w-[calc(20%-1rem)] m-2 bg-white rounded-lg shadow-md border border-gray-200 grid grid-rows-[auto,1fr,auto] transition-all duration-300 transform hover:scale-105 hover:shadow-xl group">
      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
        <Image
          src={
            product.mainImage ||
            "https://placehold.co/400x300/E5E7EB/A2A9B0?text=No+Image"
          }
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-2">
          {product.discount > 0 && (
            <div className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full z-10">
              -{product.discount}%
            </div>
          )}
          {product.organic && (
            <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full z-10">
              Organic
            </div>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
            className={`p-2 rounded-full bg-white shadow-lg transition-all duration-200 ${
              isLoggedIn
                ? isWishlisted
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
                : "text-gray-300 cursor-not-allowed"
            }`}
            disabled={!isLoggedIn || isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isWishlisted ? (
              <Heart fill="currentColor" className="h-5 w-5 text-red-500" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </Button>
          <Link href={`/${product.slug}`} passHref>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 cursor-pointer bg-white rounded-full shadow-lg transition-all duration-300"
            >
              <Eye className="h-5 w-5 text-purple-600" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1 text-yellow-400 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(averageRating)
                    ? "fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            {reviewCount > 0 ? (
              <span className="text-xs text-gray-500">
                ({reviewCount} reviews)
              </span>
            ) : (
              <span className="text-xs text-gray-500">(No reviews yet)</span>
            )}
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-1 text-sm text-gray-600">
          {isSoldOut ? (
            <p className="font-semibold text-red-500">Out of Stock</p>
          ) : (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                Stock: {product.stockAmount}
                {product.stockAmount <= 5 && (
                  <span className="ml-1 text-red-500">
                    (Only {product.stockAmount} left!)
                  </span>
                )}
              </span>
              <span className="text-gray-500">Sold: {product.totalSales}</span>
            </div>
          )}
        </div>

        {(availableSizes.length > 0 || availableColors.length > 0) && (
          <div className="flex flex-col space-y-3 mt-2">
            {availableSizes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <span
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                        ${
                          selectedSize === size
                            ? "bg-purple-600 text-white shadow-lg border-purple-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {availableColors.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Color:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <div key={color} className="flex items-center space-x-1">
                      <span
                        onClick={() => setSelectedColor(color)}
                        className={`
                          cursor-pointer w-6 h-6 rounded-full border-2 transition-all duration-200
                          ${
                            selectedColor === color
                              ? "ring-2 ring-offset-2 ring-purple-500"
                              : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
                          }
                        `}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      ></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col space-y-2">
        {!isLoggedIn && (
          <div className="text-center text-sm text-gray-500">
            Please log in to add to cart.
          </div>
        )}
        {isSoldOut ? (
          <Button
            disabled
            className="w-full bg-gray-400 text-white font-semibold rounded-full cursor-not-allowed"
          >
            Sold Out
          </Button>
        ) : (
          <>
            {isLoggedIn && (
              <div className="flex items-center justify-center space-x-2">
                {!isInCart ? (
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full flex items-center justify-center space-x-2 transition-all duration-300"
                    disabled={product.stockAmount <= 0 || addCart}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span> {addCart ? "Adding" : "Add to cart"}</span>
                  </Button>
                ) : (
                  <div className="flex items-center justify-center space-x-2 border border-gray-300 rounded-full px-1">
                    <Button
                      onClick={() =>
                        handleUpdateQuantity(currentCartItem.quantity - 1)
                      }
                      disabled={
                        currentCartItem.isUpdating ||
                        currentCartItem.quantity <= 1
                      }
                      className="p-2 w-8 h-8 rounded-full bg-transparent text-gray-800 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold w-8 text-center">
                      {currentCartItem.isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        currentCartItem.quantity
                      )}
                    </span>
                    <Button
                      onClick={() =>
                        handleUpdateQuantity(currentCartItem.quantity + 1)
                      }
                      disabled={
                        currentCartItem.isUpdating ||
                        currentCartItem.quantity >= product.stockAmount
                      }
                      className="p-2 w-8 h-8 rounded-full bg-transparent text-gray-800 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function ShowNewArrivals({ products }) {
  const autoplayOptions = useRef({ delay: 3000, stopOnInteraction: false });
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      containScroll: "trimSnaps",
    },
    [Autoplay(autoplayOptions.current)]
  );

  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { fetchWishlist, isLoading: isWishlistLoading } = useWishlistStore();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <div className="container mx-auto px-4 py-8 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          <p className="text-sm text-gray-600">
            Don't miss this opportunity at a special discount just for this
            week.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container flex">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="flex-1 text-center py-10">
                <p className="text-gray-600">No new products found.</p>
              </div>
            )}
          </div>
        </div>

        <div className=" flex items-center justify-between w-full px-2">
          <Button
            onClick={scrollPrev}
            className="p-3 rounded-full text-purple-600 bg-white/70 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            onClick={scrollNext}
            className="p-3 rounded-full text-purple-600 bg-white/70 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
