import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import BusinessProfile from "@/models/BusinessProfile";

export async function GET() {
  const session = await getServerSession();

  await connectDB();

  const user = await User.findOne({
    email: session.user.email
  });

  const businessProfile =
    await BusinessProfile.findOne({
      ownerId: user._id
    });

  return Response.json({
    user,
    businessProfile
  });
}