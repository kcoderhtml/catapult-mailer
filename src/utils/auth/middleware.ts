import { defineMiddleware } from "astro:middleware";
import type { DecodeResult, ExpirationStatus, Session } from "./auth";
import { decodeSession, encodeSession, checkExpirationStatus } from "./auth";

// `context` and `next` are automatically typed
export const auth = defineMiddleware((context, next,) => {
    console.log("Middleware: onRequest");

    // Request has a valid or renewed session. Call next to continue to the authenticated route handler
    return next();
});