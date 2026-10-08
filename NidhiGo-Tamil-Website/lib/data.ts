import { publicDb } from "./supabase";
import { demoOffers,demoSettings,categories,type Offer } from "./demo";
import type { CategorySlug } from "./config";
export async function getOffers(category?:CategorySlug):Promise<Offer[]>{
  const db=publicDb();
  if(!db) return category?demoOffers.filter(o=>o.category===category):demoOffers;
  let query=db.from("offers").select("*").eq("published",true).order("created_at",{ascending:false});
  if(category) query=query.eq("category",category);
  const {data,error}=await query;
  if(error){console.error("Could not fetch public offers",error.message);return []}
  return (data??[]) as Offer[];
}
export async function getOffer(slug:string):Promise<Offer|null>{
  const db=publicDb();
  if(!db) return demoOffers.find(o=>o.slug===slug)??null;
  const {data,error}=await db.from("offers").select("*").eq("slug",slug).eq("published",true).maybeSingle();
  if(error){console.error("Offer fetch error",error.message);return null}
  return data as Offer|null;
}
export async function getCategories(){
  const db=publicDb();
  if(!db) return categories;
  const {data,error}=await db.from("categories").select("slug,title,description,icon_url,emoji,accent").order("sort_order");
  return error?categories:(data??categories);
}
export async function getSettings(){
  const db=publicDb();
  if(!db) return demoSettings;
  const {data,error}=await db.from("site_settings").select("logo_url,banner_url,headline,subheadline,youtube_url,instagram_url,telegram_url,x_url").eq("id",1).maybeSingle();
  return error||!data?demoSettings:data;
}
