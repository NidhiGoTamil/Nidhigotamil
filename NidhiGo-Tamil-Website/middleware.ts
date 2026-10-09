import {NextRequest,NextResponse} from "next/server";

// Supplement cookie-based admin auth with an origin check on state-changing
// admin requests. It does not replace authorization in each API route.
export function middleware(request:NextRequest){
 const method=request.method.toUpperCase();
 if(!["POST","PUT","PATCH","DELETE"].includes(method))return NextResponse.next();
 const origin=request.headers.get("origin");
 const fetchSite=request.headers.get("sec-fetch-site");
 if(!origin||fetchSite==="cross-site"){
  return NextResponse.json({error:"Invalid request origin"},{status:403});
 }
 try{
  const caller=new URL(origin);
  const destination=request.nextUrl;
  const allowedProtocol=caller.protocol===destination.protocol;
  const allowedHost=caller.host===destination.host;
  if(!allowedProtocol||!allowedHost)
   return NextResponse.json({error:"Invalid request origin"},{status:403});
 }catch{
  return NextResponse.json({error:"Invalid request origin"},{status:403});
 }
 return NextResponse.next();
}

export const config={matcher:["/api/admin/:path*"]};
