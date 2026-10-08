import Link from "next/link";
import {ArrowRight,CheckCircle2} from "lucide-react";
import type {Offer} from "@/lib/demo";
export default function OfferCard({offer}:{offer:Offer}){
 return <article className="card flex h-full flex-col overflow-hidden p-5">
  <div className="flex items-start gap-3"><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-forest-50 to-emerald-100">{offer.logo_url?<img src={offer.logo_url} alt={offer.provider_name+" logo"} className="h-full w-full object-contain p-2"/>:<span className="text-2xl font-bold text-forest-700">{offer.provider_name.charAt(0)||"N"}</span>}</div>
   <div className="min-w-0"><span className="text-xs font-semibold text-forest-600">{offer.provider_name}</span><h2 className="mt-1 text-base font-extrabold text-forest-900">{offer.title}</h2>{offer.is_demo&&<span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold tracking-wide text-amber-800">DEMO PRODUCT</span>}</div></div>
  <p className="mt-4 text-sm leading-relaxed text-slate-500">{offer.description}</p>
  {offer.highlight&&<p className="mt-4 rounded-xl bg-forest-50 px-3 py-2 text-sm font-bold text-forest-700">{offer.highlight}</p>}
  <div className="mt-4 space-y-2">{offer.benefits.slice(0,2).map((b,i)=><p key={i} className="flex items-start gap-2 text-xs text-slate-600"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-forest-500"/>{b}</p>)}</div>
  <Link href={`/product/${offer.slug}`} className="btn-primary mt-auto w-full translate-y-3">View Product Details <ArrowRight size={16}/></Link>
 </article>;
}
