import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

export async function POST(req) {
  const session = await getServerSession();
  const body = await req.json();

  await connectDB();

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    {
      displayName: body.displayName,
      phoneNumber: body.phoneNumber,
      profileCompleted: true
    },
    { new: true }
  );

  if (body.accountType === "business") {
    const existingBusiness =
      await BusinessProfile.findOne({
        ownerId: user._id
      });

    if (!existingBusiness) {
      await BusinessProfile.create({
        ownerId: user._id,
        businessName: body.businessName
      });
    }
  }

  return Response.json({
    success: true
  });
}