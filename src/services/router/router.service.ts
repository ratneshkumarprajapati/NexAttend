import { AppError } from "../../utils/appError.js";
import type {
  FetchClientConfig,
  FetchErrorResponse,
  FetchRequestConfig,
  FetchResponse,
  HttpMethod,
  QueryParams,
} from "./router.types.js";

const DEFAULT_TIMEOUT = 30_000;

export class FetchError<T = unknown> extends AppError {
  response: FetchErrorResponse<T> | undefined;

  constructor(message: string, statusCode = 500, response?: FetchErrorResponse<T>) {
    super(message, statusCode);
    this.name = "FetchError";
    this.response = response;
  }
}

const buildUrl = (url: string, params?: QueryParams, baseURL?: string) => {
  const targetUrl = new URL(url, baseURL);

  if (!params) {
    return targetUrl.toString();
  }

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          targetUrl.searchParams.append(key, String(item));
        }
      }
      continue;
    }

    if (value !== undefined && value !== null) {
      targetUrl.searchParams.set(key, String(value));
    }
  }

  return targetUrl.toString();
};

const buildHeaders = (configHeaders?: HeadersInit, requestHeaders?: HeadersInit) => {
  const headers = new Headers(configHeaders);

  if (requestHeaders) {
    const incomingHeaders = new Headers(requestHeaders);
    incomingHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
};

const buildBody = (body: FetchRequestConfig["body"], headers: Headers) => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    body instanceof ReadableStream
  ) {
    return body;
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return JSON.stringify(body);
};

const parseResponseBody = async (response: Response) => {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.startsWith("text/")) {
    return response.text();
  }

  const text = await response.text();
  return text || undefined;
};

const createTimeoutSignal = (timeout: number, externalSignal?: AbortSignal) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const abortFromExternalSignal = () => {
    controller.abort((externalSignal as AbortSignal).reason);
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener("abort", abortFromExternalSignal, {
        once: true,
      });
    }
  }

  const cleanup = () => {
    clearTimeout(timeoutId);

    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortFromExternalSignal);
    }
  };

  return { cleanup, signal: controller.signal };
};

class FetchClient {
  constructor(private readonly config: FetchClientConfig = {}) {}

  async request<T = unknown>(
    url: string,
    config: FetchRequestConfig = {},
  ): Promise<FetchResponse<T>> {
    const {
      baseURL,
      body: requestBody,
      headers: requestHeaders,
      method: requestMethod,
      params,
      timeout: requestTimeout,
      ...fetchOptions
    } = config;
    const method = (requestMethod ?? "GET") as HttpMethod;
    const headers = buildHeaders(this.config.headers, requestHeaders);
    const targetUrl = buildUrl(
      url,
      params,
      baseURL ?? this.config.baseURL,
    );
    const body = buildBody(requestBody, headers);
    const timeout = requestTimeout ?? this.config.timeout ?? DEFAULT_TIMEOUT;
    const { cleanup, signal } = createTimeoutSignal(timeout, fetchOptions.signal);

    try {
      const requestInit: RequestInit = {
        ...fetchOptions,
        headers,
        method,
        signal,
      };

      if (body !== undefined) {
        requestInit.body = body;
      }

      const response = await fetch(targetUrl, requestInit);

      const data = (await parseResponseBody(response)) as T;
      const result: FetchResponse<T> = {
        data,
        headers: response.headers,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };

      if (!response.ok) {
        throw new FetchError(
          response.statusText || "Request failed",
          response.status,
          {
            data,
            headers: response.headers,
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          },
        );
      }

      return result;
    } catch (error) {
      if (error instanceof FetchError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new FetchError(`Request timeout after ${timeout}ms`, 408);
      }

      if (error instanceof Error) {
        throw new FetchError(error.message, 500);
      }

      throw new FetchError("Unknown request error", 500);
    } finally {
      cleanup();
    }
  }

  get<T = unknown>(url: string, config?: Omit<FetchRequestConfig, "method" | "body">) {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  delete<T = unknown>(
    url: string,
    config?: Omit<FetchRequestConfig, "method" | "body">,
  ) {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  post<T = unknown>(
    url: string,
    body?: FetchRequestConfig["body"],
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, {
      ...config,
      ...(body !== undefined ? { body } : {}),
      method: "POST",
    });
  }

  put<T = unknown>(
    url: string,
    body?: FetchRequestConfig["body"],
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, {
      ...config,
      ...(body !== undefined ? { body } : {}),
      method: "PUT",
    });
  }

  patch<T = unknown>(
    url: string,
    body?: FetchRequestConfig["body"],
    config?: FetchRequestConfig,
  ) {
    return this.request<T>(url, {
      ...config,
      ...(body !== undefined ? { body } : {}),
      method: "PATCH",
    });
  }
}

export const createFetchClient = (config?: FetchClientConfig) => {
  return new FetchClient(config);
};

export const routerService = createFetchClient();

export const isFetchError = <T = unknown>(error: unknown): error is FetchError<T> => {
  return error instanceof FetchError;
};

export const withBaseUrl = (baseURL: string, config?: Omit<FetchClientConfig, "baseURL">) => {
  return createFetchClient({
    ...config,
    baseURL,
  });
};
