"use client";

import { useSession } from "next-auth/react";

export default function ProfileCard({
  businessName,
}) {
  const { data: session } =
    useSession();

  if (!session) return null;

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-bold">
        Profile
      </h2>

      <p className="mt-2">
        Name:
        {session.user.name}
      </p>

      <p>
        Email:
        {session.user.email}
      </p>

      {businessName && (
        <p>
          Business:
          {businessName}
        </p>
      )}
    </div>
  );
}