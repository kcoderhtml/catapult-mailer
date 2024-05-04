import { defineMiddleware } from "astro:middleware";
import type { DecodeResult, ExpirationStatus, Session } from "./auth";
import { decodeSession, encodeSession, checkExpirationStatus } from "./auth";

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

    const requestHeader = "X-JWT-Token";
    const responseHeader = "X-Renewed-JWT-Token";
    const header = context.request.headers.get(requestHeader);

    if (!header) {
        return unauthorized(`Required ${requestHeader} header not found. Please login to access this resource.`);
    }

    const decodedSession: DecodeResult = decodeSession(process.env.JWT_SECRET, header);

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

        context.request.headers.set(responseHeader, token);
    } else {
        session = decodedSession.session;
    }

    // Set the session on response.locals object for routes to access
    context.locals.session = session;

    console.log("Middleware: onRequest");

    // Request has a valid or renewed session. Call next to continue to the authenticated route handler
    return next();
});