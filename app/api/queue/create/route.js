import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Queue from "@/models/Queue";

function generateSlug(name) {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, "-") +
    "-" +
    Date.now()
  );
}

export async function POST(req) {
  try {
    const session =
      await getServerSession();

    if (!session) {
      return Response.json(
        {
          message:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const user =
      await User.findOne({
        email:
          session.user.email,
      });

    const businessProfile =
      await BusinessProfile.findOne(
        {
          ownerId: user._id,
        }
      );

    if (!businessProfile) {
      return Response.json(
        {
          message:
            "Business profile not found",
        },
        { status: 404 }
      );
    }

    const existingQueue =
      await Queue.findOne({
        businessProfileId:
          businessProfile._id,
        queueName:
          body.queueName.trim(),
      });

    if (existingQueue) {
      return Response.json(
        {
          success: false,
          message:
            "Queue name already exists",
        },
        { status: 400 }
      );
    }

    const slug =
      generateSlug(
        body.queueName.trim()
      );

    const queue =
      await Queue.create({
        businessProfileId:
          businessProfile._id,
        queueName:
          body.queueName.trim(),
        queueSlug: slug,
        qrCodeUrl:
          `/queue/${slug}`,
      });

    return Response.json({
      success: true,
      queue,
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