"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Check, ClipboardCopy, ImagePlus, LoaderCircle, ScanLine, ShieldCheck, UploadCloud, Trash2, ZoomIn, ClipboardPaste } from "lucide-react";
import { categories } from "@/lib/demo";
import type { CategorySlug } from "@/lib/config";

export type ScanDraft = {
  category: CategorySlug;
  title: string;
  provider_name: string;
  affiliate_url: string;
};

const keywords: Record<CategorySlug, RegExp[]> = {
  "credit-card": [/credit\s*cards?/i, /\bcredit\b/i, /\bvisa\b/i, /\bmastercard\b/i, /reward(?:ing|s?)\s*card/i, /\bcard\b/i],
  "demat-account": [/de\s*mat/i, /trading\s*account/i, /stock\s*broker/i, /broking\s*account/i],
  "loan": [/\bloans?\b/i, /\bemi\b/i, /lending/i, /borrow/i, /personal\s*finance/i],
  "bank-account": [/savings?\s*account/i, /current\s*account/i, /bank\s*account/i, /zero\s*balance/i, /salary\s*account/i],
  "insurance": [/insurance/i, /health\s*cover/i, /term\s*plan/i, /life\s*cover/i],
  "investment": [/mutual\s*fund/i, /\bsip\b/i, /investment/i, /portfolio/i]
};
const providers: [RegExp, string][] = [
  [/\bHDFC\s*(?:BANK)?\b/i, "HDFC Bank"],
  [/\bICICI\s*(?:BANK)?\b/i, "ICICI Bank"],
  [/\bAXIS\s*(?:BANK)?\b/i, "Axis Bank"],
  [/\bSBI\b|STATE\s*BANK\s*OF\s*INDIA/i, "SBI"],
  [/\bKOTAK\b/i, "Kotak Mahindra Bank"],
  [/\bIDFC\s*(?:FIRST)?\b/i, "IDFC FIRST Bank"],
  [/\bINDUSIND\b/i, "IndusInd Bank"],
  [/\bYES\s*BANK\b/i, "Yes Bank"],
  [/\bFEDERAL\s*BANK\b/i, "Federal Bank"],
  [/\bBANK\s*OF\s*BARODA\b/i, "Bank of Baroda"],
  [/\bPNB\b|PUNJAB\s*NATIONAL\s*BANK/i, "Punjab National Bank"],
  [/\bZERODHA\b/i, "Zerodha"],
  [/\bGROWW\b/i, "Groww"],
  [/\bANGEL\s*ONE\b/i, "Angel One"],
  [/\bUPSTOX\b/i, "Upstox"],
  [/\bMONEYVIEW\b/i, "Moneyview"],
  [/\bNAV[I1]\b/i, "Navi"],
  [/\bBRANCH\b/i, "Branch"]
];

function suggestCategory(topText: string): CategorySlug | "" {
  const ranks = Object.entries(keywords).map(([key, rules]) => ({
    category: key as CategorySlug,
    score: rules.reduce((n, rule) => n + (rule.test(topText) ? (key === "credit-card" && /visa|mastercard|card/i.test(rule.source) ? 1 : 2) : 0), 0)
  })).sort((a, b) => b.score - a.score);
  return ranks[0]?.score ? ranks[0].category : "";
}

function providerFromTop(top: string) {
  return providers.find(([rule]) => rule.test(top))?.[1] ?? "";
}

function labelFor(category: CategorySlug | "", provider: string) {
  const c = categories.find(x => x.slug === category);
  if (!c) return "";
  const label = ({
    "credit-card": "Credit Card",
    "bank-account": "Bank Account",
    "demat-account": "Demat Account",
    "loan": "Loan",
    "insurance": "Insurance",
    "investment": "Investment"
  } as Record<CategorySlug, string>)[c.slug];
  return provider ? provider + " " + label : label + " Offer";
}

