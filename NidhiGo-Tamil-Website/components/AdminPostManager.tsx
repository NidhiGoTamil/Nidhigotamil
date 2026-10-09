"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {categories,type Offer} from "@/lib/demo";
import {Eye,Pencil,Trash2,X,Plus,ArrowLeft,UploadCloud,PlayCircle,ExternalLink,Save,Send,RefreshCw} from "lucide-react";

type Props={mode:"editor"|"services"};
type CategorySlug=Offer["category"];
type Draft=Omit<Offer,"id">;
const emptyOffer:Draft={
 slug:"",category:"loan",title:"",provider_name:"",description:"",
 logo_url:null,highlight:"",benefits:[],documents:[],steps:[],
 tutorial_url:null,affiliate_url:null,is_demo:false,published:false
};

async function adminRequest(path:string, options?:RequestInit){
 const res=await fetch(path,{cache:"no-store",...options});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(data.error||"Request failed");
 return data;
}

function youtubeEmbed(value:string|null|undefined):string{
 if(!value)return "";
 try{
  const url=new URL(value.trim());let id="";
  if(url.hostname==="youtu.be") id=url.pathname.split("/")[1]||"";
  if(["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com"].includes(url.hostname)){
   id=url.searchParams.get("v")||url.pathname.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/)?.[1]||"";
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id)?"https://www.youtube-nocookie.com/embed/"+id:"";
 }catch{return ""}
}

function ProductVideo({url,title}:{url:string|null|undefined,title:string}){
 const src=youtubeEmbed(url);
 if(!src)return null;
 return <div className="aspect-video w-full max-w-xl overflow-hidden rounded-2xl bg-slate-950">
  <iframe title={title+" YouTube video"} src={src} loading="lazy" allowFullScreen
   referrerPolicy="strict-origin-when-cross-origin"
   allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
   className="h-full w-full"/>
 </div>;
}

