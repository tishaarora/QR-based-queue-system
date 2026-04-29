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

    const entries =
      await QueueEntry.find({
        sessionId: body.sessionId,
      })
        .populate("customerId")
        .sort({
          tokenNumber: 1,
        });

    return Response.json({
      success: true,
      entries,
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