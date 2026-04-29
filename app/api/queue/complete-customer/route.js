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

    if (
      currentEntry.status !==
      "called"
    ) {
      return Response.json({
        success: false,
        message:
          "Only called customers can be completed",
      });
    }

    currentEntry.status =
      "completed";

    await currentEntry.save();

    return Response.json({
      success: true,
      entry: currentEntry,
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