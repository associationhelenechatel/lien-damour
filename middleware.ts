import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isOnboardingApiRoute = createRouteMatcher([
  "/api/onboarding(.*)",
]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();

  // Users who already completed onboarding must not see /onboarding → redirect home
  if (
    isAuthenticated &&
    isOnboardingRoute(req) &&
    sessionClaims?.metadata?.familyMemberId
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Authenticated users on /onboarding (without familyMemberId) can proceed
  if (isAuthenticated && isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  // If the user isn't signed in and the route is private, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute(req))
    return redirectToSignIn({ returnBackUrl: req.url });

  // Catch users who do not have `familyMemberId: true` in their publicMetadata
  // Redirect them to the /onboarding route to complete onboarding
  // BUT exclude onboarding API routes from this check

  if (
    isAuthenticated &&
    !sessionClaims?.metadata?.familyMemberId &&
    !isOnboardingApiRoute(req)
  ) {
    const onboardingUrl = new URL("/onboarding", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // If the user is logged in and the route is protected, let them view.
  if (isAuthenticated && !isPublicRoute(req)) return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
