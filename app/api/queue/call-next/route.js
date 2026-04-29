import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

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

    // complete current called customer
    const currentCalled =
      await QueueEntry.findOne({
        sessionId: body.sessionId,
        status: "called",
      }).sort({
        tokenNumber: 1,
      });

    if (currentCalled) {
      currentCalled.status =
        "completed";

      await currentCalled.save();
    }

    // call next waiting customer
    const nextEntry =
      await QueueEntry.findOne({
        sessionId: body.sessionId,
        status: "waiting",
      }).sort({
        tokenNumber: 1,
      });

    if (!nextEntry) {
      return Response.json({
        success: false,
        message:
          "No waiting customers",
      });
    }

    nextEntry.status = "called";

    await nextEntry.save();

    return Response.json({
      success: true,
      queueEntry: nextEntry,
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