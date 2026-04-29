import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import QueueEntry from "@/models/QueueEntry";

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

    const queueEntry =
      await QueueEntry.findById(
        body.entryId
      );

    if (!queueEntry) {
      return Response.json({
        success: false,
        message:
          "Queue entry not found",
      });
    }

    if (
      queueEntry.status !==
      "waiting"
    ) {
      return Response.json({
        success: false,
        message:
          "Only waiting entries can be cancelled",
      });
    }

    queueEntry.status =
      "cancelled";

    await queueEntry.save();

    return Response.json({
      success: true,
      message:
        "Queue cancelled successfully",
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