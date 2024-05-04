import { defineMiddleware } from "astro:middleware";
import type { DecodeResult, ExpirationStatus, Session } from "./auth";
import { decodeSession, encodeSession, checkExpirationStatus, gracePeriod } from "./auth";

const PUBLIC_ROUTES = ["/", "/login"];

// `context` and `next` are automatically typed
export const auth = defineMiddleware(async (context, next,) => {
    // Ignore auth validation for public routes
    if (PUBLIC_ROUTES.includes(context.url.pathname)) {
        // Respond as usual 
        return next();
    }

    const unauthorized = (message: string) => {
        return new Response(message, {
            status: 302,
            statusText: "Unauthorized",
            headers: {
                Location: context.url.origin + "?error=" + encodeURIComponent(message)
            }
        });
    }

    const cookieName = "session";
    const sessionCookie = context.cookies.get(cookieName);

    if (!sessionCookie) {
        return unauthorized(`Required ${cookieName} cookie not found. Please login to access this resource.`);
    }

    const decodedSession: DecodeResult = decodeSession(process.env.JWT_SECRET, sessionCookie.value);

    if (decodedSession.type === "integrity-error" || decodedSession.type === "invalid-token") {
        return unauthorized(`Failed to decode or validate authorization token. Reason: ${decodedSession.type}.`);
    }

    const expiration: ExpirationStatus = checkExpirationStatus(decodedSession.session);

    if (expiration === "expired") {
        return unauthorized(`Authorization token has expired. Please create a new authorization token by logging in again.`);
    }


    let session: Session;

    if (expiration === "grace") {
        // Automatically renew the session and send it back with the response
        const { token, expires, issued } = encodeSession(process.env.JWT_SECRET, decodedSession.session);
        session = {
            ...decodedSession.session,
            expires: expires,
            issued: issued
        };

        context.cookies.set(cookieName, token, { expires: new Date(expires + gracePeriod) });
    } else {
        session = decodedSession.session;
    }

    // Request has a valid or renewed session. Call next to continue to the authenticated route handler
    return next();
});