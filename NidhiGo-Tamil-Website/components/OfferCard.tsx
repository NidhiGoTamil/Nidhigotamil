import Link from "next/link";
import {ArrowRight} from "lucide-react";
import type {Offer} from "@/lib/demo";

/** Show short facts explicitly supplied by the administrator, never invent loan limits. */
function extractLoanFacts(description:string){
 const lines=(description||"").split(/\r?\n/).map(s=>s.trim());
 const amountPattern=/^(?:[-•]\s*)?(?:loan\s+amount|loan\s+limit|eligible\s+loan\s+amount|loan\s+range|amount\s+range)\s*[:：–-]\s*(.+)$/i;
 const amountLine=lines.map(line=>line.match(amountPattern)).find(Boolean);
 const amount=amountLine?.[1]?.trim()||"";
 const eligibilityIndex=lines.findIndex(line=>/^(?:[-•]\s*)?eligibility\s*[:：–-]/i.test(line));
 let eligibility="";
 if(eligibilityIndex>=0){
  const inline=lines[eligibilityIndex].replace(/^(?:[-•]\s*)?eligibility\s*[:：–-]\s*/i,"").trim();
  const following=(lines[eligibilityIndex+1]||"").replace(/^[-•]\s*/,"").trim();
  const looksLikeLabel=(value:string)=>/^(?:required\s+documents|documents|benefits|interest\s+rate|tenure|loan\s+amount|how\s+to\s+apply|key\s+benefits)\s*:/i.test(value);
  eligibility=inline||(!looksLikeLabel(following)?following:"");
 }
 return {amount,eligibility};
}

export default function OfferCard({offer}:{offer:Offer}){
 const isLoan=offer.category==="loan";
 const isNavi=isLoan&&/^\s*navi\s+loan(?:\s+app)?\s*$/i.test(offer.title);
 const title=isNavi?"Navi Loan App":offer.title;
 const {amount,eligibility}=isLoan?extractLoanFacts(offer.description):{amount:"",eligibility:""};
 const shortDetail=isLoan?(amount?"Loan Amount: "+amount:offer.highlight?.trim()||""):(offer.highlight?.trim()||"");

 return <article className="flex h-full min-w-0 items-center gap-2.5 rounded-[21px] border border-slate-100 bg-white px-3 py-2.5 shadow-[0_5px_20px_rgba(10,51,39,0.10)] sm:gap-4 sm:px-5 sm:py-3.5">
   <div className="grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-[17px] bg-white shadow-[0_3px_13px_rgba(0,55,38,0.16)] sm:h-[84px] sm:w-[84px]">
    {offer.logo_url
     ?<img src={offer.logo_url} alt={title+" logo"} className="h-full w-full rounded-[16px] object-contain"/>
     :<span className="grid h-full w-full place-items-center text-3xl font-black text-forest-700">{offer.provider_name.charAt(0)||"N"}</span>}
   </div>
   <div className="min-w-0 flex-1">
    <h2 className="break-words text-[20px] font-black leading-[1.12] tracking-tight text-[#087853] sm:text-[27px]">{title}</h2>
    {shortDetail&&<p className="mt-1.5 text-[11px] font-semibold leading-snug text-slate-800 sm:text-sm">{shortDetail}</p>}
    {eligibility&&<p className="mt-0.5 text-[10px] leading-snug text-slate-600 sm:text-xs">Eligibility: {eligibility}</p>}
   </div>
   <Link href={"/product/"+offer.slug} aria-label={"Apply Now — "+title+", view product details"}
    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 rounded-[14px] bg-[#087953] px-2.5 py-2.5 text-[11px] font-extrabold text-white shadow-[0_4px_12px_rgba(8,121,83,0.28)] transition hover:bg-[#056542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087953] sm:min-h-12 sm:gap-2 sm:px-5 sm:text-sm">
    Apply Now <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4"/>
   </Link>
  </article>;
}
