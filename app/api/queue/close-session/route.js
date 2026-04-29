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

    queueSession.status =
      "closed";

    await queueSession.save();

    return Response.json({
      success: true,
      message:
        "Queue closed successfully",
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