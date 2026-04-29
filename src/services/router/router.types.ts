export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type QueryParams = Record<string, QueryValue>;

export interface FetchClientConfig {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
}

export interface FetchRequestConfig
  extends Omit<RequestInit, "body" | "headers" | "method" | "signal"> {
  baseURL?: string;
  body?: BodyInit | Record<string, unknown> | null;
  headers?: HeadersInit;
  method?: HttpMethod;
  params?: QueryParams;
  signal?: AbortSignal;
  timeout?: number;
}

export interface FetchResponse<T = unknown> {
  data: T;
  headers: Headers;
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
}

export interface FetchErrorResponse<T = unknown> {
  data?: T;
  headers: Headers;
  status: number;
  statusText: string;
  url: string;
}
