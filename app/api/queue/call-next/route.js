import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/sendEmail";
import QueueEntry from "@/models/QueueEntry";
import QueueSession from "@/models/QueueSession";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";
import Queue from "@/models/Queue";
import webpush from "@/lib/webPush";

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
    const queue =
      await Queue.findById(
        queueSession.queueId
      );

    if (
      !queue ||
      queue.businessProfileId.toString() !==
        businessProfile._id.toString()
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Forbidden",
        },
        { status: 403 }
      );
    }

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
      const queueSession =
        await QueueSession.findById(
          body.sessionId
        );

      if (queueSession) {
        queueSession.currentToken =
          0;

        await queueSession.save();
      }

      return Response.json({
        success: false,
        message:
          "No waiting customers",
      });
    }

    nextEntry.status = "called";

    await nextEntry.save();

    const customer =
      await User.findById(
        nextEntry.customerId
      );
      console.log(
        "CUSTOMER:",
        customer
      );

      console.log(
        "CUSTOMER EMAIL:",
        customer?.email
      );

    if (customer?.email) {
      await sendEmail({
        to: customer.email,
        subject:
          "It's your turn!",
        text:
          `Your token number ${nextEntry.tokenNumber} is now being served. Please proceed to the counter.`,
      });
    }

    if (
      customer?.pushSubscription
    ) {
      await webpush.sendNotification(
        customer.pushSubscription,
        JSON.stringify({
          title:
            "It's your turn!",
          body:
            `Token ${nextEntry.tokenNumber} is now being served.`,
        })
      );
    }

    queueSession.currentToken =
      nextEntry.tokenNumber;

    await queueSession.save();

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