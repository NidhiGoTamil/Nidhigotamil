import type {Metadata} from "next";

export const metadata:Metadata={title:"Disclaimer"};

export default function Disclaimer(){
 return <main className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
  <article className="card rounded-[20px] p-5 text-sm leading-7 text-slate-700 sm:p-8">
   <h1 className="text-2xl font-black text-forest-900 sm:text-3xl">Disclaimer</h1>
   <p className="mt-4">Welcome to NidhiGo Tamil. Information on this website is provided for general educational and informational purposes only. We provide information about loans, bank accounts, credit cards, demat accounts, insurance and investment products. Nothing published here should be treated as individualized financial, investment, insurance, legal or tax advice.</p>
   <h2 className="mt-5 text-base font-extrabold text-forest-900">Independent Information Platform</h2>
   <p className="mt-1">NidhiGo Tamil is not a bank, lender, insurer, stockbroker or financial product issuer. We do not provide loans, approve credit, issue cards, manage investments or guarantee the suitability of any particular product. The relevant provider alone decides eligibility, approval, pricing, product availability and terms.</p>
   <h2 className="mt-5 text-base font-extrabold text-forest-900">Accuracy and Product Terms</h2>
   <p className="mt-1">We aim to present useful information, but rates, fees, offers, rewards, eligibility rules and policies may change. We cannot guarantee that every published detail remains current or complete. Check the provider's official terms, charges, disclosures and applicable regulatory status before applying or making a financial decision.</p>
   <h2 className="mt-5 text-base font-extrabold text-forest-900">Affiliate and Third-Party Links</h2>
   <p className="mt-1">Some product buttons or links may be affiliate or referral links. NidhiGo Tamil may receive a commission when an eligible action is completed, at no guaranteed benefit to the visitor. When you leave this website, third-party providers control their own applications, services, privacy policies and transactions. We are not responsible for decisions made by those providers.</p>
   <h2 className="mt-5 text-base font-extrabold text-forest-900">Financial Risks</h2>
   <p className="mt-1">Borrowing can involve interest, charges and repayment obligations. Insurance products are subject to policy terms and exclusions. Investments, securities and mutual funds involve risks, and past performance does not guarantee future returns. Never make a financial decision based solely on promotional content.</p>
   <h2 className="mt-5 text-base font-extrabold text-forest-900">Personal Information</h2>
   <p className="mt-1">Please avoid sharing passwords, OTPs or sensitive banking credentials through enquiry forms. Review our Privacy Policy and the receiving provider's privacy notice before sharing personal details.</p>
   <p className="mt-5 rounded-xl bg-forest-50 p-3 text-xs text-forest-800">By using this website, you acknowledge that financial decisions are your own responsibility and that provider terms may change. For general enquiries, use the Contact &amp; Enquiries option in the menu.</p>
  </article>
 </main>;
}
