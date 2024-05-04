import { sequence } from "astro/middleware";
import { auth } from "./utils/auth/middleware";

console.log("Middleware: executing onRequest");

export const onRequest = sequence(auth);