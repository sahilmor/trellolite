import { PlanProvider } from "@/lib/context/PlanContext";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { has } = await auth();
    const hasProPlan = has({ plan: "pro_user"});
    const hasEnterprisePlan = has({ plan: "enterprise_user"});

    return <PlanProvider hasEnterprisePlan={hasEnterprisePlan} hasProPlan={hasProPlan}>{children}</PlanProvider>
}
