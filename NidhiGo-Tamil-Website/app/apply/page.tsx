import {Suspense} from "react";
import {getOffers} from "@/lib/data";
import ApplyForm from "@/components/ApplyForm";
export const metadata={title:"Apply Now"};
export default async function ApplyPage(){const offers=await getOffers();return <main className="mx-auto max-w-3xl px-4 py-9 sm:px-6"><div className="text-center"><p className="text-xs font-bold uppercase tracking-widest text-forest-600">Enquiry Form</p><h1 className="mt-2 text-3xl font-black text-forest-900 sm:text-4xl">Apply for Financial Products</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500">Tell us which product you&apos;re interested in. We will review your enquiry and contact you.</p></div><Suspense fallback={<div className="card mt-7 p-8 text-center">Loading form…</div>}><ApplyForm offers={offers.map(o=>({id:o.id,slug:o.slug,title:o.title,category:o.category}))}/></Suspense></main>}
