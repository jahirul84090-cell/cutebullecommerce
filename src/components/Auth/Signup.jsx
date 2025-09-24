"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import Link from "next/link";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

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

  const handleCredentialsSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsCredentialsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setIsCredentialsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      setIsCredentialsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsCredentialsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsCredentialsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        setIsCredentialsLoading(false);
        return;
      }

      setSuccess("Account created! Check your email for OTP verification.");
      router.push(`/auth/otpverify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsCredentialsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Failed to initiate Google sign-up. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-gray-100">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Get started by creating your account with your details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleCredentialsSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
                aria-label="Full name"
              />
            </div>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
                aria-label="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
                aria-label="Password"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-gray-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                required
                aria-label="Confirm password"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-500 text-sm text-center font-medium">
                {success}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
              disabled={isCredentialsLoading || isGoogleLoading}
              aria-label="Sign up with email and password"
            >
              {isCredentialsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">
              Or continue with
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 rounded-lg transition-colors"
            onClick={handleGoogleSignUp}
            disabled={isCredentialsLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.31 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.67 7.67 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.67 1 4.01 3.33 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 space-y-2 pt-2">
            <p>
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-purple-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p>
              Forgot your password?{" "}
              <Link
                href="/auth/reset-password"
                className="text-purple-600 hover:underline"
              >
                Reset it
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
