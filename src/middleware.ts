import { sequence } from "astro/middleware";
import { auth } from "./utils/auth/middleware";
import { defineMiddleware } from "astro:middleware";
import arcjet, { shield } from "@arcjet/node";
import type { ArcjetNodeRequest } from "@arcjet/node";

console.log("Middleware: executing onRequest");

const arcjetShield = defineMiddleware(async (context, next) => {
    const aj = arcjet({
        key: process.env.ARCJET_KEY as string,
        rules: [
            // Protect against common attacks with Arcjet Shield
            shield({
                mode: "LIVE", // Change to "LIVE" to block requests
            }),
        ],
    });

    const arcjetRequest: ArcjetNodeRequest = {
        method: context.request.method,
        url: context.request.url,
        headers: Object.fromEntries(context.request.headers),
    };

    const decision = await aj.protect(arcjetRequest);

    for (const result of decision.results) {
        console.log("Rule Result", result);
    }

    console.log("Conclusion", decision.conclusion);

    if (decision.isDenied()) {
        return new Response("Forbidden", {
            status: 403,
        });
    } else {
        return next();
    }
});

export const onRequest = sequence(arcjetShield, auth);