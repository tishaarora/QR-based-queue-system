import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";

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

    const body =
      await req.json();

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "User not found",
        },
        { status: 404 }
      );
    }

    user.pushSubscription =
      body.subscription;

    await user.save();

    return Response.json({
      success: true,
      message:
        "Push subscription saved",
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