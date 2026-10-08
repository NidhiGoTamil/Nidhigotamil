import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowUpRight,CheckCircle2,PlayCircle,ShieldAlert} from "lucide-react";
import {getOffer} from "@/lib/data";
export const dynamic="force-dynamic";
function youtubeEmbed(url:string|null){if(!url)return null;try{const u=new URL(url);let id="";if(u.hostname==="youtu.be")id=u.pathname.slice(1);if(["www.youtube.com","youtube.com","m.youtube.com"].includes(u.hostname))id=u.searchParams.get("v")||u.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]+)/)?.[1]||"";return /^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null}catch{return null}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const offer=await getOffer(slug);if(!offer)notFound();
 const yt=youtubeEmbed(offer.tutorial_url);
 const affiliate=offer.affiliate_url&&/^https:\/\//.test(offer.affiliate_url)?offer.affiliate_url:null;
 return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6"><nav className="text-xs text-slate-500"><Link href="/">Home</Link> / <Link href={`/category/${offer.category}`}>Category</Link> / {offer.title}</nav>
 <article className="card mt-5 overflow-hidden"><div className="bg-gradient-to-r from-forest-900 to-forest-700 p-6 text-white sm:p-9"><div className="flex items-center gap-4"><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-2 text-3xl font-bold text-forest-800">{offer.logo_url?<img alt={offer.provider_name+" logo"} src={offer.logo_url} className="h-full w-full object-contain"/>:offer.provider_name[0]}</div><div><p className="text-xs text-emerald-100">{offer.provider_name}</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{offer.title}</h1>{offer.is_demo&&<b className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-900">DEMO LISTING</b>}</div></div><p className="mt-6 text-emerald-50">{offer.description}</p></div>
 <div className="space-y-7 p-5 sm:p-9">{offer.highlight&&<div className="rounded-2xl bg-forest-50 p-4 font-bold text-forest-800">{offer.highlight}</div>}
 <section><h2 className="mb-3 text-xl font-black">Product Details & Benefits</h2><ul className="space-y-3">{offer.benefits.map((s,i)=><li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-600"><CheckCircle2 size={18} className="shrink-0 text-forest-500"/>{s}</li>)}</ul></section>
 <section><h2 className="mb-3 text-xl font-black">Documents Required</h2><ul className="list-inside list-disc space-y-2 text-sm text-slate-600">{offer.documents.map((s,i)=><li key={i}>{s}</li>)}</ul></section>
 <section><h2 className="mb-3 text-xl font-black">How to Apply</h2><ol className="space-y-3">{offer.steps.map((s,i)=><li key={i} className="flex gap-3 text-sm text-slate-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-100 font-bold text-forest-700">{i+1}</span><span className="pt-1">{s}</span></li>)}</ol></section>
 {yt&&<section><h2 className="mb-3 flex items-center gap-2 text-xl font-black"><PlayCircle/> YouTube Tutorial</h2><div className="aspect-video overflow-hidden rounded-2xl"><iframe className="h-full w-full" src={yt} title="Product tutorial" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"/></div></section>}
 <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950"><ShieldAlert size={17} className="mr-2 inline"/>Please verify fees, eligibility and privacy terms with the provider. This website may receive an affiliate commission when you apply through the external partner link.</div>
 <Link className="btn-outline w-full" href={`/apply?category=${offer.category}&product=${offer.slug}`}>Submit an Enquiry to NidhiGo Tamil</Link>
 {affiliate&&!offer.is_demo?<a className="btn-primary w-full py-4" href={affiliate} rel="noopener noreferrer sponsored" target="_blank">Continue to Provider / Affiliate Link <ArrowUpRight size={19}/></a>:<p className="rounded-2xl bg-gray-100 px-5 py-4 text-center text-sm text-gray-500">Application link will be added once this product is verified.</p>}
 </div></article></main>
}
