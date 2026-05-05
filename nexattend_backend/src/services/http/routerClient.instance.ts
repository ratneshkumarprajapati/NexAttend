import { env } from "../../config/env.js";
import { HttpClient } from "./http.client.js";


export const routerClient = new HttpClient(env.ROUTER.BASE_URL);
