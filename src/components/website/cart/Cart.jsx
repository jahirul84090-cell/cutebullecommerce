"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useCartWithSession } from "@/lib/cartStore";

const CartPage = () => {
  const {
    cartItems,
    totalPrice,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCartWithSession();

  const subtotal = totalPrice;
  const total = subtotal;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-12 font-sans bg-gray-50 min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 sm:mb-12 flex-wrap gap-4">
          <div className="flex items-end">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            <span className="text-gray-500 font-normal text-sm sm:text-xl ml-2 sm:ml-4">
              ({cartItems.length} items)
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full h-10 sm:h-11 px-6 sm:px-7 font-medium border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
              >
                Continue Shopping
              </Button>
            </Link>
            <Button
              variant="outline"
              className="rounded-full h-10 sm:h-11 px-6 sm:px-7 font-medium border-red-300 text-red-500 hover:bg-red-50 transition-colors shadow-sm"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-20 bg-white rounded-2xl shadow-lg text-center">
            <p className="text-lg sm:text-xl text-gray-600 font-medium mb-4">
              Your cart is empty.
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
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col sm:flex-row p-4 items-start sm:items-center rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-lg bg-white"
                >
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 mb-4 sm:mb-0 mr-4 sm:mr-6 bg-gray-100 rounded-xl">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain rounded-xl"
                      />
                    )}
                  </div>
                  <div className="flex-grow flex flex-col sm:flex-row sm:items-center w-full">
                    <div className="flex-grow mb-4 sm:mb-0">
                      <h2 className="font-semibold text-base text-gray-800 mb-1 leading-tight">
                        {item.name}
                      </h2>
                      {(item.selectedSize || item.selectedColor) && (
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                          {item.selectedSize && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              Color:
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor:
                                    item.selectedColor.toLowerCase(),
                                }}
                              ></div>
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        ${item.price.toFixed(2)} per item
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 sm:ml-auto w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-gray-300 hover:bg-gray-100"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.dbItemId,
                              item.quantity - 1,
                              item.id
                            )
                          }
                          disabled={item.isUpdating || item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </Button>
                        <span className="text-sm font-medium text-gray-800 w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-full border-gray-300 hover:bg-gray-100"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.dbItemId,
                              item.quantity + 1,
                              item.id
                            )
                          }
                          disabled={item.isUpdating}
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-purple-600 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full"
                          onClick={() => removeFromCart(item.dbItemId, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="rounded-2xl shadow-lg border border-gray-200 bg-white">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
                    Order Summary
                  </h3>
                  <div className="space-y-3 sm:space-y-4 text-gray-700">
                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-800">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-bold text-lg sm:text-xl border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
                    <span className="text-gray-900">Total</span>
                    <span className="text-purple-600">${total.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 rounded-b-2xl p-6 sm:p-8 border-t border-gray-200">
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full h-12 sm:h-14 cursor-pointer text-base sm:text-lg rounded-full font-semibold bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
