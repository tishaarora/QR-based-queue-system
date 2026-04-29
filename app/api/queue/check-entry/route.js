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

    const activeSession =
    await QueueSession.findOne({
      queueId: queue._id,
      status: "active",
    }).sort({
      createdAt: -1,
    });

    const existingEntry =
    await QueueEntry.findOne({
      sessionId: activeSession._id,
      customerId: user._id,
    }).sort({
      createdAt: -1,
    });

    return Response.json({
      success: true,
      entry: existingEntry || null,
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