/** Extract the complete visible URL, retaining the original case of query tokens. */
export function extractApplyLink(ocrText: string): string {
  const base=ocrText.replace(/[\u200b\u200e\u200f]/g,"").replace(/\r/g,"");
  const marker=/apply\s*(?:now|link)\s*:?\s*/i.exec(base);
  const sections=marker?[base.slice(marker.index+marker[0].length),base]:[base];
  const pattern=/(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"'‘’“”]*)?/gi;
  const possible:string[]=[];
  for(const section of sections){
    const t=section
      .replace(/https?\s*:\s*\/\s*\//gi,x=>x.toLowerCase().startsWith("https")?"https://":"http://")
      .replace(/([a-z0-9])\s*\.\s*(?=[a-z0-9])/gi,"$1.")
      .replace(/([?/=&])\s*\n\s*/g,"$1")
      .replace(/\n\s*(?=[?&])/g,"")
      .replace(/([?&])\s*([a-z0-9_-]{1,18})\s*=\s*/gi,"$1$2=")
      .replace(/([?&][a-z0-9_-]{1,18}=[a-z0-9_%-]{5,})\s*\n\s*([a-z0-9_%-]{6,})/gi,"$1$2")
      .replace(/\/\s+\?/g,"/?")
      .replace(/\s*\n\s*(?=[A-Za-z0-9_-]{12,}(?:\s|$))/g,"");
    for(const found of t.matchAll(pattern)){
      const match=found[0].replace(/[.,;:)\]}]+$/g,"");
      try{
        const url=new URL(/^https?:\/\//i.test(match)?match:"https://"+match);
        if(!["http:","https:"].includes(url.protocol))continue;
        if(/(?:youtube|youtu\.be|instagram|facebook|telegram|whatsapp|twitter)\./i.test(url.hostname))continue;
        if(/[?&=]$/.test(match))continue;
        if((!url.pathname||url.pathname==="/")&&!url.search)continue;
        if(url.search && [...url.searchParams.values()].some(v=>!v))continue;
        possible.push(url.href);
      }catch{/* A broken OCR link should not be presented as valid. */}
    }
  }
  return possible.sort((a,b)=>scoreURL(b)-scoreURL(a))[0]||"";
}
function scoreURL(s:string):number{
  try{
    const u=new URL(s);
    return (u.search?15+Math.min(u.search.length,120)/6:0)+(u.searchParams.has("h")?10:0)+Math.min(u.pathname.length,20)/3;
  }catch{return 0}
}
async function cropImage(file:File,from:number,to:number,enhance=false):Promise<string>{
  const bitmap=await createImageBitmap(file);
  try{
    const y=Math.floor(bitmap.height*from), h=Math.max(1,Math.floor(bitmap.height*to)-y);
    const canvas=document.createElement("canvas");
    canvas.width=bitmap.width*3;canvas.height=h*3;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    if(!ctx)throw Error("Image canvas unavailable");
    ctx.fillStyle="white";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(bitmap,0,y,bitmap.width,h,0,0,canvas.width,canvas.height);
    if(enhance){
      const data=ctx.getImageData(0,0,canvas.width,canvas.height);
      for(let n=0;n<data.data.length;n+=4){
        const lum=data.data[n]*.299+data.data[n+1]*.587+data.data[n+2]*.114;
        const val=lum<170?0:255;
        data.data[n]=data.data[n+1]=data.data[n+2]=val;data.data[n+3]=255;
      }
      ctx.putImageData(data,0,0);
    }
    return canvas.toDataURL("image/png");
  }finally{bitmap.close()}
}
function compareLinks(reads:string[]){
  const candidates=reads.map(extractApplyLink).filter(Boolean);
  const counts=new Map<string,number>();
  candidates.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
  const ordered=[...counts].sort((a,b)=>b[1]-a[1]||scoreURL(b[0])-scoreURL(a[0]));
  return {link:ordered[0]?.[0]||"",agree:(ordered[0]?.[1]||0)>=2};
}

