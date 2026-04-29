import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

export async function GET() {
  try {
    const session =
      await getServerSession();

    console.log(
      "SESSION:",
      session
    );

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

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    console.log(
      "USER:",
      user
    );

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

    const businessProfile =
      await BusinessProfile.findOne(
        {
          ownerId: user._id,
        }
      );

    console.log(
      "BUSINESS PROFILE:",
      businessProfile
    );

    return Response.json({
      success: true,
      businessProfile:
        businessProfile || null,
    });
  } catch (error) {
    console.log(
      "ERROR:",
      error
    );

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