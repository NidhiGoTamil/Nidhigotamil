"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createBrowserClient} from "@supabase/ssr";
import {LockKeyhole,LoaderCircle} from "lucide-react";
export default function Login(){const router=useRouter();const [loading,setLoading]=useState(false);const [error,setError]=useState("");
 const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 async function login(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!configured)return;setLoading(true);setError("");const form=new FormData(e.currentTarget);
  const client=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const {error}=await client.auth.signInWithPassword({email:String(form.get("email")),password:String(form.get("password"))});setLoading(false);
  if(error){setError("Sign-in failed. Check your credentials and admin membership.");return}router.push("/admin");router.refresh();
 }
 return <main className="mx-auto max-w-md px-4 py-16"><div className="card p-7 sm:p-9"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-forest-100"><LockKeyhole className="text-forest-700" size={28}/></div><h1 className="mt-5 text-center text-2xl font-black text-forest-900">Admin Sign In</h1><p className="mt-2 text-center text-sm text-slate-500">Authorized NidhiGo Tamil admins only</p>{!configured&&<p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">Configure your Supabase project environment variables to enable admin sign-in.</p>}
 <form onSubmit={login} className="mt-6 space-y-4"><label className="block"><span className="field-label">Email</span><input className="form-input" name="email" required type="email"/></label><label className="block"><span className="field-label">Password</span><input className="form-input" name="password" required type="password"/></label>{error&&<p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={!configured||loading} className="btn-primary w-full">{loading?<LoaderCircle size={18} className="animate-spin"/>:"Sign In"}</button></form></div></main>
}
