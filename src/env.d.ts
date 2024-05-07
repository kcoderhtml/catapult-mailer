/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type NetlifyLocals = import('@astrojs/netlify').NetlifyLocals
import type { Session } from "./utils/auth/auth";

declare namespace App {
    interface Locals extends NetlifyLocals {
        session: Session;
    }
}