"use client";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import ProfileCard from "@/components/ProfileCard";

export default function JoinQueuePage() {
  const params = useParams();
  const router = useRouter();

  const [entry, setEntry] =
    useState(null);

  const [queueInfo, setQueueInfo] =
    useState(null);

  const [peopleAhead, setPeopleAhead] =
    useState(0);

  const [activeSession, setActiveSession] =
    useState(null);

  const previousStatus =
  useRef(null);

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
      setQueueInfo(
        data.queue
      );
      setPeopleAhead(
        data.peopleAhead || 0
      );
    }
  };

  useEffect(() => {
    if (!params.slug) return;

    checkEntry();

    const interval =
      setInterval(() => {
        checkEntry();
      }, 5000);

    return () =>
      clearInterval(
        interval
      );
  }, [params.slug]);

  useEffect(() => {
    if (
      entry?.status ===
        "called" &&
      previousStatus.current !==
        "called"
    ) {
      const audio =
        new Audio(
          "/notification.mp3"
        );

      audio.play();

      alert(
        "It's your turn!"
      );
    }

    previousStatus.current =
      entry?.status;
  }, [entry]);

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
      const allowNotifications =
        confirm(
          "Enable notifications to get alerted when your token is called."
        );

      if (allowNotifications) {
        await subscribeToPush();
      }
      setEntry(
        data.queueEntry
      );
      await checkEntry();
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

const handleCancel =
  async () => {
    const res = await fetch(
      "/api/queue/cancel-entry",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          entryId:
            entry._id,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      await checkEntry();

      alert(
        "Queue cancelled"
      );
    } else {
      alert(
        data.message ||
          data.error
      );
    }
  };

  const subscribeToPush =
  async () => {
    if (
      !(
        "serviceWorker" in
          navigator &&
        "PushManager" in
          window
      )
    ) {
      return;
    }

    const registration =
      await navigator.serviceWorker.register(
        "/sw.js"
      );

    const permission =
      await Notification.requestPermission();

    if (
      permission !==
      "granted"
    ) {
      return;
    }

    const subscription =
      await registration.pushManager.subscribe(
        {
          userVisibleOnly: true,
          applicationServerKey:
            process.env
              .NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        }
      );

    await fetch(
      "/api/push/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          subscription,
        }),
      }
    );
  };

  const canJoin =
    activeSession?.status ===
      "active" &&
    (
      !entry ||
      entry.status ===
        "completed" ||
      entry.status ===
        "cancelled" ||
      entry.status ===
        "skipped"
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

      {queueInfo && (
      <div className="mt-4 border p-4 rounded">
        <p>
          Business:
          {
            queueInfo.businessName
          }
        </p>

        <p>
          Queue:
          {
            queueInfo.queueName
          }
        </p>

        {activeSession && (
          <p>
            Session:
            {
              activeSession.sessionName
            }
          </p>
        )}
      </div>
    )}

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

          {entry.status ===
            "waiting" && (
            <p>
              People Ahead:
              {peopleAhead}
            </p>
          )}
          {entry.status ===
            "waiting" && (
            <button
              onClick={
                handleCancel
              }
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Cancel Queue
            </button>
          )}

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

      {entry?.status ===
        "skipped" && (
        <div className="mt-6 border p-4 rounded">
          <p>
            You were skipped.
          </p>

          <p>
            You can rejoin the
            queue now.
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