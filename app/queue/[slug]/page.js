"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useState,
  useEffect,
} from "react";

import ProfileCard from "@/components/ProfileCard";

export default function JoinQueuePage() {
  const params = useParams();
  const router = useRouter();

  const [entry, setEntry] =
    useState(null);

  const [activeSession, setActiveSession] =
    useState(null);

  const checkEntry = async () => {
    const res = await fetch(
      "/api/queue/check-entry",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          queueSlug: params.slug,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setEntry(data.entry);

      setActiveSession(
        data.activeSession
      );
    }
  };

  useEffect(() => {
    if (params.slug) {
      checkEntry();
    }
  }, [params.slug]);

  const handleJoin = async () => {
    const res = await fetch(
      "/api/queue/join",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          queueSlug: params.slug,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setEntry(
        data.queueEntry
      );

      alert(
        `Your token number is ${data.tokenNumber}`
      );
    } else {
      alert(
        data.message ||
          data.error
      );
    }
  };

  const canJoin =
    activeSession?.status ===
      "active" &&
    (
      !entry ||
      entry.status ===
        "completed" ||
      entry.status ===
        "cancelled"
    );

  return (
    <div className="p-6">
      <button
        onClick={() =>
          router.push(
            "/dashboard"
          )
        }
        className="mb-6 border px-4 py-2 rounded"
      >
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold">
        Join Queue
      </h1>

      <div className="mt-6">
        <ProfileCard />
      </div>

      {!activeSession && (
        <div className="mt-6 border p-4 rounded">
          <p>
            No active session
            available right now.
          </p>
        </div>
      )}

      {activeSession?.status ===
        "paused" && (
        <div className="mt-6 border p-4 rounded">
          <p>
            Queue is paused
          </p>

          <p>
            Reason:
            {
              activeSession.pauseReason
            }
          </p>

          <p>
            Resumes at:
            {
              activeSession.resumeAt
            }
          </p>
        </div>
      )}

      {!canJoin && entry && (
        <div className="mt-6 border p-4 rounded">
          <p>
            Your Token:
            {entry.tokenNumber}
          </p>

          <p>
            Status:
            {entry.status}
          </p>
        </div>
      )}

      {entry?.status ===
        "completed" && (
        <div className="mt-6 border p-4 rounded">
          <p>
            Your previous queue is
            completed.
          </p>

          <p>
            You can join again.
          </p>
        </div>
      )}

      {canJoin && (
        <button
          onClick={handleJoin}
          className="mt-6 bg-black text-white px-4 py-2 rounded"
        >
          Join Queue
        </button>
      )}
    </div>
  );
}