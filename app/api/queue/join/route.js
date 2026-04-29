import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import Queue from "@/models/Queue";
import QueueSession from "@/models/QueueSession";
import QueueEntry from "@/models/QueueEntry";

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const user = await User.findOne({
      email: session.user.email,
    });

    const queue = await Queue.findOne({
      queueSlug: body.queueSlug,
    });

    if (!queue) {
      return Response.json({
        success: false,
        message: "Queue not found",
      });
    }

    const activeSession =
      await QueueSession.findOne({
        queueId: queue._id,
        status: "active",
      });

    if (!activeSession) {
      return Response.json({
        success: false,
        message:
          "No active session found",
      });
    }
    
    const existingEntry =
    await QueueEntry.findOne({
      sessionId: activeSession._id,
      customerId: user._id,
      status: {
        $in: ["waiting", "called"],
      },
    });

  if (existingEntry) {
    return Response.json({
      success: false,
      message:
        "You are already in the queue",
    });
  }

    const nextToken =
      (activeSession.lastToken || 0) + 1;

    activeSession.lastToken =
      nextToken;

    await activeSession.save();

    const queueEntry =
      await QueueEntry.findOneAndUpdate(
        {
          sessionId:
            activeSession._id,
          customerId:
            user._id,
          status: {
            $in: [
              "waiting",
              "called",
            ],
          },
        },
        {
          $setOnInsert: {
            sessionId:
              activeSession._id,
            customerId:
              user._id,
            tokenNumber:
              nextToken,
            status:
              "waiting",
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

    return Response.json({
      success: true,
      tokenNumber: nextToken,
      queueEntry,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}