import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  type NextMiddleware,
  type NextRequest,
  NextResponse,
} from "next/server";

/**
 * Creates a middleware that assigns a random variant to a user for A/B testing.
 * The variant is stored in a cookie and can be accessed via the `x-ab-{id}` header.
 * If the cookie already exists, it will use the existing variant.
 *
 * Example usage:
 * ```ts
 * import { createABAssignmentMiddleware } from 'next-ab-middleware'
 *
 * export const middleware = createABAssignmentMiddleware({
 *   id: 'my-test',
 *   cookieName: 'my-test-cookie',
 *   cookieOptions: { maxAge: 60 * 60 * 24 * 30 }, // 30 days
 *   numberOfVariants: 3,
 * })
 *
 * export const config = {
 *   matcher: ['/'],
 * }
 * ```
 *
 * Example headers in the response:
 * ```raw
 * x-ab-my-test: 0
 * ```
 *
 * You can use this while SSR-ing your pages to customize content based on the variant flicker-free:
 * ```tsx
 * export async function getServerSideProps(context) {
 *  const variant = context.req.headers['x-ab-my-test']
 *  return {
 *    props: {
 *      variant,
 *    },
 *  }
 * }
 *
 * export default function MyPage({ variant }) {
 *  return <div>Your variant is: {variant}</div>
 * }
 */
export function createABAssignmentMiddleware({
  id,
  cookieName = "ab-middleware",
  cookieOptions = {},
  numberOfVariants = 2,
}: {
  id: string;
  cookieName?: string;
  cookieOptions?: Partial<ResponseCookie>;
  numberOfVariants?: number;
}): NextMiddleware {
  return async (req: NextRequest): Promise<NextResponse<unknown>> => {
    let cookieObject: { [key: string]: string } = {};
    let cookieValue: string | undefined;
    try {
      cookieObject = JSON.parse(req.cookies.get(cookieName)?.value || "{}");
      cookieValue = cookieObject[id];
    } catch {}

    const response = NextResponse.next();

    if (cookieValue) {
      response.headers.set(`x-ab-${id}`, cookieValue);
      response.cookies.set(
        cookieName,
        JSON.stringify(cookieObject),
        cookieOptions
      );
      return response;
    }

    const variant = Math.floor(Math.random() * numberOfVariants).toString();

    response.cookies.set(
      cookieName,
      JSON.stringify({
        ...cookieObject,
        [id]: variant,
      }),
      cookieOptions
    );

    response.headers.set(`x-ab-${id}`, variant);
    return response;
  };
}
