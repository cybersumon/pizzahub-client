🍕 PizzaHub — Client
A responsive, role-aware restaurant ordering application built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui. PizzaHub connects customers, restaurant vendors, and administrators through dedicated experiences for browsing food, handling orders, managing restaurants, and subscribing to premium vendor tools.
> **Project type:** Full-stack assignment — frontend repository  
> **Backend:** Separate PizzaHub Server repository  
> **Status:** Development and local testing completed for core features; production deployment and final end-to-end verification should be completed before submission.
Live Links
Resource	URL
Client live site	`ADD_CLIENT_LIVE_URL`
Client GitHub repository	`ADD_CLIENT_REPOSITORY_URL`
Server GitHub repository	`ADD_SERVER_REPOSITORY_URL`
Server API / health	`ADD_SERVER_BASE_URL/api/health`
Replace the placeholders after deployment. Do not publish credentials or private keys in the README.
Features
Authentication and role-based navigation: Customer, vendor, and administrator experiences with protected dashboard routes.
Restaurant onboarding: Vendors register their restaurant and await administrator approval before managing approved resources.
Editable restaurant profile: Restaurant name, address, phone, description, and logo image upload.
Food menu browsing: Customers can browse restaurant menu items and open detailed item views.
Vendor menu management: Vendors create, edit, and manage their own menu items, subject to approval and plan limits.
Admin review workflows: Administrators review restaurants and submitted menu items, and manage users.
Customer order flow: Customers place orders; vendors view and manage incoming orders.
Subscription plans: Free, Premium, and Premium+ experiences with Stripe-hosted subscription checkout and billing management.
Subscription visibility: Current plan, effective access, menu-item limit, scheduled cancellation, and access end date are displayed using backend-verified data.
Responsive dashboards: Separate admin and vendor workspaces, sidebars, status cards, and mobile-friendly layouts.
> **Premium+ table reservations:** A reservation experience is advertised in the membership UI, but vendor reservation management is currently shown as **Coming Soon**. Do not present this as a completed feature during evaluation.
Technology Stack
Framework: Next.js 16 (App Router)
Language: TypeScript / React
Styling: Tailwind CSS v4
UI components: shadcn/ui and Lucide icons
Authentication: Better Auth (connected to backend)
Payments: Stripe Checkout and Stripe Customer Portal via backend APIs
Images: ImgBB integration for restaurant logos, if configured
Getting Started
Prerequisites
Node.js compatible with the installed Next.js version (prefer a current LTS release)
npm
Running PizzaHub backend, typically at `http://localhost:7000`
A configured MongoDB and Stripe test environment on the backend for database/payment features
Install and run
```bash
git clone ADD_CLIENT_REPOSITORY_URL
cd pizzahub-client
npm install
```
Create a local environment file named `.env.local`:
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:7000

# Only if the existing logo upload code requires this setting:
NEXT_PUBLIC_IMGBB_API_KEY=YOUR_IMGBB_PUBLIC_UPLOAD_KEY
```
Important: Any variable prefixed with `NEXT_PUBLIC_` is exposed to browsers. Never place Stripe secret keys, webhook secrets, database credentials, or other confidential values there. Review the ImgBB upload integration and its quotas before public deployment.
Start the development server:
```bash
npm run dev
```
Open http://localhost:3000.
Production build
```bash
npx tsc --noEmit
npm run build
npm run start
```
Verify the scripts in `package.json` if your local project differs.
Main Pages and Workflows
Page / area	Purpose
`/`	Home and discovery
`/menu`	Browse food and restaurants
`/sign-in`, `/sign-up`	Authentication
`/profile`	Customer account profile
`/dashboard/vendor`	Vendor overview and restaurant status
`/dashboard/vendor/restaurant`	Restaurant profile and branding
`/dashboard/vendor/menu`	Vendor menu management
`/dashboard/vendor/orders`	Vendor order management
`/dashboard/vendor/subscription`	Membership information and Stripe billing
`/admin/restaurants`	Restaurant approval
`/admin/menu`	Menu approval
`/admin/users`	User management
`/admin/subscriptions`	Subscription overview
Some routes are protected and require the appropriate role or restaurant approval.
How Subscriptions Work
An approved vendor selects Premium or Premium+.
The frontend requests a Checkout Session from the backend and redirects the vendor to Stripe.
Stripe sends signed webhook events to the backend; the backend updates MongoDB.
The frontend reads the effective plan from the backend, rather than trusting URL parameters.
Existing subscribers use Stripe Customer Portal to upgrade, update billing details, or schedule cancellation.
If cancellation is scheduled for the end of a period, paid benefits remain available until the effective end date.
The backend is the source of truth for plan entitlements. A successful redirect alone is not proof of payment.
Test Accounts
Use your own locally created customer, vendor, and administrator test accounts. Do not commit real account emails, passwords, recovery codes, card data, or production access tokens to GitHub.
For Stripe test mode only, Stripe documents `4242 4242 4242 4242` as a successful Visa test card. Use a future expiry date and any valid CVC; no real money is transferred.
Quality Checks Before Submission
[ ] Customer can browse menu items and place an order.
[ ] Vendor can create a restaurant; admin can approve it.
[ ] Vendor can create/edit menu items; admin review works.
[ ] Vendor can see and manage incoming orders.
[ ] Free vendor cannot exceed the configured approved/active menu limit.
[ ] Stripe Premium checkout and Premium+ upgrade work in test mode.
[ ] Cancellation date displays correctly after webhook synchronization.
[ ] Customer and vendor accounts cannot access admin-only data.
[ ] Responsive layouts work on mobile and desktop.
[ ] `npx tsc --noEmit` and `npm run build` pass.
[ ] Public URLs, README links, and environment settings are correct.
Deployment Notes
Deploy the backend first and verify its `/api/health` endpoint.
Set `NEXT_PUBLIC_API_URL` to the HTTPS backend base URL at build/deploy time.
Configure backend `CLIENT_URL`, Better Auth trusted origins, and CORS for the exact client origin.
Use HTTPS for production authentication and Stripe redirects.
Verify the production build, login/logout, role access, menu, orders, and Stripe webhooks after deployment.
Project Structure (Simplified)
```text
pizzahub-client/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── dashboard/vendor/
│   │   ├── menu/
│   │   ├── profile/
│   │   └── restaurant/setup/
│   ├── components/
│   │   ├── admin/
│   │   ├── vendor/
│   │   └── layout/
│   └── lib/
├── public/
├── package.json
└── README.md
```
Known Scope Limitations
Vendor table-reservation management is currently marked Coming Soon.
End-of-period subscription expiry and automatic Free-plan restoration require a dedicated end-to-end test, including webhook/reconciliation behavior.
Final production URLs and deployment configuration must be filled in after deployment.
Author
PizzaHub — Full-stack restaurant ordering assignment.