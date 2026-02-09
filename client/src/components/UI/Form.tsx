import React, { useState } from "react";
import { useGlobal } from "../Layout/context/Context";
import { useToast } from "./Toast";
import { apiService } from "../../services/api";

export default function Form() {
  type Header = {
    key: string;
    value: string;
  };

  const { setResponseData, token } = useGlobal();
  const { showToast } = useToast();

  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState("");
  const [headersKey, setHeadersKey] = useState("");
  const [headersValue, setHeadersValue] = useState("");
  const [urlerror, setUrlerror] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addMoreHeaders = () => {
    if (!headersKey.trim() || !headersValue.trim()) {
      showToast("Both key and value are required", "warning");
      return;
    }
    setHeaders([...headers, { key: headersKey, value: headersValue }]);
    setHeadersKey("");
    setHeadersValue("");
    showToast("Header added", "success");
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
    showToast("Header removed", "info");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate URL
    try {
      new URL(url);
      setUrlerror("");
    } catch {
      setUrlerror("Invalid URL");
      showToast("Invalid URL format", "error");
      return;
    }

    setIsLoading(true);

    if (!token) {
      showToast("Login to save request history", "info");
    }

    const finalHeaders = [...headers];
    const trimmedkey = headersKey.trim();
    const trimmedValue = headersValue.trim();

    if (trimmedkey && trimmedValue) {
      finalHeaders.push({ key: trimmedkey, value: trimmedValue });
    }

    try {
      const result = await apiService.post<any>(
        "/api/request",
        {
          url,
          method,
          headers: finalHeaders,
          body: method !== "GET" && body ? JSON.parse(body) : undefined,
        },
        token ? { Authorization: `Bearer ${token}` } : undefined,
      );

      setResponseData({
        request: result.request,
        response: result.response,
        savedToHistory: result.savedToHistory,
        duration: result.duration,
      });

      showToast(
        `Request successful (${result.duration}ms)${
          result.savedToHistory ? " - Saved to history" : ""
        }`,
        "success",
      );

      // Clear form
      setHeaders([]);
      setHeadersKey("");
      setHeadersValue("");
      setUrl("");
      setMethod("GET");
      setBody("");
    } catch (error: any) {
      console.error("Request failed:", error);
      showToast(error.message || "Failed to send request", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex w-100 justify-center items-center bg-white shadow-lg p-4 rounded-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 rounded-md justify-center border-2 border-black/30 h-full w-full px-3 py-2 relative">
        {isLoading && (
          <div className="flex w-full h-full flex-col gap-3 items-center justify-center absolute top-0 right-0 bg-white/90 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-center font-medium text-blue-500 text-xl">
              Sending request...
            </p>
          </div>
        )}

        <div className="flex gap-1 justify-between items-center w-full">
          <h3 className="flex items-center gap-2 text-nowrap text-xl font-bold text-blue-600/90">
            URL
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </span>
          </h3>
          <input
            type="text"
            value={url}
            className="w-60 rounded-md border-2 border-black/30 p-2 overflow-auto bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="enter your url"
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {urlerror.length > 0 && <p className="text-red-500">{urlerror}</p>}

        <div className="flex gap-2 items-center justify-between w-full">
          <h3 className="text-nowrap text-xl font-bold text-blue-600/90">
            Method
          </h3>
          <select
            name="method"
            id="method"
            value={method}
            className="px-2 py-2 w-60 border-2 border-black/30 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setMethod(e.target.value)}
            disabled={isLoading}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        {method !== "GET" && (
          <>
            <h3 className="text-xl text-center font-medium text-black/75">
              Headers
            </h3>
            <div className="flex flex-col gap-2 items-center justify-center w-full">
              <input
                type="text"
                placeholder="key"
                value={headersKey}
                className="w-full rounded-md border-2 border-black/30 p-2 overflow-auto bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHeadersKey(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="value"
                value={headersValue}
                className="w-full rounded-md border-2 border-black/30 p-2 overflow-auto bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHeadersValue(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              className="px-2 py-1 rounded-md bg-blue-500/90 hover:bg-blue-600/90 text-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={addMoreHeaders}
              disabled={!headersKey || !headersValue || isLoading}
            >
              ADD MORE
            </button>
            <ul className="flex flex-col gap-2 items-center justify-center w-full">
              {headers.map((header, index) => (
                <li
                  key={index}
                  className="flex w-full h-10 items-center justify-between gap-2"
                >
                  <div
                    className="w-[35%] h-full flex items-center px-2 text-start border-2 border-black/30 rounded-md overflow-x-auto whitespace-nowrap hide-scrollbar"
                    title={header.key}
                  >
                    {header.key}
                  </div>

                  <span className="text-xl">:</span>

                  <div
                    className="w-[35%] h-full flex items-center px-2 text-start border-2 border-black/30 rounded-md overflow-x-auto whitespace-nowrap hide-scrollbar"
                    title={header.value}
                  >
                    {header.value}
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-50"
                    onClick={() => removeHeader(index)}
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="text-xl text-center font-medium text-black/75">
              Body (JSON)
            </h3>
            <textarea
              placeholder='{"key": "value"}'
              className="w-full h-40 rounded-md border-2 border-black/30 p-2 overflow-auto bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
            />
          </>
        )}
        <button
          className="px-4 py-2 rounded-md bg-blue-500/90 hover:bg-blue-600/90 text-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
          type="submit"
          disabled={isLoading || !url}
        >
          {isLoading ? "Sending..." : "Send Request"}
        </button>
      </div>
    </form>
  );
}
