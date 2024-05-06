import type { APIRoute } from 'astro';
import { db, Subscribers } from 'astro:db';

function generateSecret() {
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return secret;
}

export const POST: APIRoute = async ({ params, request }) => {
    try {
        if (request.headers.get("Content-Type") === "application/json") {
            const json = await request.json()

            if (!json.email) {
                throw new Error("Email is required");
            } if (!json.name) {
                throw new Error("Name is required");
            }

            // Save the email to the database
            await db.insert(Subscribers).values({
                name: json.name,
                email: json.email,
                subscribedAt: new Date(),
                secret: generateSecret()
            });

            return new Response(JSON.stringify({ ok: true, message: "subscribed", email: json.email, name: json.name }), {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        } else {
            throw new Error("Invalid Content-Type");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error);

            return new Response(JSON.stringify({ ok: false, message: error.message }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }

        return new Response(JSON.stringify({ ok: false, message: "An unknown error occurred" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}

export const GET: APIRoute = async ({ params }) => {
    return new Response(JSON.stringify({ ok: true, message: "Hello from the subscribe API" }), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    });
}