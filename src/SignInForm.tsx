"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl bg-white/95 shadow-md border border-slate-200 px-6 py-7 space-y-5">
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">
            {flow === "signIn" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-xs text-secondary">
            {flow === "signIn"
              ? "Sign in to continue to your workspace."
              : "Sign up to start writing and publishing."}
          </p>
        </div>

        <form
          className="flex flex-col gap-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
              let toastTitle = "";
              if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
              }
              toast.error(toastTitle);
              setSubmitting(false);
            });
          }}
        >
          <label className="text-xs font-medium text-slate-700 space-y-1">
            Email
            <input
              className="auth-input-field"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="text-xs font-medium text-slate-700 space-y-1">
            Password
            <input
              className="auth-input-field"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </label>
          <button
            className="auth-button mt-1 h-11 text-sm"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? flow === "signIn"
                ? "Signing in..."
                : "Creating account..."
              : flow === "signIn"
                ? "Sign in"
                : "Sign up"}
          </button>
          <div className="text-center text-xs text-secondary mt-2">
            <span>
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center pt-1">
          <hr className="my-3 grow border-gray-200" />
          <span className="mx-3 text-secondary text-[11px] uppercase tracking-wide">
            or continue with
          </span>
          <hr className="my-3 grow border-gray-200" />
        </div>

        <button
          className="auth-button w-full h-10 text-xs font-medium"
          onClick={() => void signIn("anonymous")}
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}
