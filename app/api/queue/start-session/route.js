import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import Queue from "@/models/Queue";
import QueueSession from "@/models/QueueSession";

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

    const existingSession =
      await QueueSession.findOne({
        queueId: body.queueId,
        status: "active",
      });

    if (existingSession) {
    return Response.json({
      success: true,
      session: existingSession,
      message:
        "Session already active",
    });
  }

    const newSession =
      await QueueSession.create({
        queueId: body.queueId,
        status: "active",
        currentToken: 0,
      });

    return Response.json({
      success: true,
      session: newSession,
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