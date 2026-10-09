"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
import {useRouter} from "next/navigation";
import {categories} from "@/lib/demo";
import PhotoScanner, {type ScanDraft} from "@/components/PhotoScanner";
import {LayoutDashboard,Users,PackagePlus,Settings,Download,LogOut,RefreshCw,UploadCloud,Edit,CheckCircle,ExternalLink,ScanLine} from "lucide-react";

type Section="dashboard"|"applications"|"offers"|"settings"|"scanner";
type Lead={id:string,created_at:string,full_name:string,email:string,phone:string,category:string,offer_title:string|null,purpose:string,message:string,status:string,admin_notes:string};
type Product={id:string,slug:string,category:string,title:string,provider_name:string,description:string,logo_url:string|null,highlight:string,benefits:string[],documents:string[],steps:string[],tutorial_url:string|null,affiliate_url:string|null,is_demo:boolean,published:boolean};
type SettingsData={logo_url:string,banner_url:string,headline:string,subheadline:string,youtube_url:string,telegram_url:string,instagram_url:string,x_url:string};
const emptyOffer:Omit<Product,"id">={slug:"",category:"loan",title:"",provider_name:"",description:"",logo_url:"",highlight:"",benefits:[],documents:[],steps:[],tutorial_url:"",affiliate_url:"",is_demo:false,published:false};
const emptySettings:SettingsData={logo_url:"",banner_url:"",headline:"Simple Banking, Brighter Futures",subheadline:"All Financial Solutions in One Place",youtube_url:"",telegram_url:"",instagram_url:"",x_url:""};
const nav=[{key:"dashboard",label:"Dashboard",Icon:LayoutDashboard},{key:"applications",label:"Applications",Icon:Users},{key:"offers",label:"Add / Edit Offers",Icon:PackagePlus},{key:"settings",label:"Website Settings",Icon:Settings},{key:"scanner",label:"Scan Photo",Icon:ScanLine}] as const;
async function request(path:string,options?:RequestInit){const res=await fetch(path,{cache:"no-store",...options});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||"Something went wrong");return data;}
function previewYoutube(url:string|null|undefined):string {
 try {
  const u=new URL(url||"");
  let id="";
  if(u.hostname==="youtu.be")id=u.pathname.split("/")[1]||"";
  if(["www.youtube.com","youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(u.hostname))
   id=u.searchParams.get("v")||u.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/)?.[1]||"";
  return /^[A-Za-z0-9_-]{11}$/.test(id)?"https://www.youtube-nocookie.com/embed/"+id:"";
 } catch {return ""}
}
export default function AdminDashboard(){
 const router=useRouter();const [tab,setTab]=useState<Section>("dashboard"),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[error,setError]=useState("");
 const [stats,setStats]=useState<any>(null),[leads,setLeads]=useState<Lead[]>([]),[count,setCount]=useState(0),[page,setPage]=useState(1),[category,setCategory]=useState(""),[from,setFrom]=useState(""),[to,setTo]=useState(""),[search,setSearch]=useState("");
 const [offers,setOffers]=useState<Product[]>([]),[offer,setOffer]=useState<Omit<Product,"id">|Product>(emptyOffer),[editing,setEditing]=useState<string|null>(null),[settings,setSettings]=useState<SettingsData>(emptySettings);
 const [uploading,setUploading]=useState("");
 const filters=new URLSearchParams({page:String(page),category,from,to,search}).toString();
 const videoPreview=previewYoutube(offer.tutorial_url);
 const selectedCategoryTitle=categories.find(c=>c.slug===offer.category)?.title||"Category";
 const loadStats=useCallback(async()=>{setStats(await request("/api/admin/stats"))},[]);
 const loadLeads=useCallback(async()=>{const result=await request("/api/admin/applications?"+filters);setLeads(result.applications);setCount(result.count)},[filters]);
 const loadOffers=useCallback(async()=>{const result=await request("/api/admin/offers");setOffers(result.offers)},[]);
 const loadSettings=useCallback(async()=>{const result=await request("/api/admin/settings");setSettings(result.settings)},[]);
 useEffect(()=>{let active=true;(async()=>{try{if(tab==="dashboard")await loadStats();if(tab==="applications")await loadLeads();if(tab==="offers")await loadOffers();if(tab==="settings")await loadSettings();if(!active)return;setError("")}catch(e){if(active)setError((e as Error).message)}})();return()=>{active=false}},[tab,loadStats,loadLeads,loadOffers,loadSettings]);
 const changeTab=(t:Section)=>{setTab(t);setError("");setNotice("")};
 async function saveScannedCategoryItem(draft:ScanDraft){
   // Only category, product/provider label, and the verified affiliate URL are saved.
   // The screenshot, raw OCR text, benefits, and personal details never leave the browser.
   const prefix=draft.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100).replace(/-$/g,"")||"product";
   const slug=prefix+"-"+crypto.randomUUID().slice(0,8);
   const payload={...emptyOffer,slug,category:draft.category,title:draft.title,provider_name:draft.provider_name,
     affiliate_url:draft.affiliate_url,description:"",highlight:"",benefits:[],documents:[],steps:[],
     tutorial_url:"",logo_url:"",published:false,is_demo:false};
   await request("/api/admin/offers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   await loadOffers();
   setNotice("Scanned product saved to "+categories.find(c=>c.slug===draft.category)?.title+" as unpublished. Edit additional details manually in Add / Edit Offers.");
 }
 async function logout(){if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){const db=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);await db.auth.signOut()}router.push("/admin/login");router.refresh()}
 async function updateLead(id:string,status:string,admin_notes:string){try{await request("/api/admin/applications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,admin_notes})});setNotice("Application updated");await loadLeads()}catch(e){setError((e as Error).message)}}
 async function saveOffer(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");setNotice("");
  try{
   const short=offer.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,95).replace(/-$/g,"")||"new-product";
   const slug=editing?offer.slug:short+"-"+crypto.randomUUID().slice(0,8);
   const publish=Boolean(offer.affiliate_url?.trim());
   const payload={...offer,slug,provider_name:(offer.provider_name.trim()||offer.title.trim()).slice(0,120),
    highlight:editing?offer.highlight:"",benefits:editing?offer.benefits:[],
    documents:editing?offer.documents:[],steps:editing?offer.steps:[],is_demo:false,published:publish};
   const url=editing?"/api/admin/offers/"+editing:"/api/admin/offers";
   await request(url,{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const selected=offer.category;
   setNotice(publish?"Product saved and published.":"Product saved as unpublished; add an Apply Link to publish.");
   setOffer({...emptyOffer,category:selected});setEditing(null);await loadOffers();
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 function editOffer(p:Product){setEditing(p.id);setOffer({...p});window.scrollTo({top:0,behavior:"smooth"})}
 async function unpublish(p:Product){if(!confirm(`Unpublish ${p.title}?`))return;try{await request(`/api/admin/offers/${p.id}`,{method:"DELETE"});setNotice("Offer unpublished");await loadOffers()}catch(e){setError((e as Error).message)}}
 async function saveSettings(e:React.FormEvent){e.preventDefault();setBusy(true);try{await request("/api/admin/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});setNotice("Website settings saved. Refresh the public page to view changes.")}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 async function uploadImage(file:File|undefined,onSuccess:(url:string)=>Promise<void>|void){if(!file)return;setUploading(file.name);setError("");try{const data=new FormData();data.append("file",file);const res=await request("/api/admin/assets",{method:"POST",body:data});await onSuccess(res.url);setNotice("Image uploaded. Save the updated form if required.")}catch(e){setError((e as Error).message)}finally{setUploading("")}}
 const FilterBar=()=> <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-5"><label className="text-xs font-bold">Category<select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} className="form-input mt-1"><option value="">All Categories</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label><label className="text-xs font-bold">From Date (IST)<input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1)}} className="form-input mt-1"/></label><label className="text-xs font-bold">To Date (IST)<input type="date" min={from||undefined} value={to} onChange={e=>{setTo(e.target.value);setPage(1)}} className="form-input mt-1"/></label><label className="text-xs font-bold">Search<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Name / Email / Phone" className="form-input mt-1"/></label><div className="flex items-end gap-2"><button className="btn-outline !px-3" onClick={()=>loadLeads()} title="Refresh"><RefreshCw size={18}/></button><a className="btn-primary flex-1 !px-3 text-xs" href={`/api/admin/export?${new URLSearchParams({category,from,to,search}).toString()}`}><Download size={16}/>Excel</a></div></div>;
 return <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-forest-600">Secure administration</p><h1 className="mt-1 text-3xl font-black text-forest-900">NidhiGo Admin Dashboard</h1></div><div className="flex gap-2"><Link href="/" target="_blank" className="btn-outline !px-3 text-xs"><ExternalLink size={15}/>Website</Link><button className="btn-outline !px-3 text-xs" onClick={logout}><LogOut size={16}/>Sign Out</button></div></div>
 <div className="grid gap-6 md:grid-cols-[210px_minmax(0,1fr)]"><nav className="card flex h-fit gap-2 overflow-x-auto p-3 md:flex-col" aria-label="Admin dashboard navigation">{nav.map(({key,label,Icon})=><button key={key} onClick={()=>changeTab(key)} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold sm:text-sm ${tab===key?"bg-forest-700 text-white":"text-slate-700 hover:bg-forest-50"}`}><Icon size={18}/>{label}</button>)}</nav>
 <section className="min-w-0">{error&&<p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}{notice&&<p className="mb-4 rounded-xl bg-forest-50 p-4 text-sm text-forest-700" role="status">{notice}</p>}
 {tab==="dashboard"&&<><h2 className="mb-4 text-xl font-black">Overview</h2><div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-sm text-slate-500">Total Applications</p><b className="mt-2 block text-3xl text-forest-900">{stats?.total??"…"}</b></div><div className="card p-5"><p className="text-sm text-slate-500">Today (IST)</p><b className="mt-2 block text-3xl text-forest-900">{stats?.today??"…"}</b></div></div><h3 className="mb-4 text-lg font-black">Applications by Category</h3><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{categories.map(c=><button key={c.slug} onClick={()=>{setCategory(c.slug);setPage(1);changeTab("applications")}} className="card p-5 text-left transition hover:border-forest-300 hover:shadow-premium"><span className="text-3xl">{c.emoji}</span><p className="mt-3 font-bold">{c.title}</p><b className="text-2xl text-forest-600">{stats?.categories?.find((s:any)=>s.slug===c.slug)?.count??"…"}</b></button>)}</div></>}
 {tab==="applications"&&<><div className="mb-4 flex justify-between gap-3"><h2 className="text-xl font-black">Applications <span className="text-base font-medium text-slate-400">({count})</span></h2></div>{FilterBar()}<div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-forest-50 text-xs uppercase tracking-wider text-forest-800"><tr>{["Date (IST)","Applicant","Phone","Category","Purpose","Status / Notes"].map(c=><th className="px-4 py-3" key={c}>{c}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{leads.map(a=><tr key={a.id} className="align-top"><td className="whitespace-nowrap px-4 py-4 text-xs">{new Date(a.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</td><td className="px-4 py-4"><b>{a.full_name}</b><p className="mt-1 text-xs text-slate-500">{a.email}</p></td><td className="px-4 py-4">{a.phone}</td><td className="px-4 py-4">{categories.find(c=>c.slug===a.category)?.title||a.category}</td><td className="max-w-52 px-4 py-4 text-xs">{a.purpose}<p className="mt-2 text-slate-500">{a.message}</p></td><td className="px-4 py-4"><select value={a.status} className="form-input !py-1" onChange={e=>updateLead(a.id,e.target.value,a.admin_notes)}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select><textarea aria-label="Admin notes" defaultValue={a.admin_notes} onBlur={e=>{if(e.target.value!==a.admin_notes)updateLead(a.id,a.status,e.target.value)}} placeholder="Admin notes" className="form-input mt-2 !py-2" rows={2}/></td></tr>)}{leads.length===0&&<tr><td colSpan={6} className="p-10 text-center text-slate-500">No applications for this filter.</td></tr>}</tbody></table></div><div className="mt-4 flex items-center justify-end gap-3"><button disabled={page===1} onClick={()=>setPage(page-1)} className="btn-outline !py-2">Previous</button><span className="text-xs">Page {page}</span><button disabled={page*50>=count} onClick={()=>setPage(page+1)} className="btn-outline !py-2">Next</button></div></>}
 {tab==="offers"&&<>
  <h2 className="mb-4 text-xl font-black text-forest-900">Manage Products</h2>
  <div className="card mb-5 p-4 sm:p-5">
    <p className="mb-3 text-sm font-bold text-forest-900">Select a Category</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
     {categories.map(c=><button type="button" key={c.slug}
       onClick={()=>{setOffer({...emptyOffer,category:c.slug});setEditing(null);setError("");setNotice("")}}
       className={"flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition sm:text-sm "+(offer.category===c.slug?"border-forest-700 bg-forest-700 text-white":"border-emerald-100 bg-forest-50 text-forest-800 hover:bg-emerald-100")}>
       <span className="text-xl">{c.emoji}</span><span>{c.title}</span>
     </button>)}
    </div>
  </div>
  <h3 className="mb-3 text-lg font-black text-forest-900">{editing?"Edit Product":"Add New Product"} — {selectedCategoryTitle}</h3>
  <form onSubmit={saveOffer} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
    <label className="sm:col-span-2">
      <span className="field-label">Product Logo (PNG / JPG / WebP)</span>
      <input type="file" accept="image/png,image/jpeg,image/webp" className="form-input" disabled={Boolean(uploading)}
        onChange={e=>uploadImage(e.target.files?.[0],url=>setOffer(old=>({...old,logo_url:url})))}/>
      {offer.logo_url&&<div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-100 bg-slate-50 p-3">
        <img src={offer.logo_url} alt="Product logo preview" className="h-16 w-16 rounded-xl bg-white object-contain p-1"/>
        <span className="text-xs text-slate-600">Current product logo</span>
        <button type="button" className="ml-auto text-xs font-bold text-red-600" onClick={()=>setOffer(old=>({...old,logo_url:""}))}>Remove Logo</button>
      </div>}
    </label>
    <label className="sm:col-span-2">
      <span className="field-label">Product Name / Title *</span>
      <input required maxLength={180} className="form-input" value={offer.title}
        onChange={e=>setOffer(old=>({...old,title:e.target.value}))}
        placeholder="e.g. HDFC Bank Credit Card"/>
    </label>
    <label className="sm:col-span-2">
      <span className="field-label">Product Details *</span>
      <textarea required maxLength={2500} className="form-input min-h-36" rows={6}
        value={offer.description} onChange={e=>setOffer(old=>({...old,description:e.target.value}))}
        placeholder="Enter product details, important benefits, eligibility and other information here."/>
    </label>
    <label className="sm:col-span-2">
      <span className="field-label">YouTube Video Link (optional)</span>
      <input type="url" className="form-input" value={offer.tutorial_url??""}
        onChange={e=>setOffer(old=>({...old,tutorial_url:e.target.value}))}
        placeholder="https://www.youtube.com/watch?v=..."/>
    </label>
    {videoPreview&&<div className="sm:col-span-2">
      <p className="mb-2 text-sm font-bold text-forest-900">YouTube Video Preview</p>
      <div className="aspect-video max-w-xl overflow-hidden rounded-2xl bg-black">
        <iframe src={videoPreview} className="h-full w-full" title="YouTube tutorial preview"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen/>
      </div>
    </div>}
    {offer.tutorial_url&&!videoPreview&&<p className="sm:col-span-2 text-xs text-amber-700">Enter a valid YouTube video, Shorts or youtu.be link to show its preview.</p>}
    <label className="sm:col-span-2">
      <span className="field-label">Apply Now Link</span>
      <input type="url" className="form-input" value={offer.affiliate_url??""}
        onChange={e=>setOffer(old=>({...old,affiliate_url:e.target.value}))}
        placeholder="https://..."/>
      <span className="mt-2 block text-xs text-slate-500">Products are published when a valid Apply Link is saved. Without an Apply Link they stay unpublished.</span>
    </label>
    <div className="flex flex-wrap gap-3 sm:col-span-2">
      <button type="submit" className="btn-primary" disabled={busy||Boolean(uploading)}>
        {busy?"Saving...":editing?"Save Product Changes":"Save Product"}
      </button>
      {editing&&<button type="button" className="btn-outline"
        onClick={()=>{setEditing(null);setOffer({...emptyOffer,category:offer.category})}}>Cancel Edit</button>}
    </div>
  </form>
  <h3 className="mb-3 mt-7 text-lg font-black text-forest-900">{selectedCategoryTitle} Products ({offers.filter(p=>p.category===offer.category).length})</h3>
  <div className="space-y-3">
    {offers.filter(p=>p.category===offer.category).map(p=><div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-3">
        {p.logo_url&&<img src={p.logo_url} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-contain"/>}
        <div className="min-w-0"><p className="font-bold text-forest-900">{p.title}</p>
          <p className="mt-1 text-xs text-slate-500">{p.published?"Published":"Unpublished"}</p></div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={()=>editOffer(p)} className="btn-outline !px-3 !py-2 text-xs"><Edit size={15}/>Edit</button>
        {p.published&&<button type="button" onClick={()=>unpublish(p)} className="btn-outline !px-3 !py-2 text-xs">Unpublish</button>}
      </div>
    </div>)}
    {offers.filter(p=>p.category===offer.category).length===0&&<div className="card p-6 text-center text-sm text-slate-500">No products in this category yet. Add your first product above.</div>}
  </div>
 </>}
 {tab==="scanner"&&<PhotoScanner onSaveDraft={saveScannedCategoryItem}/>}
 {tab==="settings"&&<><h2 className="mb-4 text-xl font-black">Website Appearance & Links</h2><form onSubmit={saveSettings} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><label><span className="field-label">Upload Website Logo</span><input type="file" accept="image/png,image/jpeg,image/webp" className="form-input" onChange={e=>uploadImage(e.target.files?.[0],url=>setSettings(old=>({...old,logo_url:url})))}/></label><label><span className="field-label">Upload Homepage Banner</span><input type="file" accept="image/png,image/jpeg,image/webp" className="form-input" onChange={e=>uploadImage(e.target.files?.[0],url=>setSettings(old=>({...old,banner_url:url})))}/></label>{(["logo_url","banner_url","headline","subheadline","youtube_url","telegram_url","instagram_url","x_url"] as (keyof SettingsData)[]).map(k=><label key={k} className={k==="banner_url"?"sm:col-span-2":""}><span className="field-label">{k.replace(/_/g," ")}</span><input className="form-input" value={settings[k]??""} onChange={e=>setSettings({...settings,[k]:e.target.value})}/></label>)}<p className="sm:col-span-2 text-xs text-slate-500">Wide banner images are displayed at full width with their original ratio: no cropping or stretching. Upload the final logo and PNGs after review.</p><button disabled={busy} className="btn-primary sm:col-span-2">Save Website Settings</button></form>
 <h3 className="mb-3 mt-8 text-lg font-black">Six Category Icons</h3><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{categories.map(c=><div key={c.slug} className="card p-4"><p className="font-bold">{c.emoji} {c.title}</p><label className="mt-3 block text-xs text-slate-600">Upload transparent PNG<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-2 block w-full text-xs" onChange={e=>uploadImage(e.target.files?.[0],async url=>{await request("/api/admin/categories",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug:c.slug,icon_url:url})})})}/></label></div>)}</div></>}
 {uploading&&<p className="mt-3 text-xs text-forest-600">Uploading {uploading}...</p>}
 </section></div></main>;
}
