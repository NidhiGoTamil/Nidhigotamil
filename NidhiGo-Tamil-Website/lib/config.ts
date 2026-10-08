export const hasPublicSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasServerSupabase = Boolean(hasPublicSupabase && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const CATEGORY_ORDER = ["loan","bank-account","credit-card","demat-account","insurance","investment"] as const;
export type CategorySlug = typeof CATEGORY_ORDER[number];
export const CATEGORY_NAMES: Record<CategorySlug,string> = {
  "loan":"Loans", "bank-account":"Bank Accounts", "credit-card":"Credit Cards",
  "demat-account":"Demat Account", "insurance":"Insurance", "investment":"Investment"
};
export const IS_DEMO_TEXT = "Sample listing — replace with your verified product details before publishing.";
