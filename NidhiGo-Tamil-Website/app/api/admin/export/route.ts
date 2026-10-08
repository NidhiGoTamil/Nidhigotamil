import {NextRequest,NextResponse} from "next/server";
import ExcelJS from "exceljs";
import {adminDb} from "@/lib/supabase";
import {adminGuard,unauthorized,cleanFilters,applyFilters} from "@/lib/admin-api";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 if(!await adminGuard())return unauthorized();
 try{
  const filters=cleanFilters(request);
  const db=adminDb();const rows:any[]=[];
  // Supabase queries are page-limited by default. Explicitly page to preserve filtered results.
  for(let offset=0;offset<10000;offset+=500){
   let q=db.from("applications").select("created_at,full_name,email,phone,category,offer_title,purpose,message,status,admin_notes").order("created_at",{ascending:false});
   q=applyFilters(q,filters);const {data,error}=await q.range(offset,offset+499);if(error)throw error;
   rows.push(...(data||[]));if(!data||data.length<500)break;
  }
  const book=new ExcelJS.Workbook();book.creator="NidhiGo Tamil";book.created=new Date();
  const sheet=book.addWorksheet("Applications",{views:[{state:"frozen",ySplit:1}]});
  sheet.columns=[
   {header:"Date (IST)",key:"date",width:22},{header:"Full Name",key:"name",width:26},{header:"Email",key:"email",width:34},
   {header:"Phone",key:"phone",width:19},{header:"Category",key:"category",width:20},{header:"Product",key:"product",width:26},
   {header:"Purpose",key:"purpose",width:22},{header:"Message",key:"message",width:50},{header:"Status",key:"status",width:16},{header:"Admin Notes",key:"notes",width:36}
  ];
  const excelSafe=(s:any)=>{const value=String(s??"");return /^[\s]*[=+\-@]/.test(value)?"'"+value:value};
  for(const a of rows){
   const d=new Date(a.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
   sheet.addRow({date:d,name:excelSafe(a.full_name),email:excelSafe(a.email),phone:excelSafe(a.phone),category:a.category,product:excelSafe(a.offer_title),purpose:excelSafe(a.purpose),message:excelSafe(a.message),status:a.status,notes:excelSafe(a.admin_notes)});
  }
  sheet.getRow(1).font={bold:true,color:{argb:"FFFFFFFF"}};sheet.getRow(1).fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF07583F"}};sheet.autoFilter={from:"A1",to:"J1"};
  sheet.eachRow((row,n)=>{row.alignment={vertical:"middle",wrapText:true};if(n>1&&n%2===0)row.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFF1F8F4"}}});
  const out=await book.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(out),{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="nidhigo-applications-${filters.from||"all"}-${filters.to||"all"}.xlsx"`,"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Export failed"},{status:400})}
}
