SHOPMAX99 BACKEND STARTER

This is a local development backend starter added alongside the existing static website. The current website still uses browser storage until its modules are migrated to these API routes. This package does not claim that customer, seller, admin, cart, checkout, courier, or payment flows are already connected.

REQUIREMENTS
- Node.js 20 or newer
- Internet access for the first dependency installation

START
1. Open a terminal in the backend folder.
2. Run: npm install
3. Copy .env.example to .env.
4. Replace SHOPMAX99_API_TOKEN with a long random secret.
5. Run: npm start
6. Open http://127.0.0.1:8787/api/health. A healthy response contains ok:true.

API
- GET /api/health
- GET /api/records?kind=products&limit=100
- GET /api/records/{id}
- POST /api/records with JSON {"kind":"products","payload":{"name":"Sample"}}
- PUT /api/records/{id} with JSON {"kind":"products","payload":{"name":"Updated"}}
- DELETE /api/records/{id}

Every /api/records route requires Authorization: Bearer YOUR_SHOPMAX99_API_TOKEN. The health route is public. The database is created at DATABASE_PATH and persists between restarts.

IMPORTANT
This is a local starter, not a production-ready marketplace backend. Before public launch, migrate frontend data flows to API calls, add real customer/seller/admin authentication and role-based authorization, validation and audit logging, deploy with HTTPS and managed persistent database, and implement Razorpay order creation plus signature verification on the server. Do not place Razorpay secret keys in browser JavaScript. Any secret previously shared in chat should be rotated in the payment dashboard. Courier booking needs credentials and integration for the chosen courier provider.