export default function AdminPostManager({mode}:Props){
 const [screen,setScreen]=useState<"editor"|"services">(mode);
 const [category,setCategory]=useState<CategorySlug>("loan");
 const [posts,setPosts]=useState<Offer[]>([]);
 const [draft,setDraft]=useState<Draft>({...emptyOffer});
 const [editing,setEditing]=useState<string|null>(null);
 const [preview,setPreview]=useState<Offer|null>(null);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [uploading,setUploading]=useState(false);

 const load=useCallback(async()=>{
  const response=await adminRequest("/api/admin/offers");
  setPosts(response.offers||[]);
 },[]);
 useEffect(()=>{
  let active=true;
  load().catch(e=>{if(active)setError(e instanceof Error?e.message:"Unable to load products")});
  return()=>{active=false};
 },[load]);
 useEffect(()=>{
  if(!preview)return;
  function onKeyDown(e:KeyboardEvent){if(e.key==="Escape")setPreview(null)}
  document.addEventListener("keydown",onKeyDown);
  return()=>document.removeEventListener("keydown",onKeyDown);
 },[preview]);

 const categoryProducts=posts.filter(p=>p.category===category);
 const categoryTitle=categories.find(c=>c.slug===category)?.title||"Products";

 function pickCategory(slug:CategorySlug){
  setCategory(slug);setDraft({...emptyOffer,category:slug});
  setEditing(null);setPreview(null);setNotice("");setError("");
 }
 function startEdit(item:Offer){
  setPreview(null);setCategory(item.category);setDraft({...item});
  setEditing(item.id);setScreen("editor");setError("");setNotice("");
  window.scrollTo({top:0,behavior:"smooth"});
 }
 function addInCategory(){
  setDraft({...emptyOffer,category});setEditing(null);setScreen("editor");
  setNotice("");setError("");
  window.scrollTo({top:0,behavior:"smooth"});
 }
 function viewPosts(){
  setPreview(null);setEditing(null);setScreen("services");
  setNotice("");setError("");
  void load().catch(e=>setError(e instanceof Error?e.message:"Unable to refresh"));
 }
 async function uploadLogo(file:File|undefined){
  if(!file)return;
  setError("");setUploading(true);
  try{
   const form=new FormData();form.append("file",file);
   const result=await adminRequest("/api/admin/assets",{method:"POST",body:form});
   setDraft(v=>({...v,logo_url:result.url}));
   setNotice("Logo uploaded. Save Draft or Publish to save the product.");
  }catch(e){setError(e instanceof Error?e.message:"Logo upload failed")}
  finally{setUploading(false)}
 }
 async function save(publish:boolean){
  if(busy||uploading)return;
  if(draft.title.trim().length<3){setError("Enter a product title of at least 3 characters.");return}
  if(!draft.description.trim()){setError("Enter product details.");return}
  if(draft.tutorial_url?.trim()&&!youtubeEmbed(draft.tutorial_url)){
   setError("Enter a valid YouTube video link or leave it blank.");return;
  }
  if(publish&&!draft.affiliate_url?.trim()){
   setError("Enter an Apply Link before publishing.");return;
  }
  setBusy(true);setError("");setNotice("");
  try{
   const cleanName=draft.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90).replace(/-$/g,"")||"product";
   const slug=editing?draft.slug:cleanName+"-"+crypto.randomUUID().slice(0,8);
   const payload={...draft,slug,category,provider_name:(draft.provider_name.trim()||draft.title.trim()).slice(0,120),
    description:draft.description.trim(),title:draft.title.trim(),is_demo:false,published:publish,
    tutorial_url:draft.tutorial_url?.trim()||null,affiliate_url:draft.affiliate_url?.trim()||null,
    logo_url:draft.logo_url||null};
   await adminRequest(editing?"/api/admin/offers/"+editing:"/api/admin/offers",{
    method:editing?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   await load();
   setEditing(null);setDraft({...emptyOffer,category});
   setNotice(publish?"Product published successfully.":"Draft saved. It is not visible to website visitors until published.");
  }catch(e){setError(e instanceof Error?e.message:"Unable to save")}
  finally{setBusy(false)}
 }
 async function remove(item:Offer){
  if(busy)return;
  if(!window.confirm('Permanently delete "'+item.title+'"? This cannot be undone.'))return;
  setBusy(true);setError("");
  try{
   await adminRequest("/api/admin/offers/"+item.id,{method:"DELETE"});
   if(preview?.id===item.id)setPreview(null);
   if(editing===item.id){setEditing(null);setDraft({...emptyOffer,category})}
   await load();setNotice(item.title+" permanently deleted.");
  }catch(e){setError(e instanceof Error?e.message:"Delete failed")}
  finally{setBusy(false)}
 }

 return <div className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div>
    <p className="text-xs font-extrabold uppercase tracking-wider text-forest-600">Product management</p>
    <h2 className="mt-1 text-xl font-black text-forest-900 sm:text-2xl">{screen==="editor"?"Add / Edit Post":"Our Services"}</h2>
   </div>
   {screen==="services"
    ?<button type="button" onClick={addInCategory} className="btn-primary !px-4 !py-2.5 text-sm"><Plus size={17}/>Add Post</button>
    :<button type="button" onClick={viewPosts} className="btn-outline !px-4 !py-2.5 text-sm"><ArrowLeft size={17}/>Our Services</button>}
  </div>

  <div className="card p-4 sm:p-5">
   <h3 className="mb-3 text-sm font-extrabold text-forest-900">Choose Category</h3>
   <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
    {categories.map(c=><button key={c.slug} type="button" onClick={()=>pickCategory(c.slug)}
     aria-pressed={category===c.slug}
     className={"flex min-h-16 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs font-bold transition sm:text-sm "+(category===c.slug?"border-forest-700 bg-forest-700 text-white shadow-md":"border-emerald-100 bg-forest-50 text-forest-900 hover:bg-emerald-100")}>
      <span className="text-xl" aria-hidden="true">{c.emoji}</span>
      <span className="min-w-0">{c.title}</span>
      {screen==="services"&&<span className={"ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] "+(category===c.slug?"bg-white/20":"bg-white")}>{posts.filter(p=>p.category===c.slug).length}</span>}
    </button>)}
   </div>
  </div>
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  {notice&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-forest-800">{notice}</p>}

  {screen==="editor"&&<>
   <div className="flex flex-wrap items-center justify-between gap-2">
    <h3 className="text-lg font-extrabold text-forest-900">{editing?"Edit Post":"New Post"} — {categoryTitle}</h3>
    {editing&&<button type="button" className="text-sm font-bold text-forest-700 underline" onClick={addInCategory}>Start new post</button>}
   </div>
   <form onSubmit={e=>{e.preventDefault();void save(false)}} className="card space-y-5 p-4 sm:p-6">
    <label className="block">
     <span className="field-label">Product Name / Title *</span>
     <input className="form-input" maxLength={180} required value={draft.title}
      onChange={e=>setDraft(v=>({...v,title:e.target.value}))} placeholder="e.g. Personal Loan"/>
    </label>
    <label className="block">
     <span className="field-label">Product Description *</span>
     <textarea className="form-input min-h-36 resize-y" rows={6} required maxLength={2500} value={draft.description}
      onChange={e=>setDraft(v=>({...v,description:e.target.value}))}
      placeholder="Enter product information, benefits, eligibility and requirements."/>
    </label>
    <div>
     <label className="field-label" htmlFor="product-logo-upload">Product Logo / Photo</label>
     <input id="product-logo-upload" type="file" accept="image/png,image/jpeg,image/webp" className="form-input"
      disabled={uploading||busy} onChange={e=>{void uploadLogo(e.target.files?.[0]);e.target.value=""}}/>
     {uploading&&<p className="mt-2 text-xs text-forest-700">Uploading logo...</p>}
     {draft.logo_url&&<div className="mt-3 flex items-center gap-3 rounded-xl bg-forest-50 p-3">
      <img src={draft.logo_url} alt="Uploaded product logo" className="h-20 w-20 rounded-xl bg-white object-contain p-1"/>
      <span className="text-xs text-slate-600">Logo ready</span>
      <button type="button" className="ml-auto text-xs font-bold text-rose-700" onClick={()=>setDraft(v=>({...v,logo_url:null}))}>Remove</button>
     </div>}
    </div>
    <label className="block">
     <span className="field-label">YouTube Video Link</span>
     <input type="url" className="form-input" value={draft.tutorial_url||""}
      onChange={e=>setDraft(v=>({...v,tutorial_url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..."/>
    </label>
    {youtubeEmbed(draft.tutorial_url)&&<div>
     <p className="mb-2 flex items-center gap-2 text-sm font-bold text-forest-800"><PlayCircle size={18}/>YouTube Video Preview</p>
     <ProductVideo url={draft.tutorial_url} title={draft.title||"Product"}/>
    </div>}
    {draft.tutorial_url&&!youtubeEmbed(draft.tutorial_url)&&<p className="text-xs text-amber-700">Enter a valid YouTube video or Shorts link for preview.</p>}
    <label className="block">
     <span className="field-label">Apply Link</span>
     <input type="url" className="form-input" value={draft.affiliate_url||""}
      onChange={e=>setDraft(v=>({...v,affiliate_url:e.target.value}))} placeholder="https://provider.example/apply"/>
     <span className="mt-1 block text-xs text-slate-500">The Apply button will be displayed below the tutorial video on the product page.</span>
    </label>
    <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
     <button type="submit" disabled={busy||uploading} className="btn-outline !px-4 !py-3 text-sm">
      <Save size={17}/>{busy?"Saving...":"Save Draft"}
     </button>
     <button type="button" disabled={busy||uploading} className="btn-primary !px-5 !py-3 text-sm"
      onClick={()=>{void save(true)}}>
      <Send size={17}/>{busy?"Publishing...":"Publish"}
     </button>
    </div>
    <p className="text-xs text-slate-500">Save Draft keeps the product private. Publish makes it visible under the selected service category. The Apply Link is required for publishing.</p>
   </form>
  </>}

  {screen==="services"&&<section className="space-y-3" aria-label={categoryTitle+" post list"}>
   <div className="flex items-center justify-between gap-2">
    <h3 className="text-lg font-black text-forest-900">{categoryTitle} Posts ({categoryProducts.length})</h3>
    <button type="button" onClick={()=>{void load().catch(e=>setError(e instanceof Error?e.message:"Unable to refresh"))}} className="btn-outline !px-3 !py-2 text-xs">
     <RefreshCw size={16}/>Refresh
    </button>
   </div>
   {categoryProducts.length===0&&<div className="card rounded-2xl p-8 text-center text-sm text-slate-500">
    No posts in {categoryTitle} yet. Choose Add Post to create one.
   </div>}
   {categoryProducts.map(item=><div key={item.id} className="card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3 sm:p-4">
    <div className="flex min-w-0 flex-1 items-center gap-3">
     {item.logo_url?<img src={item.logo_url} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain"/>:<div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forest-50 text-xl">{categories.find(c=>c.slug===item.category)?.emoji}</div>}
     <div className="min-w-0">
      <h4 className="break-words text-sm font-extrabold text-forest-900">{item.title}</h4>
      <p className={"mt-1 text-xs font-semibold "+(item.published?"text-emerald-700":"text-amber-700")}>{item.published?"Published":"Draft / Unpublished"}</p>
     </div>
    </div>
    <div className="flex shrink-0 flex-wrap gap-2">
     <button type="button" onClick={()=>setPreview(item)} title="View post preview" aria-label={"Preview "+item.title}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 text-forest-700 hover:bg-forest-50"><Eye size={19}/></button>
     <button type="button" onClick={()=>startEdit(item)} title="Edit post" aria-label={"Edit "+item.title}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-100 text-blue-700 hover:bg-sky-50"><Pencil size={18}/></button>
     <button type="button" onClick={()=>{void remove(item)}} disabled={busy} title="Permanently delete post" aria-label={"Delete "+item.title}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={18}/></button>
    </div>
   </div>)}
  </section>}

  {preview&&<div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-md sm:p-6" onMouseDown={e=>{if(e.currentTarget===e.target)setPreview(null)}}>
    <div role="dialog" aria-modal="true" aria-labelledby="post-preview-heading" className="my-auto w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl">
     <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-white px-4 py-3 sm:px-6">
      <h3 id="post-preview-heading" className="text-lg font-black text-forest-900">Post Preview</h3>
      <button type="button" onClick={()=>setPreview(null)} aria-label="Close preview" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700"><X size={20}/></button>
     </div>
     <div className="max-h-[65vh] space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
      <div className="flex items-center gap-4 rounded-2xl bg-forest-50 p-3">
       {preview.logo_url?<img src={preview.logo_url} alt={preview.title+" logo"} className="h-16 w-16 shrink-0 rounded-xl bg-white object-contain p-1"/>:<span className="text-4xl">{categories.find(c=>c.slug===preview.category)?.emoji}</span>}
       <div><p className="text-xs font-bold text-forest-600">{categories.find(c=>c.slug===preview.category)?.title}</p>
        <h4 className="mt-1 text-lg font-black text-forest-900">{preview.title}</h4>
        <p className="text-xs text-slate-500">{preview.published?"Published":"Unpublished Draft"}</p></div>
      </div>
      <div><p className="mb-1 text-sm font-bold text-forest-900">Product Details</p><p className="whitespace-pre-line text-sm leading-6 text-slate-700">{preview.description||"No description added."}</p></div>
      {preview.benefits?.length>0&&<div><p className="mb-1 text-sm font-bold">Benefits</p>{preview.benefits.map((v,i)=><p key={i} className="text-sm text-slate-600">{v}</p>)}</div>}
      {preview.documents?.length>0&&<div><p className="mb-1 text-sm font-bold">Documents</p>{preview.documents.map((v,i)=><p key={i} className="text-sm text-slate-600">{v}</p>)}</div>}
      {preview.steps?.length>0&&<div><p className="mb-1 text-sm font-bold">How to Apply</p>{preview.steps.map((v,i)=><p key={i} className="text-sm text-slate-600">{i+1}. {v}</p>)}</div>}
      {youtubeEmbed(preview.tutorial_url)&&<div><p className="mb-2 text-sm font-bold">YouTube Tutorial</p><ProductVideo url={preview.tutorial_url} title={preview.title}/></div>}
      <div><p className="mb-1 text-sm font-bold">Apply Link</p>
       {preview.affiliate_url?<a href={preview.affiliate_url} target="_blank" rel="noopener noreferrer sponsored" className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-forest-700 underline">{preview.affiliate_url}<ExternalLink size={16} className="shrink-0"/></a>:<p className="text-sm text-slate-500">Not added yet.</p>}
      </div>
     </div>
     <div className="flex justify-end gap-2 border-t bg-slate-50 px-4 py-3 sm:px-6">
      <button type="button" onClick={()=>startEdit(preview)} className="btn-outline !px-4 !py-2 text-sm"><Pencil size={16}/>Edit</button>
      <button type="button" disabled={busy} onClick={()=>{void remove(preview)}} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Trash2 size={16}/>Delete</button>
     </div>
    </div>
   </div>}
 </div>;
}
