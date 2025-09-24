import { NextResponse } from "next/server";
import { decodeJwtToken } from "./lib/jwt";

export async function middleware(request) {
  try {
    const pathname = request.nextUrl?.pathname;
    const { method } = request;
    const PUBLIC_GET_PATHS = ["/api/admin/product", "/api/admin/categories"];
    if (!pathname) {
      return NextResponse.redirect(
        new URL("/auth/error?error=InvalidRequest", request.url)
      );
    }

    if (
      pathname.startsWith("/api/auth") ||
      pathname === "/auth/login" ||
      pathname === "/auth/error"
    ) {
      return NextResponse.next();
    }

    const isPublicGetRequest =
      (method === "GET" &&
        (PUBLIC_GET_PATHS.includes(pathname) ||
          pathname.startsWith("/api/hospitals/") ||
          pathname.startsWith("/api/admin/product/slug/") ||
          pathname.startsWith("/api/dashboard/doctors/doctor/") ||
          pathname.startsWith("/api/dashboard/blogs/") ||
          pathname.startsWith("/api/cities/"))) ||
      pathname.startsWith("/api/dashboard/doctors/specialties/slug/");

    if (isPublicGetRequest) {
      return NextResponse.next();
    }

    const { user, error } = await decodeJwtToken(request);
    if (error || !user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (pathname.startsWith("/dashboard")) {
      if (user.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware: Error", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.redirect(
      new URL("/auth/error?error=MiddlewareError", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/details",
    "/orders",
    "/checkout",
    "/cart",
    "/wishlist",
    "/api/:path*",
  ],
};
