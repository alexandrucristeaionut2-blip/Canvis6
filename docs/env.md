# Environment variables

## Database

- `DATABASE_URL` (required)
  - Local (SQLite): `file:./dev.db`
  - Production (Postgres): a standard Postgres connection string

## S3-compatible storage (customer uploads)

Customer photos can be stored in a private S3-compatible bucket (AWS S3 / Cloudflare R2 / etc.).

Required:
- `S3_BUCKET`
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

Optional:
- `S3_ENDPOINT` (needed for non-AWS providers like Cloudflare R2)

Notes:
- Bucket should be private; app uses **signed URLs** (10 min) for admin/customer access.
- Upload keys follow:
  - `orders/{orderPublicId}/items/{itemPublicId}/customer/{uuid}.{ext}`

## Cloudinary (preview-payment flow)

Used by the `/create` **Pay now** flow to upload customer photos into dynamic per-order folders.

Required (server-side):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional (client-side convenience):
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

Upload folders:
- Originals: `canvist/orders/{orderPublicId}/originals`
- Previews (optional): `canvist/orders/{orderPublicId}/previews`

Notes:
- Never expose `CLOUDINARY_API_SECRET` to the browser.
- The client requests a signature from `POST /api/cloudinary/sign` and then uploads directly to Cloudinary.

## Admin notifications

Optional:
- `ADMIN_WEBHOOK_URL`
  - Receives JSON on paid orders:
    - `{ event: "order.paid", orderPublicId, adminUrl, orderAdminUrl }`

## Auth (NextAuth)

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Admin session

- `ADMIN_TOKEN` (required for /admin/login)
