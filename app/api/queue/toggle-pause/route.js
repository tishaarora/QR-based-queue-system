import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import QueueSession from "@/models/QueueSession";

export async function POST(req) {
  try {
    const session =
      await getServerSession();

    if (!session) {
      return Response.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const queueSession =
      await QueueSession.findById(
        body.sessionId
      );

    if (!queueSession) {
      return Response.json({
        success: false,
        message:
          "Session not found",
      });
    }

    if (
      queueSession.status ===
      "active"
    ) {
      queueSession.status =
        "paused";

      queueSession.pauseReason =
        body.pauseReason || "";

      queueSession.resumeAt =
        body.resumeAt || "";
    } else if (
      queueSession.status ===
      "paused"
    ) {
      queueSession.status =
        "active";

      queueSession.pauseReason =
        "";

      queueSession.resumeAt =
        "";
    }

    await queueSession.save();

    return Response.json({
      success: true,
      session: queueSession,
      message:
        queueSession.status ===
        "paused"
          ? "Queue paused"
          : "Queue resumed",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error.message,
      },
      { status: 500 }
    );
  }
}