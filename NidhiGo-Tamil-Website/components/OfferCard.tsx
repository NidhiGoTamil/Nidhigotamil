import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Offer } from "@/lib/demo";

/**
 * Compact category listing: prominent unframed logo, title, one useful line
 * and an Apply Now action. Full product details stay on the product page.
 */
export default function OfferCard({ offer }: { offer: Offer }) {
  const isNaviLoan = offer.category === "loan" && offer.title.trim().toLowerCase() === "navi loan";
  const title = isNaviLoan ? "Navi Loan App" : offer.title;
  const interestMatch = offer.description?.match(/(?:interest\s*rate|rate\s*of\s*interest)\s*[:\-]\s*([^\r\n]+)/i);
  const interest = interestMatch?.[1]?.trim();
  const subtitle = offer.category === "loan"
    ? `Interest Rate: ${interest || "Based on eligibility"}`
    : (offer.highlight?.trim() || "View product details and eligibility");

  return (
    <article className="flex h-full min-w-0 items-center gap-3 rounded-[22px] border border-slate-100 bg-white px-3 py-4 shadow-[0_8px_24px_rgba(10,51,39,0.06)] sm:gap-4 sm:px-4 sm:py-5">
      <div className="grid h-[76px] w-[76px] shrink-0 place-items-center overflow-hidden rounded-[18px] bg-transparent sm:h-[88px] sm:w-[88px]">
        {offer.logo_url ? (
          <img
            src={offer.logo_url}
            alt={offer.title + " logo"}
            className="h-full w-full scale-110 rounded-[18px] object-contain"
          />
        ) : (
          <span className="grid h-full w-full place-items-center rounded-[18px] bg-forest-50 text-3xl font-black text-forest-700">
            {offer.provider_name.charAt(0) || "N"}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="break-words text-[17px] font-black leading-tight tracking-tight text-[#087853] sm:text-[22px]">
          {title}
        </h2>
        <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-800 sm:text-[13px]">
          {subtitle}
        </p>
      </div>
      <Link
        href={`/product/${offer.slug}`}
        aria-label={`Apply Now — ${title}, view details and application link`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-[15px] bg-[#087953] px-3 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition hover:bg-[#056542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087953] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
      >
        Apply Now <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Link>
    </article>
  );
}
