"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {createBrowserClient} from "@supabase/ssr";
import {useRouter} from "next/navigation";
import {categories} from "@/lib/demo";
import AdminPostManager from "@/components/AdminPostManager";
import {LayoutDashboard,Users,PackagePlus,Layers,Download,LogOut,RefreshCw,ExternalLink} from "lucide-react";

type Section="dashboard"|"applications"|"posts"|"services";
type Lead={id:string,created_at:string,full_name:string,email:string,phone:string,category:string,offer_title:string|null,purpose:string,message:string,status:string,admin_notes:string};

const nav=[
 {key:"dashboard",label:"Dashboard",Icon:LayoutDashboard},
 {key:"applications",label:"Applications",Icon:Users},
 {key:"posts",label:"Add / Edit Post",Icon:PackagePlus},
 {key:"services",label:"Our Services",Icon:Layers}
] as const;

async function request(path:string,options?:RequestInit){
 const res=await fetch(path,{cache:"no-store",...options});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(data.error||"Request failed");
 return data;
}
export default function AdminDashboard(){
 const router=useRouter();
 const [tab,setTab]=useState<Section>("dashboard");
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [stats,setStats]=useState<any>(null);
 const [leads,setLeads]=useState<Lead[]>([]);
 const [count,setCount]=useState(0);
 const [page,setPage]=useState(1);
 const [category,setCategory]=useState("");
 const [from,setFrom]=useState("");
 const [to,setTo]=useState("");
 const [search,setSearch]=useState("");
 const filters=new URLSearchParams({page:String(page),category,from,to,search}).toString();
 const loadStats=useCallback(async()=>{setStats(await request("/api/admin/stats"))},[]);
 const loadLeads=useCallback(async()=>{
  const result=await request("/api/admin/applications?"+filters);
  setLeads(result.applications||[]);setCount(result.count||0);
 },[filters]);
 useEffect(()=>{
  let active=true;
  (async()=>{
   try{
    if(tab==="dashboard")await loadStats();
    if(tab==="applications")await loadLeads();
    if(active)setError("");
   }catch(e){if(active)setError(e instanceof Error?e.message:"Unable to load data")}
  })();
  return()=>{active=false};
 },[tab,loadStats,loadLeads]);

 function changeTab(value:Section){setTab(value);setError("");setNotice("")}
 async function logout(){
  if(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){
   const db=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
   await db.auth.signOut();
  }
  router.push("/admin/login");router.refresh();
 }
 async function updateLead(id:string,status:string,admin_notes:string){
  try{
   await request("/api/admin/applications",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,admin_notes})});
   setNotice("Application updated");await loadLeads();
  }catch(e){setError(e instanceof Error?e.message:"Update failed")}
 }

 return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
  <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
   <div>
    <p className="text-xs font-bold uppercase tracking-widest text-forest-600">Secure Administration</p>
    <h1 className="mt-1 text-2xl font-black text-forest-900 sm:text-3xl">NidhiGo Admin Dashboard</h1>
   </div>
   <div className="flex gap-2">
    <Link href="/" target="_blank" className="btn-outline !px-3 !py-2 text-xs"><ExternalLink size={15}/>Website</Link>
    <button type="button" className="btn-outline !px-3 !py-2 text-xs" onClick={()=>{void logout()}}><LogOut size={16}/>Sign Out</button>
   </div>
  </header>
  <div className="grid gap-5 md:grid-cols-[210px_minmax(0,1fr)]">
   <nav aria-label="Admin dashboard navigation" className="card flex h-fit gap-2 overflow-x-auto p-3 md:flex-col">
    {nav.map(({key,label,Icon})=><button key={key} type="button"
      onClick={()=>changeTab(key)}
      aria-current={tab===key?"page":undefined}
      className={"flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-left text-xs font-bold transition sm:text-sm "+(tab===key?"bg-forest-700 text-white":"text-slate-700 hover:bg-forest-50")}>
      <Icon size={18}/>{label}
    </button>)}
   </nav>
   <section className="min-w-0">
    {error&&<p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {notice&&<p role="status" className="mb-4 rounded-xl bg-forest-50 p-4 text-sm text-forest-700">{notice}</p>}
    {tab==="dashboard"&&<>
     <h2 className="mb-4 text-xl font-black text-forest-900">Overview</h2>
     <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="card p-5"><p className="text-sm text-slate-500">Total Applications</p><b className="mt-2 block text-3xl text-forest-900">{stats?.total??"…"}</b></div>
      <div className="card p-5"><p className="text-sm text-slate-500">Today (IST)</p><b className="mt-2 block text-3xl text-forest-900">{stats?.today??"…"}</b></div>
     </div>
     <h3 className="mb-4 text-lg font-black">Applications by Category</h3>
     <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {categories.map(c=><button key={c.slug} type="button"
       onClick={()=>{setCategory(c.slug);setPage(1);changeTab("applications")}}
       className="card p-4 text-left transition hover:border-forest-300 hover:shadow-premium sm:p-5">
       <span className="text-3xl">{c.emoji}</span><p className="mt-2 font-bold">{c.title}</p>
       <b className="text-2xl text-forest-600">{stats?.categories?.find((s:any)=>s.slug===c.slug)?.count??"…"}</b>
      </button>)}
     </div>
    </>}
    {tab==="applications"&&<>
     <h2 className="mb-4 text-xl font-black">Applications <span className="text-base font-medium text-slate-400">({count})</span></h2>
     <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-5">
      <label className="text-xs font-bold">Category<select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} className="form-input mt-1"><option value="">All Categories</option>{categories.map(c=><option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
      <label className="text-xs font-bold">From Date (IST)<input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1)}} className="form-input mt-1"/></label>
      <label className="text-xs font-bold">To Date (IST)<input type="date" min={from||undefined} value={to} onChange={e=>{setTo(e.target.value);setPage(1)}} className="form-input mt-1"/></label>
      <label className="text-xs font-bold">Search<input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Name / Email / Phone" className="form-input mt-1"/></label>
      <div className="flex items-end gap-2">
       <button type="button" className="btn-outline !px-3" onClick={()=>{void loadLeads()}} aria-label="Refresh applications"><RefreshCw size={18}/></button>
       <a className="btn-primary flex-1 !px-3 text-xs" href={"/api/admin/export?"+new URLSearchParams({category,from,to,search}).toString()}><Download size={16}/>Excel</a>
      </div>
     </div>
     <div className="card overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
       <thead className="bg-forest-50 text-xs uppercase tracking-wider text-forest-800">
        <tr>{["Date (IST)","Applicant","Phone","Category","Purpose","Status / Notes"].map(label=><th key={label} className="px-4 py-3">{label}</th>)}</tr>
       </thead>
       <tbody className="divide-y divide-gray-100">
        {leads.map(a=><tr key={a.id} className="align-top">
         <td className="whitespace-nowrap px-4 py-4 text-xs">{new Date(a.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</td>
         <td className="px-4 py-4"><b>{a.full_name}</b><p className="mt-1 text-xs text-slate-500">{a.email}</p></td>
         <td className="px-4 py-4">{a.phone}</td>
         <td className="px-4 py-4">{categories.find(c=>c.slug===a.category)?.title||a.category}</td>
         <td className="max-w-52 px-4 py-4 text-xs">{a.purpose}<p className="mt-2 text-slate-500">{a.message}</p></td>
         <td className="px-4 py-4">
          <select value={a.status} className="form-input !py-1" onChange={e=>{void updateLead(a.id,e.target.value,a.admin_notes)}}>
           <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
          </select>
          <textarea aria-label="Admin notes" defaultValue={a.admin_notes}
           onBlur={e=>{if(e.target.value!==a.admin_notes)void updateLead(a.id,a.status,e.target.value)}}
           placeholder="Admin notes" className="form-input mt-2 !py-2" rows={2}/>
         </td>
        </tr>)}
        {leads.length===0&&<tr><td colSpan={6} className="p-10 text-center text-slate-500">No applications for this filter.</td></tr>}
       </tbody>
      </table>
     </div>
     <div className="mt-4 flex items-center justify-end gap-3">
      <button type="button" disabled={page===1} onClick={()=>setPage(page-1)} className="btn-outline !py-2">Previous</button>
      <span className="text-xs">Page {page}</span>
      <button type="button" disabled={page*50>=count} onClick={()=>setPage(page+1)} className="btn-outline !py-2">Next</button>
     </div>
    </>}
    {tab==="posts"&&<AdminPostManager mode="editor"/>}
    {tab==="services"&&<AdminPostManager mode="services"/>}
   </section>
  </div>
 </main>;
}
