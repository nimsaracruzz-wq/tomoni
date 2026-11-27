This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Permanently clear registration data

The admin interface can archive registrations, but permanent deletion requires the maintenance script below. Deploy the version containing this script, back up the persistent `/app/data` volume, and run it during a maintenance window with new registrations and email processing paused.

Preview the affected records first:

```bash
node scripts/purge-registration-data.mjs
```

Only after reviewing the preview, execute the purge explicitly:

```bash
node scripts/purge-registration-data.mjs --apply --confirm-all-registrations
```

The purge removes applications, student profiles, linked enrollment and email history, registration audit records, legacy registration JSON files, and saved campaign recipient selections. It preserves staff accounts and app settings. It cannot be undone without restoring the backup. The database path is taken from `DB_PATH`, or defaults to `DATA_DIR/tomoni.sqlite`.
