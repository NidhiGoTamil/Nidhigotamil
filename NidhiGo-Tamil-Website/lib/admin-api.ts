import {NextRequest,NextResponse} from "next/server";
import {requireAdmin} from "./supabase";
import {CATEGORY_ORDER} from "./config";
export const unauthorized=()=>NextResponse.json({error:"Not authorized. Admin sign-in required."},{status:401});
export async function adminGuard(){return Boolean(await requireAdmin())}
export function cleanFilters(request:NextRequest){
 const q=request.nextUrl.searchParams;
 const category=q.get("category")||"";
 const from=q.get("from")||"";
 const to=q.get("to")||"";
 if(category&&!CATEGORY_ORDER.includes(category as any))throw Error("Invalid category");
 if((from&&!/^\d{4}-\d{2}-\d{2}$/.test(from))||(to&&!/^\d{4}-\d{2}-\d{2}$/.test(to)))throw Error("Invalid date format");
 if(from&&to&&from>to)throw Error("Start date must be before end date");
 // Dates picked by the admin represent calendar dates in India Standard Time.
 const fromUtc=from?new Date(`${from}T00:00:00+05:30`).toISOString():null;
 const toUtc=to?new Date(new Date(`${to}T00:00:00+05:30`).getTime()+24*60*60*1000).toISOString():null;
 return {category,from,to,fromUtc,toUtc,search:(q.get("search")||"").slice(0,80).replace(/[%_,()]/g,"")};
}
export function applyFilters(query:any,filters:ReturnType<typeof cleanFilters>){
 if(filters.category)query=query.eq("category",filters.category);
 if(filters.fromUtc)query=query.gte("created_at",filters.fromUtc);
 if(filters.toUtc)query=query.lt("created_at",filters.toUtc);
 if(filters.search)query=query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
 return query;
}
