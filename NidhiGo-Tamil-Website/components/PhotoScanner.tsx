"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Check, ClipboardCopy, FileImage, ImagePlus, LoaderCircle, ScanLine, ShieldCheck, UploadCloud } from "lucide-react";
import { categories } from "@/lib/demo";
import type { CategorySlug } from "@/lib/config";

export type ScanDraft = {
  category: CategorySlug;
  title: string;
  provider_name: string;
  description: string;
  affiliate_url: string;
};

const rules: Array<{ category: CategorySlug; expressions: RegExp[] }> = [
  { category: "credit-card", expressions: [/credit\s*cards?/i,/cash\s*back\s*cards?/i,/rewards?\s*cards?/i,/card\s*limit/i,/visa\s*credit/i,/mastercard\s*credit/i] },
  { category: "demat-account", expressions: [/de\s*mat/i,/trading\s*account/i,/stock\s*broker/i,/broking\s*account/i,/open\s*demat/i] },
  { category: "insurance", expressions: [/insurance/i,/health\s*cover/i,/term\s*plan/i,/life\s*cover/i,/policy\s*premium/i] },
  { category: "loan", expressions: [/loans?/i,/borrow/i,/lending/i,/emi\s*loan/i,/instant\s*cash/i,/personal\s*finance/i] },
  { category: "bank-account", expressions: [/bank\s*accounts?/i,/savings?\s*accounts?/i,/current\s*accounts?/i,/zero\s*balance/i,/digital\s*banking/i,/open\s*account/i,/salary\s*account/i] },
  { category: "investment", expressions: [/mutual\s*fund/i,/sip\b/i,/investments?/i,/portfolio/i,/systematic\s*investment/i,/fixed\s*deposit/i] }
];
const providerNames = /\b(HDFC(?: Bank)?|ICICI(?: Bank)?|Axis(?: Bank)?|SBI|State Bank of India|Kotak(?: Mahindra)?|IDFC FIRST(?: Bank)?|IndusInd(?: Bank)?|Yes Bank|AU Small Finance Bank|Federal Bank|Canara Bank|Bank of Baroda|Punjab National Bank|Zerodha|Groww|Angel One|Upstox|Paytm Money|Bajaj Finserv|Tata Capital|Navi|Moneyview|CreditBee|KreditBee|Branch)\b/i;

