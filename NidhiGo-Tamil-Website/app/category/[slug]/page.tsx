import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {notFound} from "next/navigation";
import OfferCard from "@/components/OfferCard";
import {categories} from "@/lib/demo";
import {CATEGORY_ORDER,type CategorySlug} from "@/lib/config";
import {getOffers,getCategories} from "@/lib/data";

export const dynamic="force-dynamic";

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!CATEGORY_ORDER.includes(slug as CategorySlug))notFound();
 const cat=categories.find(c=>c.slug===slug)!;
 const [offers,liveCategories]=await Promise.all([getOffers(slug as CategorySlug),getCategories()]);
 const liveIcon=liveCategories.find(c=>c.slug===slug)?.icon_url;
 return <main className="mx-auto max-w-6xl px-3 pb-6 pt-5 sm:px-6 sm:pt-7">
  <Link href="/" aria-label="Back to services" className="mb-3 inline-flex items-center gap-2 rounded-xl border border-forest-700/15 bg-white px-3 py-2 text-xs font-bold text-forest-800 shadow-sm transition hover:bg-forest-50 sm:text-sm"><ArrowLeft size={16}/> Back</Link>
  <nav className="text-sm font-semibold text-slate-600"><Link href="/" className="hover:text-forest-700">Home</Link> / {cat.title}</nav>
  <header className="mt-3 flex min-h-[88px] items-center gap-3 rounded-[20px] bg-gradient-to-r from-forest-800 to-forest-600 px-4 py-4 text-white sm:min-h-[108px] sm:gap-5 sm:px-7 sm:py-5">
   <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 text-4xl sm:h-[76px] sm:w-[76px]" aria-hidden="true">{liveIcon?<img src={liveIcon} alt="" className="h-full w-full rounded-xl object-contain" loading="eager"/>:cat.emoji}</span>
   <div className="min-w-0">
    <h1 className="text-[26px] font-black leading-tight sm:text-[34px]">{cat.title}</h1>
    <p className="mt-1 text-sm font-semibold leading-6 text-emerald-50 sm:text-base">Explore product details, eligibility and available application links.</p>
   </div>
  </header>
  <div className="mb-3 mt-6 flex items-center justify-between gap-2 sm:mt-7">
    <h2 className="text-[23px] font-black text-forest-900 sm:text-[27px]">Products &amp; Offers</h2>
    <span className="shrink-0 text-sm font-bold text-slate-600">{offers.length} listed</span>
  </div>
  <section className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:gap-4" aria-label={cat.title+" products"}>
   {offers.map(o=><OfferCard key={o.id} offer={o}/>)}
  </section>
  {!offers.length&&<div className="card mt-5 p-8 text-center text-sm text-slate-600">No published offers yet. Please check again soon.</div>}
 </main>;
}
