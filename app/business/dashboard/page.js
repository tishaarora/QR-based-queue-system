"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import ProfileCard from "@/components/ProfileCard";
import { useRouter } from "next/navigation";

export default function BusinessDashboard() {
  const [queueName, setQueueName] =
    useState("");

  const [queues, setQueues] =
    useState([]);

  const [entries, setEntries] =
    useState([]);

  const [sessionId, setSessionId] =
    useState("");

  const [selectedQueueId, setSelectedQueueId] =
    useState("");

  const [selectedQueueName, setSelectedQueueName] =
    useState("");

  const [authorized, setAuthorized] =
    useState(false);

  const router = useRouter();

  const checkBusinessAccess =
    async () => {
      const res = await fetch(
        "/api/business/me"
      );

      const data = await res.json();

      if (
        !data.success ||
        !data.businessProfile
      ) {
        router.replace(
          "/dashboard"
        );
        return;
      }

      setAuthorized(true);
    };

  const fetchQueues = async () => {
    const res = await fetch(
      "/api/queue/my-queues"
    );

    const data = await res.json();

    if (data.success) {
      setQueues(data.queues);
    }
  };

  const fetchEntries = async () => {
    if (!sessionId) return;

    const res = await fetch(
      "/api/queue/session-entries",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      setEntries(data.entries);
    }
  };

  useEffect(() => {
    checkBusinessAccess();
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchQueues();
    }
  }, [authorized]);

  useEffect(() => {
    if (sessionId) {
      fetchEntries();
    }
  }, [sessionId]);

  const handleCreateQueue =
    async (e) => {
      e.preventDefault();

      await fetch(
        "/api/queue/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            queueName,
          }),
        }
      );

      setQueueName("");
      fetchQueues();
    };

  const handleSelectQueue =
    async (queue) => {
      const res = await fetch(
        "/api/queue/start-session",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            queueId: queue._id,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSelectedQueueId(
          queue._id
        );

        setSelectedQueueName(
          queue.queueName
        );

        setEntries([]);

        setSessionId(
          data.session._id
        );

        alert(
          data.message ||
            "Queue selected"
        );
      } else {
        alert(data.message);
      }
    };

  const handleCallNext =
    async () => {
      const res = await fetch(
        "/api/queue/call-next",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sessionId,
          }),
        }
      );

      const data = await res.json();

      alert(
        data.success
          ? `Calling token ${data.queueEntry.tokenNumber}`
          : data.message
      );

      fetchEntries();
    };

  const handleCompleteCustomer =
    async (entryId) => {
      const res = await fetch(
        "/api/queue/complete-customer",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            entryId,
          }),
        }
      );

      const data = await res.json();

      alert(
        data.success
          ? "Customer completed"
          : data.message
      );

      fetchEntries();
    };

  if (!authorized) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">
          Business Dashboard
        </h1>

        <LogoutButton />
      </div>

      <div className="mt-6">
        <ProfileCard businessName="Ishy Cafe" />
      </div>

      <form
        onSubmit={
          handleCreateQueue
        }
        className="mt-6"
      >
        <input
          value={queueName}
          onChange={(e) =>
            setQueueName(
              e.target.value
            )
          }
          placeholder="Queue Name"
          className="border p-2"
        />

        <button
          className="ml-2 bg-black text-white px-4 py-2"
        >
          Create
        </button>
      </form>

      <div className="mt-8">
        {queues.map((queue) => (
          <div
            key={queue._id}
            className="border p-4 mb-4"
          >
            <h2>
              {queue.queueName}
            </h2>

            <p>
              {queue.qrCodeUrl}
            </p>

            <button
              onClick={() =>
                handleSelectQueue(
                  queue
                )
              }
              className="mt-2 bg-green-500 text-white px-4 py-2"
            >
              Select Queue
            </button>
          </div>
        ))}
      </div>

      {sessionId && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Active Queue:
            {selectedQueueName}
          </h2>

          <button
            onClick={
              handleCallNext
            }
            className="bg-blue-500 text-white px-4 py-2"
          >
            Call Next
          </button>
        </div>
      )}

      <div className="mt-8">
        {entries.map((entry) => (
          <div
            key={entry._id}
            className="border p-4 mb-2"
          >
            <p>
              Token:
              {entry.tokenNumber}
            </p>

            <p>
              Name:
              {
                entry.customerId
                  .displayName
              }
            </p>

            <p>
              Status:
              {entry.status}
            </p>

            {entry.status ===
              "called" && (
              <button
                onClick={() =>
                  handleCompleteCustomer(
                    entry._id
                  )
                }
                className="mt-2 bg-purple-500 text-white px-4 py-2"
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}