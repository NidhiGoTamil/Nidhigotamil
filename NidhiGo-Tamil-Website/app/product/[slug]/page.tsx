import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowUpRight,CheckCircle2,PlayCircle,ShieldAlert} from "lucide-react";
import {getOffer} from "@/lib/data";

export const dynamic="force-dynamic";

function youtubeEmbed(url:string|null){
 if(!url)return null;
 try{
  const u=new URL(url);
  let id="";
  if(u.hostname==="youtu.be")id=u.pathname.slice(1);
  if(["www.youtube.com","youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(u.hostname)){
   id=u.searchParams.get("v")||u.pathname.match(/^\/(?:shorts|embed)\/([A-Za-z0-9_-]+)/)?.[1]||"";
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?`https://www.youtube-nocookie.com/embed/${id}`:null;
 }catch{return null}
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const offer=await getOffer(slug);
 if(!offer)notFound();
 const yt=youtubeEmbed(offer.tutorial_url);
 const affiliate=offer.affiliate_url&&/^https:\/\//.test(offer.affiliate_url)?offer.affiliate_url:null;
 return <main className="mx-auto max-w-4xl px-3 pb-5 pt-5 sm:px-6 sm:pt-7">
  <nav className="text-xs text-slate-500">
   <Link href="/" className="hover:text-forest-700">Home</Link> / <Link href={`/category/${offer.category}`} className="hover:text-forest-700">Category</Link> / {offer.title}
  </nav>

  {/* Compact four-corner rounded brand header instead of an oversized banner. */}
  <header className="mt-3 flex flex-col gap-2 rounded-[21px] bg-gradient-to-r from-forest-900 to-forest-700 px-4 py-4 text-white sm:px-6 sm:py-5">
   <div className="flex items-center gap-3 sm:gap-4">
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-2 text-xl font-bold text-forest-800 sm:h-16 sm:w-16">
     {offer.logo_url?<img alt={offer.provider_name+" logo"} src={offer.logo_url} className="h-full w-full object-contain"/>:offer.provider_name.charAt(0)||"N"}
    </div>
    <div className="min-w-0">
     <p className="text-xs text-emerald-100">{offer.provider_name}</p>
     <h1 className="mt-0.5 text-lg font-black leading-snug sm:text-2xl">{offer.title}</h1>
     
    </div>
   </div>
   
  </header>

  <article className="card mt-4 space-y-5 rounded-[21px] p-4 sm:space-y-6 sm:p-7">
   {offer.highlight&&<div className="rounded-xl bg-forest-50 p-3 text-sm font-bold text-forest-800">{offer.highlight}</div>}
   <section>
    <h2 className="mb-3 text-lg font-black text-forest-900 sm:text-xl">Product Details</h2>
    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{offer.description || "Product details will be added shortly."}</p>
    {offer.benefits?.length>0&&<div className="mt-4">
     <h3 className="mb-2 text-sm font-bold text-forest-900">Benefits</h3>
     <ul className="space-y-2">{offer.benefits.map((v,i)=><li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-600"><CheckCircle2 size={17} className="mt-1 shrink-0 text-forest-500"/>{v}</li>)}</ul>
    </div>}
   </section>
   {offer.documents?.length>0&&<section>
    <h2 className="mb-3 text-lg font-black text-forest-900 sm:text-xl">Documents Required</h2>
    <ul className="list-inside list-disc space-y-2 text-sm leading-6 text-slate-600">{offer.documents.map((v,i)=><li key={i}>{v}</li>)}</ul>
   </section>}
   {offer.steps?.length>0&&<section>
    <h2 className="mb-3 text-lg font-black text-forest-900 sm:text-xl">How to Apply</h2>
    <ol className="space-y-2.5">{offer.steps.map((v,i)=><li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest-100 font-bold text-forest-700">{i+1}</span><span>{v}</span></li>)}</ol>
   </section>}

   {yt&&<section>
    <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-forest-900 sm:text-xl"><PlayCircle size={22}/> YouTube Tutorial</h2>
    <div className="aspect-video overflow-hidden rounded-xl bg-black">
     <iframe className="h-full w-full" src={yt} title={offer.title+" tutorial video"} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"/>
    </div>
    {offer.tutorial_url&&<a href={offer.tutorial_url} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-forest-700 underline" target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={14}/></a>}
   </section>}

   <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950">
    <ShieldAlert size={16} className="mr-2 inline"/>
    Please verify eligibility, fees, terms and privacy information with the provider. This site may earn an affiliate commission from qualifying external links.
   </div>
   {affiliate
     ?<a className="btn-primary w-full !rounded-xl py-3.5 text-sm" href={affiliate} rel="noopener noreferrer sponsored" target="_blank">Continue to Apply <ArrowUpRight size={18}/></a>
     :<p className="rounded-xl bg-gray-100 px-4 py-3 text-center text-sm text-gray-500">Application link will be added after the product is verified.</p>}
  </article>
 </main>;
}
