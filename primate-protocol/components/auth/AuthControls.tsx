"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { isAuthConfigured } from "@/lib/env";

const baseButton =
  "rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60";

export function AuthControls() {
  if (!isAuthConfigured) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className={`${baseButton} border border-slate-700 text-slate-100 hover:border-emerald-300 hover:text-emerald-200`}
            type="button"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button
            className={`${baseButton} bg-emerald-400 text-slate-950 hover:bg-emerald-300`}
            type="button"
          >
            Create account
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
