import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Queue from "@/models/Queue";
import QueueSession from "@/models/QueueSession";

export async function GET() {
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
          success: false,
          message:
            "Business profile not found",
        },
        { status: 403 }
      );
    }

    const queues =
      await Queue.find({
        businessProfileId:
          businessProfile._id,
      });

    const queuesWithSessions =
      await Promise.all(
        queues.map(
          async (queue) => {
            const activeSession =
              await QueueSession.findOne(
                {
                  queueId:
                    queue._id,
                  status: {
                    $in: [
                      "active",
                      "paused",
                    ],
                  },
                }
              ).sort({
                createdAt:
                  -1,
              });

            return {
              ...queue.toObject(),
              activeSession:
                activeSession ||
                null,
            };
          }
        )
      );

    return Response.json({
      success: true,
      queues:
        queuesWithSessions,
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