function guessCategory(text: string): CategorySlug | "" {
  const scores = rules.map(rule => ({
    category: rule.category,
    score: rule.expressions.reduce((score, expression) => score + (expression.test(text) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score);
  return scores[0]?.score ? scores[0].category : "";
}

function parseUrls(text: string): string[] {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s<>"'\u201c\u201d]+/gi) ?? [];
  const unique = new Set<string>();
  for (const found of matches) {
    const raw = found.replace(/[.,;:)}\]\u201d]+$/g, "");
    try {
      const url = new URL(/^www\./i.test(raw) ? "https://" + raw : raw);
      if (["https:", "http:"].includes(url.protocol)) unique.add(url.href);
    } catch {
      // OCR can introduce broken punctuation; the administrator can enter the link manually.
    }
  }
  return [...unique];
}

function extractTitle(text: string, category: CategorySlug | ""): string {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const selected = rules.find(rule => rule.category === category);
  const candidates = lines.filter(line =>
    line.length >= 5 && line.length <= 100 &&
    !/(https?:\/\/|www\.|apply now|click here|terms|conditions|disclaimer|follow us|scan here|http|^offer$|^ad$)/i.test(line)
  );
  const ranked = candidates.map((line, index) => {
    const keyword = selected?.expressions.some(x => x.test(line)) ? 9 : 0;
    const provider = providerNames.test(line) ? 3 : 0;
    const words = line.split(/\s+/).length;
    const size = words >= 2 && words <= 9 ? 2 : 0;
    return { line, score: keyword + provider + size - index * 0.1 };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.line.slice(0, 110) ?? "";
}

function makeSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90).replace(/-$/g, "") || "new-financial-product";
}

export function scannerSlug(title: string): string { return makeSlug(title); }

export default function PhotoScanner({ onUseDraft }: { onUseDraft: (draft: ScanDraft) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<{ terminate: () => Promise<unknown> } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState<CategorySlug | "">("");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    return () => URL.revokeObjectURL(localUrl);
  }, [file]);
  useEffect(() => () => { void workerRef.current?.terminate(); }, []);

  function selectFile(incoming?: File) {
    if (!incoming) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(incoming.type)) {
      setMessage("Choose a PNG, JPG or WebP photo."); return;
    }
    if (incoming.size > 10 * 1024 * 1024) {
      setMessage("Image size must be 10 MB or less."); return;
    }
    if (running) return;
    setFile(incoming);
    setMessage("");
    setRawText("");
    setTitle("");setDescription("");setProvider("");setLink("");setCategory("");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragging(false);
    selectFile(e.dataTransfer.files?.[0]);
  }

  async function scan() {
    if (!file || running) return;
    setRunning(true); setMessage(""); setProgress(0); setRawText("");
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | undefined;
    try {
      // OCR happens locally in the browser. The selected photo is not uploaded.
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        logger: (log: { status: string; progress: number }) => {
          if (log.status === "recognizing text") setProgress(Math.round((log.progress || 0) * 100));
        }
      });
      workerRef.current = worker;
      const result = await worker.recognize(file);
      const extracted = (result.data.text || "").trim();
      setRawText(extracted);
      if (!extracted) { setMessage("No readable text detected. Try a sharper image, or enter details manually."); return; }
      const guessedCategory = guessCategory(extracted);
      setCategory(guessedCategory);
      setTitle(extractTitle(extracted, guessedCategory));
      setProvider(extracted.match(providerNames)?.[0] || "");
      const urls = parseUrls(extracted);
      setLink(urls.find(url => !/youtube\.com|youtu\.be|instagram\.com|facebook\.com/i.test(url)) || urls[0] || "");
      setDescription(extracted.slice(0, 1500));
      setMessage("Scan complete. Review and correct the category, product name and link before using the draft.");
      setProgress(100);
    } catch (error) {
      setMessage("Could not scan this image: " + (error instanceof Error ? error.message : "OCR unavailable") + ". Try another image or browser.");
    } finally {
      if (worker) { try { await worker.terminate(); } catch {} }
      workerRef.current = null;
      setRunning(false);
    }
  }

  async function copyDetails() {
    const selected = categories.find(item => item.slug === category)?.title ?? "Not selected";
    const copiedText = `Category: ${selected}\nProduct: ${title}\nProvider: ${provider}\nLink: ${link}\n\nExtracted Details:\n${rawText || description}`;
    try {
      await navigator.clipboard.writeText(copiedText);
      setCopied(true); window.setTimeout(() => setCopied(false), 2500);
    } catch { setMessage("Clipboard permission unavailable. Select the extracted text and copy manually."); }
  }

  function draft() {
    if (!category || title.trim().length < 3) {
      setMessage("Select a category and enter the correct product name first."); return;
    }
    if (link.trim()) {
      try { if (!["http:", "https:"].includes(new URL(link).protocol)) throw Error(); }
      catch { setMessage("Enter a valid http:// or https:// affiliate link."); return; }
    }
    onUseDraft({ category, title: title.trim(), provider_name: provider.trim(), description: description.trim().slice(0, 1500), affiliate_url: link.trim() });
  }

  return <div className="space-y-5">
    <div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-forest-600">Admin tools</p>
      <h2 className="mt-1 text-2xl font-black text-forest-900">Scan Photo</h2>
      <p className="mt-2 text-sm text-slate-600">Extract product details and links from an offer screenshot. The image is <strong>not uploaded</strong> or published by scanning.</p>
    </div>
    <div className="card p-4 sm:p-6">
      <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={e=>{e.preventDefault();setDragging(false)}} onDrop={onDrop}
        className={`flex min-h-[210px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${dragging?"border-forest-600 bg-emerald-50":"border-emerald-200 bg-forest-50/40"}`}>
        <ImagePlus size={35} className="text-forest-700"/>
        <p className="mt-3 font-bold text-forest-900">Drag & drop your offer image</p>
        <p className="mt-1 text-xs text-slate-500">or choose an image · JPG, PNG, WebP · Max 10 MB</p>
        <input ref={inputRef} id="offer-photo" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e:ChangeEvent<HTMLInputElement>)=>selectFile(e.target.files?.[0])}/>
        <button type="button" onClick={()=>inputRef.current?.click()} disabled={running} className="btn-outline mt-4 !py-2 text-sm"><UploadCloud size={18}/>Choose Photo</button>
      </div>
      {preview && <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr]">
        <div className="overflow-hidden rounded-xl border bg-slate-50 p-2">
          {/* Client-side blob URL: no network upload */}
          <img src={preview} alt="Selected offer screenshot" className="h-auto max-h-72 w-full object-contain"/>
          <p className="mt-2 break-all text-xs text-slate-500">{file?.name}</p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <p className="text-sm text-slate-600">OCR reads visible text only. A button graphic without a printed URL cannot reveal its hidden target.</p>
          <button type="button" disabled={running} onClick={scan} className="btn-primary w-full sm:w-fit">
            {running?<LoaderCircle size={18} className="animate-spin"/>:<ScanLine size={18}/>}
            {running?"Scanning image...":"Scan Photo"}
          </button>
          {running&&<div><div className="h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full bg-emerald-600 transition-all" style={{width:progress+"%"}}/></div><p className="mt-1 text-xs text-slate-500">Recognition {progress}%</p></div>}
        </div>
      </div>}
      {message&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-forest-800">{message}</p>}
    </div>
    {rawText&&<div className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <div className="sm:col-span-2 flex items-center gap-2"><FileImage className="text-forest-700" size={20}/><h3 className="text-lg font-black">Review Scanned Details</h3></div>
      <label><span className="field-label">Detected Category *</span><select className="form-input" value={category} onChange={e=>setCategory(e.target.value as CategorySlug | "")}><option value="">Choose category</option>{categories.map(c=><option value={c.slug} key={c.slug}>{c.title}</option>)}</select></label>
      <label><span className="field-label">Product Name *</span><input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Correct the scanned product name"/></label>
      <label><span className="field-label">Bank / Provider</span><input className="form-input" value={provider} onChange={e=>setProvider(e.target.value)}/></label>
      <label><span className="field-label">Detected Affiliate / Website Link</span><input type="url" className="form-input" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..."/></label>
      <label className="sm:col-span-2"><span className="field-label">Description / Details (editable)</span><textarea className="form-input min-h-28" value={description} onChange={e=>setDescription(e.target.value)} rows={4}/></label>
      <label className="sm:col-span-2"><span className="field-label">Original Extracted Text</span><textarea readOnly className="form-input min-h-40 bg-slate-50" value={rawText} rows={8}/></label>
      <div className="sm:col-span-2 flex flex-wrap gap-3">
        <button type="button" className="btn-outline" onClick={copyDetails}>{copied?<Check size={17}/>:<ClipboardCopy size={17}/>} {copied?"Copied":"Copy Scanned Details"}</button>
        <button type="button" className="btn-primary" onClick={draft}><ShieldCheck size={17}/>Use as Unpublished Offer Draft</button>
      </div>
      <p className="sm:col-span-2 text-xs text-slate-500">Nothing is saved to your website automatically. “Use as Draft” only fills the Add Offer form; review, upload the product logo separately, and save manually when ready. Always verify URLs, rates and offers before publishing.</p>
    </div>}
  </div>;
}
