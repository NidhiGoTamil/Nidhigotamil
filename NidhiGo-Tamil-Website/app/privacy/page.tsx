import Link from "next/link";
import type {Metadata} from "next";

export const metadata:Metadata={title:"Privacy Policy"};

export default function PrivacyPage(){
 return <main className="mx-auto max-w-3xl px-4 py-7 sm:py-10">
  <article className="card space-y-4 p-5 text-sm leading-7 text-slate-700 sm:p-8">
   <h1 className="text-2xl font-black text-forest-900">Privacy Policy</h1>
   <p>NidhiGo Tamil is an independent financial-product information and affiliate website. This page explains how information submitted on our website is handled.</p>
   <h2 className="text-lg font-bold text-forest-900">Information You Provide</h2>
   <p>If you submit a product enquiry, our form may collect your name, email address, phone number, product category, selected product and any message you choose to provide.</p>
   <h2 className="text-lg font-bold text-forest-900">Use and Access</h2>
   <p>We use submitted information to review and respond to your enquiry. The administration dashboard restricts access to approved administrators. We do not sell enquiry details.</p>
   <h2 className="text-lg font-bold text-forest-900">Third-Party Products and Links</h2>
   <p>Some links lead to external financial product providers or affiliates. Those websites may collect information under their own privacy notices. Review their policies before entering personal or financial information.</p>
   <h2 className="text-lg font-bold text-forest-900">Your Questions</h2>
   <p>For a question about information submitted through this site, use our <Link href="/apply" className="font-bold text-forest-700 underline">Contact &amp; Enquiries</Link> page. Data retention and deletion arrangements should be confirmed in the operator's final policy.</p>
   <p className="text-xs text-slate-500">This policy describes the current website functionality and should be reviewed by the site operator for compliance with applicable laws.</p>
  </article>
 </main>
}
