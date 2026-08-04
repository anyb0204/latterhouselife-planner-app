export type PlannerPublicMetadata = {
  premium?: boolean;
  stripeStatus?: string;
};

export type PlannerPrivateMetadata = {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export function isPremium(publicMetadata: unknown): boolean {
  return (publicMetadata as PlannerPublicMetadata | null | undefined)?.premium === true;
}
