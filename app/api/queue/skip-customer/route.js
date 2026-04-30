import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import QueueEntry from "@/models/QueueEntry";
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

    const currentEntry =
      await QueueEntry.findById(
        body.entryId
      );

    if (!currentEntry) {
      return Response.json({
        success: false,
        message:
          "Entry not found",
      });
    }

    const queueSession =
      await QueueSession.findById(
        currentEntry.sessionId
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
      currentEntry.status !==
      "called"
    ) {
      return Response.json({
        success: false,
        message:
          "Only called customers can be skipped",
      });
    }

    currentEntry.status =
      "skipped";

    await currentEntry.save();

    queueSession.currentToken =
      0;

    await queueSession.save();

    return Response.json({
      success: true,
      entry: currentEntry,
      message:
        "Customer skipped",
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