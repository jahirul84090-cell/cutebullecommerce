"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  ChevronRight,
  Share,
  Loader2, // Added Loader2 icon for the spinner
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ImageModal from "@/components/others/Imagemodal";
import { useCartWithSession } from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";
import { useSession } from "next-auth/react";

// Import react-toastify
import { toast } from "react-toastify";

import ReviewForm from "@/components/others/ReviewFrom";

export default function SingleProductDetail({ productData }) {
  const { cartItems, addToCart, updateCartItemQuantity } = useCartWithSession();
  const { wishlist, toggleWishlist, fetchWishlist } = useWishlistStore();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userId = session?.user?.id;

  const hasImages = productData?.images?.length > 0;
  const [selectedImage, setSelectedImage] = useState(
    hasImages ? productData.images[0].url : productData.mainImage
  );

  const availableColors = (productData?.availableColors?.split(",") || [])
    .map((c) => c.trim())
    .filter((c) => c !== "");

  const availableSizes = (productData?.availableSizes?.split(",") || [])
    .map((c) => c.trim())
    .filter((c) => c !== "");

  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] || null
  );
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || null);

  // State to manage the loading state of the initial add to cart action
  const [isAdding, setIsAdding] = useState(false);

  // New state for "Load More Reviews" functionality
  const [reviewsToShow, setReviewsToShow] = useState(5);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  const itemIdentifier = `${productData.id}-${selectedSize || "no-size"}-${
    selectedColor || "no-color"
  }`;
  const currentCartItem = cartItems.find((item) => item.id === itemIdentifier);
  const isInCart = !!currentCartItem;
  const isWishlisted = wishlist.some((item) => item.id === productData.id);

  // Use optional chaining for safe access to quantity and isUpdating
  const quantity = currentCartItem?.quantity || 1;
  const isUpdating = currentCartItem?.isUpdating || false;

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to cart.");
      return;
    }
    if (productData.stockAmount <= 0) {
      toast.warn("This product is sold out.");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.warn("Please select a size.");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.warn("Please select a color.");
      return;
    }
    setIsAdding(true); // Start adding state
    try {
      await addToCart(productData.id, 1, selectedSize, selectedColor);
    } finally {
      setIsAdding(false); // End adding state
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (currentCartItem) {
      await updateCartItemQuantity(
        currentCartItem.dbItemId,
        newQuantity,
        currentCartItem.id
      );
    }
  };

  const handleToggleWishlist = () => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to wishlist.");
      return;
    }
    toggleWishlist(productData, isWishlisted);
    toast.success(
      isWishlisted ? "Item removed from wishlist." : "Item added to wishlist!"
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productData.name,
          text: productData.shortdescription,
          url: window.location.href,
        });
        console.log("Successfully shared");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast.info("Web Share API is not supported in this browser.");
      navigator.clipboard.writeText(window.location.href);
      toast.info("Product URL copied to clipboard!");
    }
  };

  // New function to load more reviews
  const handleLoadMore = () => {
    setReviewsToShow((prev) => prev + 5);
  };

  const [activeTab, setActiveTab] = useState("Rating & Reviews");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentReviewImages, setCurrentReviewImages] = useState([]);

  const openImageModal = (images, index) => {
    setCurrentReviewImages(images);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageIndex(0);
    setCurrentReviewImages([]);
  };

  const reviewsData = productData.reviews || [];
  const totalRating = reviewsData.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating =
    reviewsData.length > 0 ? (totalRating / reviewsData.length).toFixed(1) : 0;
  const reviewsCount = reviewsData.length;

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <nav className="text-sm text-gray-500 mb-6 flex items-center space-x-2">
        <Link href="/">Home</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Link href="/allproducts">Shop</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span>{productData.category?.name || "Category"}</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span>{productData.name}</span>
      </nav>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4">
          {hasImages && (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto w-full lg:w-auto">
              {productData.images.map((image, index) => (
                <div
                  key={index}
                  className={`flex-none w-20 h-20 relative border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedImage === image.url
                      ? "border-purple-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(image.url)}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="relative w-full h-96 border rounded-lg overflow-hidden shadow-lg">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={productData.name}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                No image available
              </div>
            )}
          </div>
        </div>
        <div className="lg:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {productData.name}
          </h1>
          <div className="flex items-center space-x-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating)
                    ? "fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-500">
              {averageRating} ({reviewsCount} reviews)
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              ${productData.price}
            </span>
            <span className="text-base text-gray-500 line-through">
              ${productData.oldPrice}
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
              -{productData.discount}%
            </span>
          </div>
          <p className="text-gray-700 mt-4 leading-relaxed">
            {productData.shortdescription}
          </p>
          {availableColors.length > 0 && (
            <div>
              <span className="font-semibold text-gray-700">Select Colors</span>
              <div className="flex space-x-2 mt-2">
                {availableColors.map((color, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform duration-200 hover:scale-110 ${
                      selectedColor === color
                        ? "border-purple-600 ring-2 ring-purple-600"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  ></div>
                ))}
              </div>
            </div>
          )}
          {availableSizes.length > 0 && (
            <div className="mt-2">
              <span className="font-semibold text-gray-700">Choose Size</span>
              <div className="flex space-x-2 mt-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    className={`rounded-full px-4 py-2 transition-colors duration-200 ${
                      selectedSize === size
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-6">
            {productData.stockAmount <= 0 ? (
              <Button
                disabled
                className="w-full bg-gray-400 text-white font-semibold rounded-full cursor-not-allowed"
              >
                Sold Out
              </Button>
            ) : isInCart ? (
              <div className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 rounded-full px-1">
                <Button
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  disabled={isUpdating || quantity <= 1}
                  variant="ghost"
                  className="p-1 h-8 w-8 rounded-full text-gray-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                {/* Updated to show spinner for quantity */}
                <span className="text-lg font-semibold w-8 text-center">
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    quantity
                  )}
                </span>
                <Button
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  disabled={isUpdating || quantity >= productData.stockAmount}
                  variant="ghost"
                  className="p-1 h-8 w-8 rounded-full text-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAddToCart}
                // Updated to disable and show spinner when adding
                disabled={
                  isAdding ||
                  !isLoggedIn ||
                  (availableSizes.length > 0 && !selectedSize) ||
                  (availableColors.length > 0 && !selectedColor)
                }
                className="flex-1 bg-purple-600 text-white font-semibold rounded-full flex items-center justify-center space-x-2 hover:bg-purple-700 transition-all duration-300"
              >
                {isAdding ? (
                  <>
                    <span>Adding</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Add to Cart</span>
                    <ShoppingCart className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleToggleWishlist}
              disabled={!isLoggedIn}
              variant="outline"
              size="icon"
              className={`p-2 rounded-full border transition-all duration-200 ${
                isLoggedIn
                  ? "border-gray-300 hover:bg-gray-100"
                  : "border-gray-200 cursor-not-allowed"
              }`}
            >
              {isWishlisted ? (
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              ) : (
                <Heart className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
          {isInCart && (
            <div className="flex gap-4 mt-2">
              <Link href="/cart" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Cart
                </Button>
              </Link>
              <Link href="/checkout" className="flex-1">
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          )}
          {!isLoggedIn && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Please log in to add to cart or wishlist.
            </div>
          )}
        </div>
      </div>
      <div className="mt-12 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {["Product Details", "Rating & Reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-8">
        {activeTab === "Product Details" && (
          <div className="prose max-w-none">
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: productData.description }}
            />
          </div>
        )}
        {activeTab === "Rating & Reviews" && (
          <div>
            <ReviewForm productId={productData.id} userId={userId} />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 p-4 border rounded-lg shadow-sm bg-white">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border">
                <Image
                  src={productData.mainImage}
                  alt={productData.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex flex-col items-start">
                  <span className="text-4xl font-bold text-gray-900">
                    {averageRating}
                  </span>
                  <div className="flex items-center space-x-1 text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(averageRating)
                            ? "fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 mt-1">
                    {reviewsCount} reviews
                  </span>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 w-10 text-right">
                        {star} Star
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{
                            width: `${(
                              (reviewsData.filter((r) => r.rating === star)
                                .length /
                                reviewsData.length) *
                              100
                            ).toFixed(0)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({reviewsData.filter((r) => r.rating === star).length})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                All Reviews
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewsData.slice(0, reviewsToShow).map((review, index) => (
                  <div
                    key={index}
                    className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={review.user?.image}
                            alt={review.user?.name}
                          />
                          <AvatarFallback>
                            {review.user?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-gray-800 flex items-center">
                            {review.user?.name}
                            <svg
                              className="w-4 h-4 text-green-500 ml-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="font-semibold text-gray-700 text-sm">
                              {review.rating}
                            </span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-4 text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {review.images.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 cursor-pointer group"
                            onClick={() =>
                              openImageModal(
                                review.images.map((img) => img.url),
                                i
                              )
                            }
                          >
                            <Image
                              src={img.url}
                              alt={`Review image ${i + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            {i === 2 && review.images.length > 3 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-bold">
                                +{review.images.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                {reviewsToShow < reviewsCount && (
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    className="text-gray-700 border-gray-300"
                  >
                    Load More Reviews
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        images={currentReviewImages}
        initialIndex={currentImageIndex}
      />
    </div>
  );
}
