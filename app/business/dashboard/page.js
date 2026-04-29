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

  const [sessionInputs, setSessionInputs] =
    useState({});

  const [sessionId, setSessionId] =
    useState("");

  const [selectedQueueName, setSelectedQueueName] =
    useState("");

  const [activeSessionName, setActiveSessionName] =
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
    if (!sessionId) return;

    fetchEntries();

    const interval =
      setInterval(() => {
        fetchEntries();
      }, 5000);

    return () =>
      clearInterval(
        interval
      );
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

  const handleSessionInputChange =
    (queueId, value) => {
      setSessionInputs({
        ...sessionInputs,
        [queueId]: value,
      });
    };

  const handleStartSession =
    async (queue) => {
      const sessionName =
        sessionInputs[queue._id];

      if (!sessionName?.trim()) {
        alert(
          "Enter session name"
        );
        return;
      }

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
            sessionName,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSessionId(
          data.session._id
        );

        setSelectedQueueName(
          queue.queueName
        );

        setActiveSessionName(
          data.session.sessionName
        );

        fetchQueues();
      }
    };

  const handleOpenSession =
    async (queue) => {
      setSessionId(
        queue.activeSession._id
      );

      setSelectedQueueName(
        queue.queueName
      );

      setActiveSessionName(
        queue.activeSession
          .sessionName
      );
    };

const handleResetQueue =
  async (queue) => {
    const newSessionName =
      prompt(
        "Enter new session name"
      );

    if (!newSessionName?.trim())
      return;

    const res = await fetch(
      "/api/queue/reset-session",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          sessionId:
            queue.activeSession
              ._id,
          sessionName:
            newSessionName,
        }),
      }
    );

    const data = await res.json();

    console.log(
      "RESET RESPONSE:",
      data
    );

    if (data.success) {
      setSessionId(
        data.session._id
      );

      setSelectedQueueName(
        queue.queueName
      );

      setActiveSessionName(
        data.session.sessionName
      );

      setEntries([]);

      fetchQueues();

      alert(
        "Session reset successfully"
      );
    } else {
      alert(
        data.message ||
          data.error
      );
    }
  };

const handleTogglePause =
  async (queue) => {
    let pauseReason = "";
    let resumeAt = "";

    if (
      queue.activeSession
        .status === "active"
    ) {
      pauseReason = prompt(
        "Why are you pausing the queue?"
      );

      if (
        !pauseReason?.trim()
      )
        return;

      resumeAt = prompt(
        "When will the queue resume?"
      );

      if (!resumeAt?.trim())
        return;
    }

    const res = await fetch(
      "/api/queue/toggle-pause",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          sessionId:
            queue.activeSession
              ._id,
          pauseReason,
          resumeAt,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      fetchQueues();

      if (
        sessionId ===
        queue.activeSession._id
      ) {
        setActiveSessionName(
          data.session.sessionName
        );
      }

      alert(data.message);
    } else {
      alert(
        data.message ||
          data.error
      );
    }
  };

const handleCloseQueue =
  async (queue) => {
    const res = await fetch(
      "/api/queue/close-session",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          sessionId:
            queue.activeSession
              ._id,
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      if (
        sessionId ===
        queue.activeSession._id
      ) {
        setSessionId("");
        setEntries([]);
        setSelectedQueueName("");
        setActiveSessionName("");
      }

      fetchQueues();

      alert(data.message);
    } else {
      alert(
        data.message ||
          data.error
      );
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

      if (data.success) {
        fetchEntries();
      }
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

        <button className="ml-2 bg-black text-white px-4 py-2">
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

            {!queue.activeSession ? (
              <>
                <input
                  value={
                    sessionInputs[
                      queue._id
                    ] || ""
                  }
                  onChange={(e) =>
                    handleSessionInputChange(
                      queue._id,
                      e.target.value
                    )
                  }
                  placeholder="Session Name"
                  className="border p-2 mt-2"
                />
                
                <button
                  onClick={() =>
                    handleStartSession(
                      queue
                    )
                  }
                  className="mt-2 ml-2 bg-green-500 text-white px-4 py-2"
                >
                  Start Session
                </button>
              </>
            ) : (
              <>
                <p className="mt-2">
                  Active Session:
                  {
                    queue
                      .activeSession
                      .sessionName
                  }
                </p>
                <p>
                  Status:
                  {
                    queue.activeSession
                      .status
                  }
                </p>
                <button
                  onClick={() =>
                    handleOpenSession(
                      queue
                    )
                  }
                  className="mt-2 bg-blue-500 text-white px-4 py-2"
                >
                  Open Session
                </button>

                <button
                  onClick={() =>
                    handleResetQueue(
                      queue
                    )
                  }
                  className="mt-2 ml-2 bg-red-500 text-white px-4 py-2"
                >
                  Reset Session
                </button>
                <button
                  onClick={() =>
                    handleTogglePause(
                      queue
                    )
                  }
                  className="mt-2 ml-2 bg-yellow-500 text-white px-4 py-2"
                >
                  {queue.activeSession
                    .status ===
                  "paused"
                    ? "Resume Queue"
                    : "Pause Queue"}
                </button>
                <button
                onClick={() =>
                  handleCloseQueue(
                    queue
                  )
                }
                className="mt-2 ml-2 bg-gray-700 text-white px-4 py-2"
              >
                Close Queue
              </button>
              </>
            )}
          </div>
        ))}
      </div>

      {sessionId && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">
            Active Queue:
            {selectedQueueName}
          </h2>

          <p>
            Session:
            {activeSessionName}
          </p>

          <button
            onClick={
              handleCallNext
            }
            className="mt-4 bg-black text-white px-4 py-2"
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