# NidhiGo Tamil — Next.js + Tailwind + Supabase

**Status: deployable source project, NOT YET LIVE.** GitHub, Supabase and Vercel accounts may be connected without an actual repository/project. The live deployment and database must be provisioned separately. The top/homepage Apply Now CTA has been removed as requested; enquiries remain available from individual product details to support the Admin Applications dashboard.

## Features

- Mobile-first, clean green/white website based on the screenshot layout
- **Homepage ends after 6 centered category tiles**: removed the main Apply Now CTA and all sections below it (features, featured products, social footer on home)
- Top-right hamburger menu: Website, About, Disclaimer, Terms (**no Apply Now menu entry**)
- Six categories: Loans, Bank Accounts, Credit Cards, Demat Account, Insurance and Investment (bundled screenshot-reference icon PNG placeholders)
- Two clearly marked demo products per category; category → product detail → benefits/documents/steps → optional YouTube tutorial → third-party affiliate link
- Enquiry form: name, email, phone, category, selected product, purpose, message and explicit consent
- Server-side validation, Supabase persistence, no public read/write access to private applications
- Protected admin login backed by Supabase Auth + separate approved `admin_users` membership
- Admin overview with counts per category; application table with status/notes, category, search, and calendar date filtering in **IST**
- Excel `.xlsx` export for selected date range and category (up to 10,000 applications per export)
- Admin product add/edit/unpublish, promo text, documents, process steps, logo image, video and affiliate link
- Admin upload for six category icons plus the site logo and banner, and settings for social links
- Hero banner `<img class="w-full h-auto object-contain">`, retains aspect ratio on all screens **without cropping**

## Setup

### 1. Prerequisites
- Node.js >= 20
- GitHub repository (empty private or public repository)
- Supabase project in your chosen organization/region
- Vercel Next.js project connected to the GitHub repository

### 2. Supabase
1. Create a new Supabase project in the **organization and billing plan you approve**.
2. Open Supabase SQL Editor and run `supabase/migrations/001_nidhigo.sql` once.
3. Under **Authentication → Users**, create an authorized admin user with a strong password. Do not enable public self-registration for administrators.
4. Copy that user's UUID and run the following SQL (replace the placeholder):

```sql
insert into public.admin_users(user_id)
values ('REPLACE-WITH-ADMIN-AUTH-USER-UUID')
on conflict do nothing;
```

5. Copy the **Project URL**, the **anon/publishable key**, and **service_role/secret key** from Supabase API settings. **Never put the service role key in public variables or client-side code.**

### 3. Local development

```bash
cp .env.example .env.local
# Put YOUR OWN values into .env.local
npm install
npm run dev
```

Open `http://localhost:3000` for the website and `http://localhost:3000/admin/login` for admin login.

Without Supabase credentials, the public site uses 12 demo products for preview. The apply form is intentionally disabled rather than pretending to save customer data.

### 4. GitHub
Create a repository named e.g. `nidhigo-tamil` under the correct account, then add this project:

```bash
git init
git add .
git commit -m "Initial NidhiGo Tamil Next.js website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nidhigo-tamil.git
git push -u origin main
```

This archive does **not** include a Git repository or committed GitHub files yet. No connector action in the current integration creates a new repository.

### 5. Vercel
1. Import the GitHub repository as a Next.js project.
2. Add these **environment variables** to Production (and Preview as appropriate):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` **server only**
   - `NEXT_PUBLIC_SITE_URL` (optional)
3. Deploy and check `/`, all six category pages, `/apply`, and `/admin/login`.
4. Test one non-production form submission, then verify it appears in Admin → Applications. Test category/date filtering and export.
5. Connect `nidhigo.com` via Vercel project domains and your domain provider's DNS settings, **only after** testing and your approval.

### 6. Edit brand/logo/banner without code changes
Sign in to `/admin`, choose **Website Settings**. Upload the new logo, landscape banner, and six transparent category PNGs. The wide banner preserves the original aspect ratio with no cropping.

### 7. Add real products and links
Admin → Add / Edit Offers. Fill in bank/provider name, verified details, required documents, numbered steps, YouTube tutorial URL, and **your own affiliate URL**. Set `Demo Product` off and `Published` on once details are verified. All financial figures must match provider terms; sample offers contain no unverified cashback or interest rates.

## Security and compliance before going live
- Personal data is stored in `applications`; the Supabase anon user has **no read/write RLS policy** for this table. The server writes after validating a submission and checking repetition by phone number.
- No customer data is stored in LocalStorage.
- Service role key is only accessed in server code.
- Admin APIs each independently verify session identity **and** membership in `admin_users`.
- This is a technical baseline. Before live marketing, replace draft Privacy/Terms with a legally reviewed privacy notice including operator identity, contact/grievance details, purpose, retention, customer rights, any data-sharing, and relevant Indian legal requirements. Do not claim “we will never share data” if providers ever receive leads.
- Enable Supabase/Vercel security monitoring, abuse protections, backups, cookie and data-retention policies.
- Link out to providers securely (`target=_blank` + `rel="noopener noreferrer sponsored"`). Product approval is never guaranteed.
- **Important:** An end-to-end Vercel build and live Supabase integration test require the projects to exist and working npm dependency resolution; they have NOT been verified merely by producing these files.

## Project structure

```
app/
  page.tsx                      Homepage: banner and six centered category cards only
  category/[slug]/page.tsx      Six category pages
  product/[slug]/page.tsx       Details, documents, video, affiliate CTA
  apply/page.tsx                Enquiry form
  admin/login/page.tsx          Supabase Auth login
  admin/page.tsx                Protected dashboard
  api/applications/route.ts     Public enquiry endpoint
  api/admin/*                   Privileged stats, applications, export, offers, image upload, settings
components/                     UI and admin controls
lib/                            Server/database/data validation
supabase/migrations/             SQL tables, policies and demo products
```

## Notes
- **One ZIP archive** contains the whole project. Next.js cannot run as one standalone code file because it requires framework configuration, routes, UI components, assets and backend handlers.
- Social account links, provider information, product details and final logo/banner are placeholders until supplied. Six icons from the provided screenshot are included as initial placeholders.
- The apply/enquiry route remains reachable from an individual product detail page, but **not** from the homepage or hamburger menu. If you later want to remove lead collection entirely, the admin applications feature would need to be revised too.
- For a production application, full integration and browser tests are required before processing real customer leads.
