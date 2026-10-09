import Link from "next/link";
import {ArrowRight,CheckCircle2} from "lucide-react";
import type {Offer} from "@/lib/demo";

export default function OfferCard({offer}:{offer:Offer}){
 return <article className="card flex h-full min-h-[255px] flex-col overflow-hidden rounded-[20px] p-4 sm:min-h-[270px] sm:p-5">
  <div className="flex items-start gap-3">
   <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-forest-50 to-emerald-100 sm:h-16 sm:w-16">
    {offer.logo_url?<img src={offer.logo_url} alt={offer.provider_name+" logo"} className="h-full w-full object-contain p-2"/>:<span className="text-xl font-bold text-forest-700">{offer.provider_name.charAt(0)||"N"}</span>}
   </div>
   <div className="min-w-0">
    <span className="text-xs font-semibold text-forest-600">{offer.provider_name}</span>
    <h2 className="mt-0.5 text-sm font-extrabold leading-snug text-forest-900 sm:text-base">{offer.title}</h2>
    {offer.is_demo&&<span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">DEMO PRODUCT</span>}
   </div>
  </div>
  {offer.description&&<p className="mt-3 text-xs leading-5 text-slate-600 sm:text-sm">{offer.description}</p>}
  {offer.highlight&&<p className="mt-3 rounded-xl bg-forest-50 px-3 py-2 text-xs font-bold text-forest-700 sm:text-sm">{offer.highlight}</p>}
  {offer.benefits?.length>0&&<div className="mt-3 space-y-1.5">{offer.benefits.slice(0,2).map((benefit,i)=><p key={i} className="flex items-start gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-forest-500"/>{benefit}</p>)}</div>}
  <Link href={`/product/${offer.slug}`} className="btn-primary mt-auto w-full !rounded-xl !px-3 !py-2.5 text-center text-xs sm:text-sm">View Product Details <ArrowRight size={15}/></Link>
 </article>;
}
