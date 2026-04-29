"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleLogin = (type) => {
    localStorage.setItem("accountType", type);
    signIn("google", {
      callbackUrl: "/post-auth"
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Queue System</h1>

        <button
          onClick={() => handleLogin("customer")}
          className="w-full rounded bg-blue-500 px-4 py-2 text-white"
        >
          Continue as Customer
        </button>

        <button
          onClick={() => handleLogin("business")}
          className="w-full rounded bg-green-500 px-4 py-2 text-white"
        >
          Register as Business
        </button>
      </div>
    </div>
  );
}