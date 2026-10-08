import {NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase";
import {CATEGORY_ORDER} from "@/lib/config";
import {adminGuard,unauthorized} from "@/lib/admin-api";
export const dynamic="force-dynamic";
export async function GET(){if(!await adminGuard())return unauthorized();try{
 const db=adminDb();const dateParts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
 const pick=(type:string)=>dateParts.find(p=>p.type===type)!.value;
 const istDate=`${pick("year")}-${pick("month")}-${pick("day")}`;
 const start=new Date(istDate+"T00:00:00+05:30");
 const [total,today,counts]=await Promise.all([
  db.from("applications").select("id",{count:"exact",head:true}),
  db.from("applications").select("id",{count:"exact",head:true}).gte("created_at",start.toISOString()),
  Promise.all(CATEGORY_ORDER.map(async slug=>{const {count,error}=await db.from("applications").select("id",{count:"exact",head:true}).eq("category",slug);if(error)throw error;return {slug,count:count||0}}))
 ]);
 if(total.error||today.error)throw(total.error||today.error);
 return NextResponse.json({total:total.count||0,today:today.count||0,categories:counts},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:"Could not load stats"},{status:500})}}
