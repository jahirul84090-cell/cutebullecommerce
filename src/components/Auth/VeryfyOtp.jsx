"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resendTimer, setResendTimer] = useState(0);

  const [isResetLoading, setisResetLoading] = useState(false);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    console.log(searchParams);
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      setIsLoading(false);
      return;
    }

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to verify OTP");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setSuccess("Email verified successfully! Redirecting to sign-in...");
      router.push("/auth/login");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setisResetLoading(true);

    if (!email) {
      setError("Email is required to resend OTP");
      setisResetLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      setisResetLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to resend OTP");
        setisResetLoading(false);
        return;
      }

      setSuccess("A new OTP has been sent to your email.");
      setisResetLoading(false);
      setResendTimer(60);
    } catch (err) {
      setError("An unexpected error occurred while resending OTP.");
      setisResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter the 6-digit OTP sent to your email to complete registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-center tracking-wider"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center">{success}</p>
            )}
            <Button
              type="submit"
              className="w-full  text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
          <Button
            variant="outline"
            className="mt-4 w-full border-gray-300  hover:bg-blue-50"
            onClick={handleResendOtp}
            disabled={isResetLoading || !email || resendTimer > 0}
          >
            {isResetLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending OTP...
              </>
            ) : resendTimer > 0 ? (
              `Resend OTP (${resendTimer}s)`
            ) : (
              "Resend OTP"
            )}
          </Button>

          <p className="mt-4 text-center text-sm text-gray-600">
            Didn't receive the OTP? Check your spam folder or click "Resend
            OTP".
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already verified?{" "}
            <a href="/auth/login" className="text-blue-500 hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
