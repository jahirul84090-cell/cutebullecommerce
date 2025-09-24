"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Eye } from "lucide-react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

const ProductCard = ({ product }) => {
  // Parse sizes and colors from comma-separated strings
  const sizes = product.availableSizes
    ? product.availableSizes.split(",").map((s) => s.trim())
    : [];
  const colors = product.availableColors
    ? product.availableColors.split(",").map((c) => c.trim())
    : [];
  const averageRating = calculateAverageRating(product.reviews);
  const reviewCount = product.reviews ? product.reviews.length : 0;

  const autoplayOptions = useRef({ delay: 2000, stopOnInteraction: false });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay(autoplayOptions.current),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (index) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const stockPercentage = (product.totalSales / product.stockAmount) * 100;

  return (
    <Link href={`/${product.slug}`} className="block">
      <Card className="relative flex flex-col w-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <div className="relative w-full h-48 group">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container flex h-full">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="embla__slide relative flex-[0_0_100%] h-full"
                >
                  <div className="relative w-full h-40">
                    <Image
                      src={image.url}
                      alt={product.name}
                      fill
                      className="rounded-t-lg object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  scrollTo(index);
                }}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === selectedIndex ? "bg-purple-600" : "bg-gray-400"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-2 z-20">
            <div className="flex justify-between items-start">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {product.discount}% OFF
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full cursor-pointer bg-white/50 backdrop-blur-sm hover:bg-white transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  aria-label={`View ${product.name}`}
                >
                  <Eye className="h-5 w-5 cursor-pointer text-purple-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <CardTitle className="text-sm font-semibold h-10 overflow-hidden">
              {product.name}
            </CardTitle>
            <div className="flex items-center mt-1">
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
                  <span className="text-xs text-gray-500">
                    (No reviews yet)
                  </span>
                )}
              </div>
            </div>
            {(sizes.length > 0 || colors.length > 0) && (
              <div className="flex flex-col space-y-2 mt-2">
                {sizes.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">Sizes:</span>
                    <p>{sizes.join(", ").toUpperCase()}</p>
                  </div>
                )}
                {colors.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="font-medium">Colors:</span>
                    <div className="flex space-x-2">
                      {colors.map((color, index) => (
                        <span
                          key={index}
                          className="w-5 h-5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold">${product.price}</span>
              {product.oldPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.oldPrice}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${stockPercentage > 100 ? 100 : stockPercentage}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-semibold">
            <span>Sold: {product.totalSales}</span>
            <span>Total Stock: {product.stockAmount}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const ShowFeatureProduct = ({ products }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Featured Products</h2>
        </div>
      </div>
      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500">No featured products found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowFeatureProduct;