export default function PhotoScanner({ onSaveDraft }: { onSaveDraft: (draft: ScanDraft) => Promise<void> }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const workerRef = useRef<{ terminate: () => Promise<unknown> } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [provider, setProvider] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [verified,setVerified]=useState(false);
  const [confidence,setConfidence]=useState(false);
  const [linkZoom,setLinkZoom]=useState("");
  const [linkPosition,setLinkPosition]=useState<"bottom"|"middle">("bottom");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const blob = URL.createObjectURL(file);
    setPreview(blob);
    return () => URL.revokeObjectURL(blob);
  }, [file]);

  useEffect(() => () => { void workerRef.current?.terminate(); }, []);

  function selectFile(value?: File) {
    if (!value || scanning || saving) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(value.type)) {
      setMessage("Only JPG, PNG and WebP images are supported."); return;
    }
    if (value.size > 10 * 1024 * 1024) {
      setMessage("Maximum image size is 10 MB."); return;
    }
    setFile(value);setMessage("");setProgress(0);setReady(false);
    setCategory("");setProvider("");setTitle("");setLink("");setVerified(false);setLinkZoom("");setConfidence(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto() {
    // Remove only the selected photo; keep extracted fields available for copy or review.
    if (scanning || saving) return;
    setFile(null);
    setPreview("");
    setDragging(false);
    setProgress(0);
    setLinkZoom("");
    if (fileInput.current) fileInput.current.value = "";
    setMessage(ready
      ? "Photo deleted from this browser. Your extracted category and Apply Now link are still available below."
      : "Photo deleted from this browser. Nothing was uploaded.");
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();setDragging(false);
    selectFile(e.dataTransfer.files?.[0]);
  }

  async function scan() {
    if (!file || scanning) return;
    setScanning(true);setMessage("");setReady(false);setProgress(0);
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | undefined;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        logger: ({ status, progress }: { status: string; progress: number }) => {
          if (status === "recognizing text") setProgress(Math.round(progress * 45));
        }
      });
      workerRef.current = worker;
      const topImage=await cropImage(file,0.12,0.72);
      const top=(await worker.recognize(topImage)).data.text||"";
      setProgress(30);
      // Read a magnified link region three ways, without sending the photo
      // or OCR output to an API or database.
      const from=linkPosition==="bottom"?0.73:0.45;
      const until=linkPosition==="bottom"?0.95:0.80;
      const focused=await cropImage(file,from,until);
      setLinkZoom(focused);
      const pass1=(await worker.recognize(focused)).data.text||"";
      setProgress(55);
      const highContrast=await cropImage(file,from,until,true);
      const pass2=(await worker.recognize(highContrast)).data.text||"";
      setProgress(80);
      const wide=await cropImage(file,linkPosition==="bottom"?0.66:0.39,linkPosition==="bottom"?0.98:0.85);
      const pass3=(await worker.recognize(wide)).data.text||"";
      setProgress(100);
      const result=compareLinks([pass1,pass2,pass3]);
      const guessed=suggestCategory(top);
      const bank=providerFromTop(top);
      setCategory(guessed);
      setProvider(bank);
      setTitle(labelFor(guessed,bank));
      setLink(result.link);
      setConfidence(result.agree);
      setVerified(false);
      setReady(true);
      setMessage(result.link ? (result.agree ? "Detected link in more than one scan. Verify every character in the zoomed link preview before copying." : "OCR scans disagreed. Please correct the link using the zoomed screenshot, or paste the original link.") : "Could not find a complete link. Change the link area and scan again, or paste the exact URL from the original source.");
    } catch (e) {
      setMessage("Scanning failed: " + (e instanceof Error ? e.message : "Unknown error") + ". Try another clear screenshot.");
    } finally {
      if (worker) { try { await worker.terminate(); } catch {} }
      workerRef.current = null;
      setScanning(false);
    }
  }

  async function copyLink() {
    if (!verified || !link.trim()) {setMessage("Verify the link against the screenshot before copying.");return;}
    try {
      await navigator.clipboard.writeText(link.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { setMessage("Clipboard unavailable. Select the link field and copy it manually."); }
  }

  async function save() {
    if (!verified) {setMessage("Verify the complete link before saving.");return;}
    if (!category) { setMessage("Choose a category first."); return; }
    if (title.trim().length < 3) { setMessage("Enter the correct bank / product name before saving."); return; }
    let parsed: URL;
    try {
      parsed = new URL(link.trim());
      if (parsed.protocol !== "https:") throw new Error("HTTPS required");
    } catch { setMessage("Enter and verify the complete HTTPS Apply Now link first."); return; }
    if (!parsed.hostname.includes(".")) {setMessage("Enter a valid Apply Now domain.");return;}
    setSaving(true);setMessage("");
    try {
      await onSaveDraft({category, title:title.trim(),provider_name:provider.trim(),affiliate_url:parsed.href});
      setMessage("Saved to the selected category as unpublished. Open Add / Edit Offers to add details or publish when ready.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save draft");
    } finally { setSaving(false); }
  }

  return <div className="space-y-5">
    <div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-forest-600">Admin tools</p>
      <h2 className="mt-1 text-2xl font-black text-forest-900">Scan Photo</h2>
      <p className="mt-2 text-sm text-slate-600">Only detect the category / product identity and Apply Now link. No benefits, cashback, phone numbers or other details are added.</p>
    </div>
    <div className="card p-4 sm:p-6">
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={e=>{e.preventDefault();setDragging(false)}}
        onDrop={onDrop}
        className={"flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center " + (dragging ? "border-forest-600 bg-emerald-50" : "border-emerald-200 bg-forest-50/40")}
      >
        <ImagePlus className="text-forest-700" size={34}/>
        <p className="mt-3 font-bold">Drag & drop an offer screenshot</p>
        <p className="mt-1 text-xs text-slate-500">or select a local PNG, JPG, WebP · Max 10 MB</p>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e:ChangeEvent<HTMLInputElement>)=>selectFile(e.target.files?.[0])}/>
        <button className="btn-outline mt-4 !py-2 text-sm" type="button" disabled={scanning||saving} onClick={()=>fileInput.current?.click()}>
          <UploadCloud size={17}/>Choose Photo
        </button>
      </div>
      {preview&&<div className="mt-4"><label className="field-label">Where is the Apply Now link?</label><select className="form-input max-w-sm" value={linkPosition} onChange={e=>{setLinkPosition(e.target.value as "bottom"|"middle");setReady(false);setLinkZoom("");setVerified(false)}} disabled={scanning}><option value="bottom">Bottom part of image (default)</option><option value="middle">Middle part of image</option></select></div>}
      {preview&&<div className="mt-5 flex flex-wrap items-center gap-4">
        <img src={preview} alt="Selected screenshot preview" className="h-40 max-w-44 rounded-xl border object-contain"/>
        <div className="min-w-0 flex-1">
          <p className="break-all text-xs text-slate-500">{file?.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={scanning||saving} onClick={scan} className="btn-primary">
              {scanning?<LoaderCircle className="animate-spin" size={18}/>:<ScanLine size={18}/>}
              {scanning?"Scanning...":"Scan Photo"}
            </button>
            <button type="button" disabled={scanning||saving} onClick={removePhoto}
              aria-label="Delete selected photo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 size={17}/>Delete Photo
            </button>
          </div>
          {scanning&&<p className="mt-2 text-xs text-forest-700">Recognizing text: {progress}%</p>}
        </div>
      </div>}
      {message&&<p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-forest-800" role="status">{message}</p>}
      <p className="mt-3 text-xs text-slate-500">Image scanning happens in your browser. No photo or full OCR text is uploaded or saved.</p>
    </div>
    {ready&&<div className="card space-y-4 p-5 sm:p-6">
      <h3 className="text-lg font-black text-forest-900">Scan Result — Only Required Fields</h3>
      <label className="block">
        <span className="field-label">Category *</span>
        <select className="form-input" value={category} onChange={e=>{
          const newCategory=e.target.value as CategorySlug|"";
          const oldDefault=labelFor(category,provider);
          setCategory(newCategory);
          if (!title || title===oldDefault) setTitle(labelFor(newCategory,provider));
        }}>
          <option value="">Choose one of 6 categories</option>
          {categories.map(c=><option value={c.slug} key={c.slug}>{c.title}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="field-label">Bank / Product Name (for your category list)</span>
        <input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. HDFC Bank Credit Card"/>
      </label>
      {linkZoom&&preview&&<div className="rounded-xl border border-emerald-100 bg-slate-50 p-3"><p className="mb-2 flex items-center gap-2 text-sm font-bold"><ZoomIn size={18}/>Zoomed link area — compare every character</p><img src={linkZoom} alt="Magnified portion of your screenshot containing the printed link" className="w-full max-h-96 object-contain"/><p className="mt-2 text-xs text-slate-500">The URL printed in the photo is not guaranteed to be OCR-perfect, especially tracking codes.</p></div>}
      <label className="block">
        <span className="field-label">Apply Now Link *</span>
        <textarea spellCheck={false} className="form-input break-all font-mono text-xs" rows={3} value={link} onChange={e=>{setLink(e.target.value);setVerified(false)}} placeholder="https://leads.example.com/?h=..."/>
      </label>
      <p className={"text-xs font-bold "+(confidence?"text-emerald-700":"text-amber-700")}>{confidence?"Two or more OCR passes matched — still confirm tracking characters.":"OCR result needs manual verification. If available, copy the original link from its source rather than from a screenshot."}</p>
      <button className="btn-outline !py-2 text-xs" type="button" onClick={async()=>{try{const pasted=await navigator.clipboard.readText();setLink(pasted.trim());setVerified(false)}catch{setMessage("Clipboard access denied. Paste directly in the link field.")}}}><ClipboardPaste size={16}/>Paste Original Link</button>
      <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"><input type="checkbox" className="mt-1" checked={verified} onChange={e=>setVerified(e.target.checked)}/><span>I have checked the full link, including every character after <code>?</code>, against the original photo or source.</span></label>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copyLink} disabled={!link.trim()||!verified} className="btn-outline">
          {copied?<Check size={17}/>:<ClipboardCopy size={17}/>}
          {copied?"Link Copied":"Copy Apply Now Link"}
        </button>
        <button type="button" disabled={saving||!category||!link.trim()||!verified} onClick={save} className="btn-primary">
          {saving?<LoaderCircle className="animate-spin" size={17}/>:<ShieldCheck size={17}/>}
          Save to Category (Unpublished)
        </button>
      </div>
      <p className="text-xs text-slate-500">The name is an editable label, not a verified card model. Check every character of the link before saving. You can later add a logo, instructions and other details manually through Add / Edit Offers. No automatic public publishing.</p>
    </div>}
  </div>;
}
