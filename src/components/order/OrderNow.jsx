"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import useCartStore from "@/lib/cartStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// NewAddressForm component for adding a new address
const NewAddressForm = ({ onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    // Basic client-side validation
    if (!data.street) return toast.error("Street is required");
    if (!data.city) return toast.error("City is required");
    if (!data.zipCode) return toast.error("Zip Code is required");
    if (!data.country) return toast.error("Country is required");
    if (!data.phoneNumber) return toast.error("Phone number is required");

    try {
      const response = await fetch("/api/profile/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add address");
      const { address } = await response.json();
      onSave(address);
      reset();
      toast.success("Address added successfully");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        placeholder="Street Address"
        className="rounded-full"
        {...register("street")}
        aria-invalid={!!errors.street}
        aria-describedby={errors.street ? "street-error" : undefined}
      />
      {errors.street && (
        <p id="street-error" className="text-red-500 text-sm mt-1">
          Street is required
        </p>
      )}
      <Input
        placeholder="City"
        className="rounded-full"
        {...register("city")}
        aria-invalid={!!errors.city}
        aria-describedby={errors.city ? "city-error" : undefined}
      />
      {errors.city && (
        <p id="city-error" className="text-red-500 text-sm mt-1">
          City is required
        </p>
      )}
      <Input
        placeholder="State"
        className="rounded-full"
        {...register("state")}
      />
      <Input
        placeholder="Zip Code"
        className="rounded-full"
        {...register("zipCode")}
        aria-invalid={!!errors.zipCode}
        aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
      />
      {errors.zipCode && (
        <p id="zipCode-error" className="text-red-500 text-sm mt-1">
          Zip Code is required
        </p>
      )}
      <Input
        placeholder="Country"
        className="rounded-full"
        {...register("country")}
        aria-invalid={!!errors.country}
        aria-describedby={errors.country ? "country-error" : undefined}
      />
      {errors.country && (
        <p id="country-error" className="text-red-500 text-sm mt-1">
          Country is required
        </p>
      )}
      <Input
        placeholder="Phone Number"
        className="rounded-full"
        {...register("phoneNumber")}
        aria-invalid={!!errors.phoneNumber}
        aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
      />
      {errors.phoneNumber && (
        <p id="phoneNumber-error" className="text-red-500 text-sm mt-1">
          Phone number is required
        </p>
      )}
      <div className="flex space-x-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Address"
          )}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="rounded-full"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default function OrderNowPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cartItems, cartId, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const [addressResponse, paymentResponse, deliveryFeeResponse] =
          await Promise.all([
            fetch("/api/profile/address"),
            fetch("/api/admin/payment-methods"),
            fetch("/api/admin/delivery-fees"),
          ]);

        if (!isMounted) return;

        if (!addressResponse.ok || addressResponse.status === 401) {
          router.push("/login");
          toast.error("Please log in to place an order");
          return;
        }
        if (!paymentResponse.ok) {
          throw new Error("Failed to fetch payment methods");
        }
        if (!deliveryFeeResponse.ok) {
          throw new Error("Failed to fetch delivery fees");
        }

        const { addresses } = await addressResponse.json();
        const { paymentMethods } = await paymentResponse.json();
        const { deliveryFees } = await deliveryFeeResponse.json();

        if (isMounted) {
          setAddresses(addresses || []);
          if (addresses?.length) {
            const defaultAddress = addresses.find((addr) => addr.isDefault);
            setSelectedAddressId(defaultAddress?.id || addresses[0].id);
          }

          setPaymentMethods(paymentMethods || []);
          if (paymentMethods?.length) {
            const codMethod = paymentMethods.find(
              (m) => m.isCashOnDelivery === true
            );
            setSelectedPaymentMethodId(codMethod?.id || paymentMethods[0].id);
          }

          setDeliveryFees(deliveryFees || []);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load data: " + error.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const getDeliveryFee = () => {
    const selectedAddress = addresses.find(
      (addr) => addr.id === selectedAddressId
    );
    if (!selectedAddressId || !selectedAddress) {
      return 0;
    }

    const matchedFee = deliveryFees.find(
      (fee) =>
        fee.country.toLowerCase() === selectedAddress.country.toLowerCase() &&
        (!fee.city ||
          fee.city.toLowerCase() === selectedAddress.city.toLowerCase())
    );

    if (!matchedFee) {
      return 150; // Configurable default
    }

    return matchedFee.amount;
  };

  const selectedPaymentMethod = paymentMethods.find(
    (pm) => pm.id === selectedPaymentMethodId
  );

  const requiresTransactionNumber =
    selectedPaymentMethod?.isCashOnDelivery !== true;

  const handlePlaceOrder = async () => {
    if (!cartId) {
      toast.error("Invalid cart. Please add items to your cart.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }
    if (requiresTransactionNumber && !transactionNumber) {
      toast.error("Please enter a transaction number");
      return;
    }
    if (requiresTransactionNumber && transactionNumber.length < 5) {
      toast.error("Transaction number must be at least 5 characters");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          shippingAddressId: selectedAddressId,
          paymentMethodId: selectedPaymentMethodId,
          ...(requiresTransactionNumber && { transactionNumber }),
        }),
      });
      if (!response.ok) throw new Error("Failed to place order");
      const { order } = await response.json();
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders/confirm/${order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressSave = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setSelectedAddressId(newAddress.id);
    setIsModalOpen(false);
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );
  const currentDeliveryFee = useMemo(
    () => getDeliveryFee(),
    [selectedAddressId, addresses, deliveryFees]
  );
  const totalAmount = useMemo(
    () => (subtotal + currentDeliveryFee).toFixed(2),
    [subtotal, currentDeliveryFee]
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl bg-gray-50 min-h-screen font-sans">
      <Card className="shadow-lg border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-white p-6 sm:p-8">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Place Your Order
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Review your order details and confirm your purchase.
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              {cartItems.length ? (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-gray-200 pb-4"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.selectedSize
                            ? `Size: ${item.selectedSize}, `
                            : ""}
                          {item.selectedColor
                            ? `Color: ${item.selectedColor}`
                            : ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-purple-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="space-y-2 mt-6 font-semibold">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee:</span>
                      <span>${currentDeliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 text-purple-600">
                      <span>Total:</span>
                      <span>${totalAmount}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Your cart is empty.</p>
              )}
            </div>

            {/* Checkout Form */}
            <div className="space-y-8">
              {/* Shipping Address Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  {addresses.length ? (
                    <Select
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                    >
                      <SelectTrigger className="w-full rounded-full">
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id}>
                            {address.street}, {address.city}, {address.country}
                            {address.isDefault && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-500">
                      No addresses available. Please add one.
                    </p>
                  )}
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <NewAddressForm
                        onSave={handleAddressSave}
                        onCancel={() => setIsModalOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Payment Method
                </h2>
                {paymentMethods.length ? (
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                  >
                    <SelectTrigger className="w-full rounded-full">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-gray-500">No payment methods available.</p>
                )}
                {selectedPaymentMethod && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <p className="font-medium">{selectedPaymentMethod.name}</p>
                    <p className="text-sm text-gray-600">
                      Account: {selectedPaymentMethod.accountNumber}
                    </p>
                    {selectedPaymentMethod.instructions && (
                      <p className="text-sm text-gray-600 mt-2">
                        Instructions: {selectedPaymentMethod.instructions}
                      </p>
                    )}
                    {requiresTransactionNumber && (
                      <Input
                        placeholder={`Enter ${selectedPaymentMethod.name} transaction number`}
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        className="mt-4 rounded-full"
                        aria-required="true"
                        aria-describedby="transactionNumber-error"
                      />
                    )}
                    {requiresTransactionNumber &&
                      transactionNumber.length < 5 && (
                        <p
                          id="transactionNumber-error"
                          className="text-red-500 text-sm mt-1"
                        >
                          Transaction number must be at least 5 characters
                        </p>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handlePlaceOrder}
              disabled={
                submitting ||
                !cartItems.length ||
                !selectedAddressId ||
                !selectedPaymentMethodId ||
                (requiresTransactionNumber && transactionNumber.length < 5)
              }
              className="w-full max-w-xs h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-full shadow-lg transition-colors"
            >
              {submitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
