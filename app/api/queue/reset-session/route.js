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

    const activeSession =
      await QueueSession.findById(
        body.sessionId
      );

    if (!activeSession) {
      return Response.json({
        success: false,
        message:
          "Session not found",
      });
    }

    const queue =
      await Queue.findById(
        activeSession.queueId
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

    activeSession.status =
      "closed";

    await activeSession.save();

    const newSession =
      await QueueSession.create({
        queueId:
          activeSession.queueId,
        sessionName:
          body.sessionName,
        status: "active",
        currentToken: 0,
        lastToken: 0,
      });

    return Response.json({
      success: true,
      session: newSession,
      message:
        "Queue reset successfully",
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