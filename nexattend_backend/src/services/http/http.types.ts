
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface HttpOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface NodeRequestInt extends RequestInit{
   agent:any
}