import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import https from "https";
import logger from "../../utils/logger.js";
import type { HttpOptions } from "./http.types.js";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ✅ Request interceptor
    this.client.interceptors.request.use((config) => {
      logger.info(`➡️ ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // ✅ Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`✅ ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error("❌ HTTP Error:", error.message);
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    url: string,
    options: HttpOptions = {}
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        url,
        method: options.method || "GET",
        headers: {
          ...options.headers,
        },
        data: options.body, 
      };

      const response = await this.client.request<T>(config);

      return response.data;
    } catch (error: any) {
      // 🔥 Better error handling
      if (error.response) {
        throw new Error(
          error.response.data?.message ||
            `HTTP Error: ${error.response.status}`
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  // 🚀 Public methods

  get<T>(url: string, options?: HttpOptions) {
    return this.request<T>(url, {
      ...options,
      method: "GET",
    });
  }

  post<T>(url: string, body?: unknown, options?: HttpOptions) {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body,
    });
  }

  put<T>(url: string, body?: unknown, options?: HttpOptions) {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body,
    });
  }

  delete<T>(url: string, options?: HttpOptions) {
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
    });
  }
}