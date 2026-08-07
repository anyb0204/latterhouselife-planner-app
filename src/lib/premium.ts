export type PlanTier = "basic" | "premium";

export type PlannerPublicMetadata = {
  plan?: PlanTier | null;
  stripeStatus?: string;
};

export type PlannerPrivateMetadata = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export function currentPlan(publicMetadata: unknown): PlanTier | null {
  const plan = (publicMetadata as PlannerPublicMetadata | null | undefined)?.plan;
  return plan === "basic" || plan === "premium" ? plan : null;
}

export function hasUnlimitedHabits(plan: PlanTier | null): boolean {
  return plan !== null;
}

export function hasJournal(plan: PlanTier | null): boolean {
  return plan === "premium";
}
