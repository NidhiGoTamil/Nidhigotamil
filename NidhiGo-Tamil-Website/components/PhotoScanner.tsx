"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Check, ClipboardCopy, ImagePlus, LoaderCircle, ScanLine, ShieldCheck, UploadCloud } from "lucide-react";
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

/** OCR often splits a printed URL after ? or h=; join that URL, not arbitrary screenshot text. */
export function extractApplyLink(ocrText: string): string {
  const base = ocrText.replace(/[\u200b\u200e\u200f]/g, "").replace(/\r/g, "");
  const m = /apply\s*(?:now|link)\s*:?\s*/i.exec(base);
  const around = m ? base.slice(m.index + m[0].length, m.index + m[0].length + 440) : base;
  const sources = [around, base];
  const linkPattern = /(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/[a-z0-9._~!$&'()*+,;=:@%/?#-]*)?/gi;
  for (const part of sources) {
    const normalized = part
      .replace(/https?\s*:\s*\/\s*\//gi, "https://")
      .replace(/([a-z0-9])\s*\.\s*(?=[a-z0-9])/gi, "$1.")
      .replace(/([?/=&])\s*\n\s*/g, "$1")
      .replace(/([?&]\s*[a-z]{1,10}\s*=\s*[a-z0-9_-]{1,})\s*\n\s*([a-z0-9_-]{6,})/gi, "$1$2")
      .replace(/([.?=&/])\s+(?=[a-z0-9])/gi, "$1")
      .replace(/\s+(?=[?&=])/g, "");
    const urls = normalized.match(linkPattern) ?? [];
    for (const candidate of urls) {
      const cleaned = candidate.replace(/[.,;:)}\]]+$/g, "").replace(/\s/g, "");
      try {
        const u = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : "https://" + cleaned);
        const unwanted = /(?:youtube|youtu\.be|facebook|instagram|telegram|whatsapp|twitter|x\.com)\./i.test(u.hostname);
        if (u.protocol === "https:" && !unwanted && u.hostname.includes(".") && (u.search || u.pathname !== "/")) return u.href;
      } catch { /* do not guess an invalid OCR URL */ }
    }
  }
  return "";
}

async function cropImage(file: File, topFraction: number, bottomFraction: number) {
  const bitmap = await createImageBitmap(file);
  try {
    const y = Math.floor(bitmap.height * topFraction);
    const h = Math.max(1, Math.floor(bitmap.height * bottomFraction) - y);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width * 2;
    canvas.height = h * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to read image");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, y, bitmap.width, h, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    bitmap.close();
  }
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
    setCategory("");setProvider("");setTitle("");setLink("");
    if (fileInput.current) fileInput.current.value = "";
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
      const topImage = await cropImage(file, 0.12, 0.72);
      const top = (await worker.recognize(topImage)).data.text ?? "";
      setProgress(50);
      const bottomImage = await cropImage(file, 0.67, 1);
      const bottom = (await worker.recognize(bottomImage)).data.text ?? "";
      setProgress(100);
      const guessed = suggestCategory(top);
      const identifiedProvider = providerFromTop(top);
      setCategory(guessed);
      setProvider(identifiedProvider);
      setTitle(labelFor(guessed, identifiedProvider));
      setLink(extractApplyLink(bottom));
      setReady(true);
      setMessage("Review the category and exact URL. OCR can misread letters or tracking codes.");
    } catch (e) {
      setMessage("Scanning failed: " + (e instanceof Error ? e.message : "Unknown error") + ". Try another clear screenshot.");
    } finally {
      if (worker) { try { await worker.terminate(); } catch {} }
      workerRef.current = null;
      setScanning(false);
    }
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch { setMessage("Clipboard unavailable. Select the link field and copy it manually."); }
  }

  async function save() {
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
        <p className="mt-1 text-xs text-slate-500">or upload PNG, JPG, WebP · Max 10 MB</p>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e:ChangeEvent<HTMLInputElement>)=>selectFile(e.target.files?.[0])}/>
        <button className="btn-outline mt-4 !py-2 text-sm" type="button" disabled={scanning||saving} onClick={()=>fileInput.current?.click()}>
          <UploadCloud size={17}/>Upload Photo
        </button>
      </div>
      {preview&&<div className="mt-5 flex flex-wrap items-center gap-4">
        <img src={preview} alt="Selected screenshot preview" className="h-40 max-w-44 rounded-xl border object-contain"/>
        <div className="min-w-0 flex-1">
          <p className="break-all text-xs text-slate-500">{file?.name}</p>
          <button type="button" disabled={scanning||saving} onClick={scan} className="btn-primary mt-3">
            {scanning?<LoaderCircle className="animate-spin" size={18}/>:<ScanLine size={18}/>}
            {scanning?"Scanning...":"Scan Photo"}
          </button>
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
      <label className="block">
        <span className="field-label">Apply Now Link *</span>
        <textarea spellCheck={false} className="form-input break-all font-mono text-xs" rows={3} value={link} onChange={e=>setLink(e.target.value)} placeholder="https://leads.example.com/?h=..."/>
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copyLink} disabled={!link.trim()} className="btn-outline">
          {copied?<Check size={17}/>:<ClipboardCopy size={17}/>}
          {copied?"Link Copied":"Copy Apply Now Link"}
        </button>
        <button type="button" disabled={saving||!category||!link.trim()} onClick={save} className="btn-primary">
          {saving?<LoaderCircle className="animate-spin" size={17}/>:<ShieldCheck size={17}/>}
          Save to Category (Unpublished)
        </button>
      </div>
      <p className="text-xs text-slate-500">The name is an editable label, not a verified card model. Check every character of the link before saving. You can later add a logo, instructions and other details manually through Add / Edit Offers. No automatic public publishing.</p>
    </div>}
  </div>;
}
