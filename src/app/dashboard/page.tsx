import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { currentPlan } from "@/lib/premium";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const plan = currentPlan(user?.publicMetadata);

  return (
    <DashboardClient
      firstName={user?.firstName ?? "there"}
      plan={plan}
    />
  );
}
