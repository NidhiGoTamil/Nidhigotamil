import {NextRequest,NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized,cleanFilters,applyFilters} from "@/lib/admin-api";
import {z} from "zod";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 if(!await adminGuard())return unauthorized();
 try{const filters=cleanFilters(request);const page=Math.max(1,Math.min(Number(request.nextUrl.searchParams.get("page")||1)||1,100000));const size=50;
  const db=adminDb();let query=db.from("applications").select("id,created_at,full_name,email,phone,category,offer_title,purpose,message,status,admin_notes",{count:"exact"}).order("created_at",{ascending:false});
  query=applyFilters(query,filters);const {data,count,error}=await query.range((page-1)*size,page*size-1);if(error)throw error;
  return NextResponse.json({applications:data??[],count:count||0,page,pageSize:size},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to list enquiries"},{status:400})}
}
const patchSchema=z.object({id:z.string().uuid(),status:z.enum(["new","contacted","closed"]),admin_notes:z.string().max(2000).optional()});
export async function PATCH(request:NextRequest){
 if(!await adminGuard())return unauthorized();
 const parsed=patchSchema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid update"},{status:400});
 const {id,...updates}=parsed.data;const {error}=await adminDb().from("applications").update(updates).eq("id",id);if(error)return NextResponse.json({error:error.message},{status:500});
 return NextResponse.json({ok:true});
}
