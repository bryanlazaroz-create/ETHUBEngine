"use client";

import type { ReactNode } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { clerkPublishableKey, convexUrl, isAuthConfigured } from "@/lib/env";

const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  if (!isAuthConfigured || !convexClient) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or NEXT_PUBLIC_CONVEX_URL."
      );
    }
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
