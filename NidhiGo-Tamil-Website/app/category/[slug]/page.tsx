import Link from "next/link";
import {notFound} from "next/navigation";
import OfferCard from "@/components/OfferCard";
import {categories} from "@/lib/demo";
import {CATEGORY_ORDER,type CategorySlug} from "@/lib/config";
import {getOffers} from "@/lib/data";
export const dynamic="force-dynamic";
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!CATEGORY_ORDER.includes(slug as CategorySlug))notFound();
 const cat=categories.find(c=>c.slug===slug)!;
 const offers=await getOffers(slug as CategorySlug);
 return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><nav className="text-xs text-slate-500"><Link href="/">Home</Link> / {cat.title}</nav>
 <div className="mt-5 rounded-3xl bg-gradient-to-r from-forest-800 to-forest-600 p-6 text-white sm:p-9"><div className="mb-2 text-4xl">{cat.emoji}</div><h1 className="text-3xl font-black sm:text-4xl">{cat.title}</h1><p className="mt-2 max-w-xl text-sm text-emerald-50">Browse available {cat.title.toLowerCase()} and view requirements, guidance and application information.</p></div>
 <div className="mt-9 flex items-center justify-between"><h2 className="text-xl font-black text-forest-900">Products & Offers</h2><span className="text-xs font-semibold text-slate-500">{offers.length} listed</span></div>
 <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{offers.map(o=><OfferCard key={o.id} offer={o}/>)}</div>
 {!offers.length&&<div className="card mt-6 p-10 text-center">No published offers yet. Please check again soon.</div>}</main>
}
