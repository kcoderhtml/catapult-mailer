import type { TAlgorithm } from "jwt-simple";
import pkg from 'jwt-simple';
const { encode, decode } = pkg

export interface Session {
    id: number;
    dateCreated: number;
    profile: {
        id: string;
        name: string;
        email: string;
        picture: string;
        locale: string;
        team: {
            id: string;
            name: string;
            domain: string;
            image: string;
        };
    };
    /**
     * Timestamp indicating when the session was created, in Unix milliseconds.
     */
    issued: number;
    /**
     * Timestamp indicating when the session should expire, in Unix milliseconds.
     */
    expires: number;
}

export type PartialSession = Omit<Session, "issued" | "expires">;

export interface EncodeResult {
    token: string,
    expires: number,
    issued: number
}

export type DecodeResult =
    | {
        type: "valid";
        session: Session;
    }
    | {
        type: "integrity-error";
    }
    | {
        type: "invalid-token";
    };

export type ExpirationStatus = "expired" | "active" | "grace";

// Always use HS512 to sign the token
const algorithm: TAlgorithm = "HS512";
export const gracePeriod = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export async function createSession(code: string, url: string): Promise<EncodeResult | null> {
    try {
        const initialSlackResponse = await (await fetch(`https://slack.com/api/oauth.v2.access?code=${code}&client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&redirect_uri=${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })).json();

        if (!initialSlackResponse.ok) {
            throw new Error("Failed to get access token: " + initialSlackResponse.error);
        }

        // get user profile
        const profileResponse = await fetch(
            "https://slack.com/api/openid.connect.userInfo",
            {
                method: "GET",
                headers: { Authorization: `Bearer ${initialSlackResponse.authed_user.access_token}` },
            }
        );
        const profileData = (await profileResponse.json()) as {
            ok: boolean;
            error: string | null;
            sub: string;
            "https://slack.com/user_id": string;
            "https://slack.com/team_id": string;
            email: string;
            email_verified: boolean;
            date_email_verified: number;
            name: string;
            picture: string;
            given_name: string;
            family_name: string;
            locale: string;
            "https://slack.com/team_name": string;
            "https://slack.com/team_domain": string;
            "https://slack.com/user_image_24": string;
            "https://slack.com/user_image_32": string;
            "https://slack.com/user_image_48": string;
            "https://slack.com/user_image_72": string;
            "https://slack.com/user_image_192": string;
            "https://slack.com/user_image_512": string;
            "https://slack.com/team_image_34": string;
            "https://slack.com/team_image_44": string;
            "https://slack.com/team_image_68": string;
            "https://slack.com/team_image_88": string;
            "https://slack.com/team_image_102": string;
            "https://slack.com/team_image_132": string;
            "https://slack.com/team_image_230": string;
            "https://slack.com/team_image_default": boolean;
        };

        if (!profileData.ok) {
            throw new Error("Failed to get user profile: " + profileData.error);
        }

        const partialSession: PartialSession = {
            id: parseInt(profileData["https://slack.com/user_id"]),
            dateCreated: Date.now(),
            profile: {
                id: profileData.sub,
                name: profileData.name,
                email: profileData.email,
                picture: profileData.picture,
                locale: profileData.locale,
                team: {
                    id: profileData["https://slack.com/team_id"],
                    name: profileData["https://slack.com/team_name"],
                    domain: profileData["https://slack.com/team_domain"],
                    image: profileData["https://slack.com/team_image_230"],
                },
            },
        };

        const session = encodeSession(process.env.JWT_SECRET, partialSession);

        if (!session) {
            throw new Error("Failed to create session.");
        }

        return session;
    } catch (error) {
        console.error("Failed to create token: ", error);
        return null;
    }
}

export function encodeSession(secretKey: string | undefined, partialSession: PartialSession): EncodeResult {
    if (!secretKey) {
        throw new Error("No secret key provided.");
    }

    // Determine when the token should expire
    const issued = Date.now();
    const fifteenMinutesInMs = 15 * 60 * 1000;
    const expires = issued + fifteenMinutesInMs;
    const session: Session = {
        ...partialSession,
        issued: issued,
        expires: expires
    };

    return {
        token: encode(session, secretKey, algorithm),
        issued: issued,
        expires: expires
    };
}

export function decodeSession(secretKey: string | undefined, tokenString: string): DecodeResult {
    if (!secretKey) {
        throw new Error("No secret key provided.");
    }

    let result: Session;

    try {
        result = decode(tokenString, secretKey, false, algorithm);
    } catch (_e: unknown) {
        const e: Error = _e as Error;

        // These error strings can be found here:
        // https://github.com/hokaccha/node-jwt-simple/blob/c58bfe5e5bb049015fcd55be5fc1b2d5c652dbcd/lib/jwt.js
        if (e.message === "No token supplied" || e.message === "Not enough or too many segments") {
            return {
                type: "invalid-token"
            };
        }

        if (e.message === "Signature verification failed" || e.message === "Algorithm not supported") {
            return {
                type: "integrity-error"
            };
        }

        // Handle json parse errors, thrown when the payload is nonsense
        if (e.message.indexOf("Unexpected token") === 0) {
            return {
                type: "invalid-token"
            };
        }

        throw e;
    }

    return {
        type: "valid",
        session: result
    }
}

export function checkExpirationStatus(token: Session): ExpirationStatus {
    const now = Date.now();

    if (token.expires > now) return "active";

    // Find the timestamp for the end of the token's grace period
    const gracePeriodAfterExpiration = token.expires + gracePeriod;

    if (gracePeriodAfterExpiration > now) return "grace";

    return "expired";
}

