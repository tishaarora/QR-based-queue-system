"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostAuthPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (!session?.user?.email) return;

      const accountType =
        localStorage.getItem("accountType");

      const res = await fetch("/api/user/me");
      const data = await res.json();

      const { user, businessProfile } = data;

      if (!user.profileCompleted) {
        router.push("/onboarding");
        return;
      }

      // business path but no business profile yet
      if (
        accountType === "business" &&
        !businessProfile
      ) {
        router.push("/onboarding");
        return;
      }

      // normal redirects
      if (accountType === "business") {
        router.push("/business/dashboard");
      } else {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [session, router]);

  return <div>Loading...</div>;
}