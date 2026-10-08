import {z} from "zod";
import {CATEGORY_ORDER} from "./config";
const httpsUrl=z.union([z.literal(""),z.string().trim().url().refine(u=>u.startsWith("https://"),"HTTPS URL required")]).nullable().transform(u=>u||null);
export const offerSchema=z.object({
  slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(3).max(150),category:z.enum(CATEGORY_ORDER),
  title:z.string().trim().min(3).max(180),provider_name:z.string().trim().max(120),description:z.string().trim().max(2500),
  highlight:z.string().trim().max(280).default(""),logo_url:httpsUrl,
  benefits:z.array(z.string().trim().max(250)).max(15),documents:z.array(z.string().trim().max(250)).max(15),steps:z.array(z.string().trim().max(250)).max(15),
  tutorial_url:httpsUrl,affiliate_url:httpsUrl,is_demo:z.boolean().default(false),published:z.boolean().default(false)
});
