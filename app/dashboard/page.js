import LogoutButton from "@/components/LogoutButton";
import ProfileCard from "@/components/ProfileCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">
        Customer Dashboard
      </h1>

      <p className="mt-4">
        Welcome to your queue dashboard.
      </p>

      <div className="mt-6">
        <ProfileCard />
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}