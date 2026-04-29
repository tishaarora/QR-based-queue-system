import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async signIn({ user, profile }) {
      await connectDB();

      const existingUser = await User.findOne({
        email: user.email
      });

      if (!existingUser) {
        await User.create({
          googleId: profile.sub,
          email: user.email,
          displayName: user.name
        });
      }

      return true;
    }
  }
});

export { handler as GET, handler as POST };