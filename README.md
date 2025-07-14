![NPM Version](https://img.shields.io/npm/v/next-ab-middleware)

# Next.js AB Middleware

Effortlessly implement and manage A/B tests in your Next.js applications. next-ab-middleware simplifies user assignment to test variants, ensuring consistent experiences and providing easy access to variant data.

## ✨ Features
- Simple Variant Assignment: Easily assign users to different A/B test variants.

- Persistent Assignments: Assignments are stored in a cookie for consistent user experiences.

- Header Propagation: Variant assignments are passed via a custom HTTP header (x-ab-&lt;test-id&gt;).

- Multiple Test Support: Manage multiple A/B tests concurrently.

## 📦 Installation

```bash
npm install next-ab-middleware
# or
yarn add next-ab-middleware
# or
pnpm add next-ab-middleware
``` 

## 🚀 Getting Started
### 1\. Configure middleware 
Add the middleware to your Next.js application. Here we add it to middleware.ts for the root path.

```typescript
// middleware.ts
import { createABAssignmentMiddleware } from "next-ab-middleware";

export const middleware = createABAssignmentMiddleware({
  id: "example-test",        // Unique ID for your test
  cookieName: "ab-middleware", // Cookie to store assignments
  numberOfVariants: 2,     // Number of variants (e.g., 2 for A/B)
});

export const config = {
  matcher: ["/"], // Apply middleware to the root path
};
```

This assigns users to variant 0 or variant 1 (50% chance each), stores assignments in the "ab-middleware" cookie, and propagates the assignment via the x-ab-example-test header.

### 2\. Access the assigned variant in your application
Access the assigned variant using either the HTTP header or the cookie.

#### Using HTTP Header (Server Components / getServerSideProps)

```tsx
// app/page.tsx (App Router)
import { headers } from 'next/headers';

export default function HomePage() {
  const abVariant = headers().get('x-ab-example-test'); // e.g., '0' or '1'

  return (
    <div>
      <h1>A/B Test Variant: {abVariant}</h1>
      {abVariant === '0' && <p>Content for Variant A.</p>}
      {abVariant === '1' && <p>Content for Variant B.</p>}
    </div>
  );
}


// Or for Pages Router (pages/index.tsx):
/*
export async function getServerSideProps({ req }) {
  const abVariant = req.headers['x-ab-example-test'];
  return { props: { abVariant: abVariant || null } };
}
*/
```
#### Using Cookies (Client Components)

```tsx
// app/some-component.tsx (Client Component)
'use client';
import { useEffect, useState } from 'react';
import jsCookie from 'js-cookie';

export default function SomeComponent() {
  const [abVariant, setAbVariant] = useState<string | null>(null);

  useEffect(() => {
    const variant = jsCookie.get('ab-middleware'); // e.g., '0' or '1'
    setAbVariant(variant);
  }, []);

  return (
    <div>
      <h1>A/B Test Variant: {abVariant}</h1>
      {abVariant === '0' && <p>Content for Variant A.</p>}
      {abVariant === '1' && <p>Content for Variant B.</p>}
    </div>
  );
}
```