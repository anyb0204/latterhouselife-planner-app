import { clerkMiddleware } from "@clerk/nextjs/server";

// Populates Clerk's auth context for every request. Actual access control
// happens per-page/route (see dashboard/page.tsx and the api/stripe/*
// routes) rather than via path matching here, per Clerk's guidance that
// middleware-based route matching can drift from real routing.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/", "/(api|trpc)(.*)"],
};
