"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [accountType, setAccountType] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setDisplayName(session.user.name);
    }

    const type = localStorage.getItem("accountType");
    setAccountType(type || "");
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/user/complete-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        displayName,
        phoneNumber,
        businessName,
        accountType,
      }),
    });

    if (res.ok) {
      if (accountType === "business") {
        router.push("/business/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-96"
      >
        <h1 className="text-2xl font-bold">
          Complete Profile
        </h1>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display Name"
          className="w-full border p-2"
        />

        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          className="w-full border p-2"
        />

        {accountType === "business" && (
          <input
            value={businessName}
            onChange={(e) =>
              setBusinessName(e.target.value)
            }
            placeholder="Business Name"
            className="w-full border p-2"
          />
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Continue
        </button>
      </form>
    </div>
  );
}