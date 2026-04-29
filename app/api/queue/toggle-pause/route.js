import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import QueueSession from "@/models/QueueSession";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Queue from "@/models/Queue";

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

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    const businessProfile =
      await BusinessProfile.findOne(
        {
          ownerId: user._id,
        }
      );

    if (!businessProfile) {
      return Response.json(
        {
          success: false,
          message:
            "Business profile not found",
        },
        { status: 403 }
      );
    }

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

    const queue =
      await Queue.findById(
        queueSession.queueId
      );

    if (
      !queue ||
      queue.businessProfileId.toString() !==
        businessProfile._id.toString()
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Forbidden",
        },
        { status: 403 }
      );
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