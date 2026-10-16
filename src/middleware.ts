// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If a Division tries to access the Syndicate route, kick them back
    if (path.startsWith("/syndicate") && token?.role !== "DISTRICT") {
      return NextResponse.redirect(new URL("/division", req.url));
    }

    // If District tries to access Division route, kick them to their dashboard
    if (path.startsWith("/division") && token?.role !== "DIVISION") {
      return NextResponse.redirect(new URL("/syndicate", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Requires login for matched routes
    },
  }
);

// Protect these specific routes
export const config = {
  matcher: ["/syndicate/:path*", "/division/:path*"],
};