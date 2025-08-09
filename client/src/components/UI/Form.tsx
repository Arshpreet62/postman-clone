import React, { useState } from "react";
import { useGlobal } from "../Layout/context/Context";

export default function Form() {
  type Header = {
    key: string;
    value: string;
  };
  const { setResponseData, token, user } = useGlobal();
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [body, setBody] = useState("");
  const [headersKey, setHeadersKey] = useState("");
  const [headersValue, setHeadersValue] = useState("");
  const [urlerror, setUrlerror] = useState("");
  const [requestError, setRequestError] = useState("");
  const addMoreHeaders = () => {
    setHeaders([...headers, { key: headersKey, value: headersValue }]);
    setHeadersKey("");
    setHeadersValue("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      new URL(url);
      setUrlerror("");
    } catch {
      setUrlerror("Invalid URL");
      return;
    }
    const finalHeaders = [...headers];
    const trimmedkey = headersKey.trim();
    const trimmedValue = headersValue.trim();
    if (trimmedkey && trimmedValue) {
      finalHeaders.push({ key: trimmedkey, value: trimmedValue });
    }

    const check = finalHeaders.some((header) => header.key === "Content-Type");

    if (!check && method !== "GET") {
      finalHeaders.push({ key: "Content-Type", value: "application/json" });
    }
    console.log(finalHeaders);

    try {
      const response = await fetch("http://localhost:5000/api/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url,
          method,
          headers: finalHeaders,
          body,
        }),
      });

      const result = await response.json();

      setResponseData({
        request: {
          url: result.request.url,
          method: result.request.method,
          headers: result.request.headers,
          body: result.request.body,
        },
        response: {
          status: result.response.status,
          statusText: result.response.statusText,
          headers: result.response.headers,
          body: result.response.body,
        },
        savedToHistory: result.savedToHistory,
      });
      setHeaders([]);
      setHeadersKey("");
      setHeadersValue("");
      setUrl("");
      setMethod("GET");
      setBody("");
    } catch (error) {
      console.error("Request failed:", error);
      setRequestError("Failed to send request. Please try again.");
    }
  };
  return (
    <form
      className="flex w-100 justify-center items-center bg-white shadow-lg p-4 rounded-lg"
      onSubmit={handleSubmit}
    >
      <div className="flex  flex-col gap-3 rounded-md justify-center border-2 border-black/30  h-full w-full px-3 py-2 relative">
        {requestError.length > 0 && (
          <div className="flex w-full h-full flex-col gap-3 items-center justify-center absolute top-0 right-0 bg-white z-10">
            <p className="text-center font-medium text-red-500 text-3xl">
              {requestError}
            </p>
            <button
              type="button"
              className="px-2 py-1 rounded-md bg-blue-500/90 text-xl font-bold text-white"
              onClick={() => setRequestError("")}
            >
              Clear
            </button>
          </div>
        )}
        <div className="flex  gap-1 justify-between items-center w-full">
          <h3 className=" flex items-center gap-2 text-nowrap text-xl font-bold text-blue-600/90">
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
            className="w-60 rounded-md border-2 border-black/30 p-2 overflow-auto  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="enter your url"
            onChange={(e) => setUrl(e.target.value)}
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
            className="px-2 py-2 w-60 border-2  border-black/30 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
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
                className="w-full rounded-md border-2 border-black/30 p-2 overflow-auto  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHeadersKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="value"
                value={headersValue}
                className="w-full rounded-md border-2 border-black/30 p-2 overflow-auto  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setHeadersValue(e.target.value)}
              />
            </div>
            <button
              className="px-2 py-1 rounded-md bg-blue-500/90 hover:bg-blue-600/90 text-xl font-bold text-white"
              type="button"
              onClick={addMoreHeaders}
              disabled={!headersKey || !headersValue}
            >
              ADD MORE
            </button>
            <ul className="flex flex-col gap-2 items-center justify-center w-full">
              {headers.map((header, index) => (
                <li
                  key={index}
                  className="flex w-full h-10 items-center justify-between gap-2"
                >
                  {/* Header Key */}
                  <div
                    className="w-[35%] h-full flex items-center px-2 text-start border-2 border-black/30 rounded-md overflow-x-auto whitespace-nowrap hide-scrollbar"
                    title={header.key}
                  >
                    {header.key}
                  </div>

                  {/* Colon */}
                  <span className="text-xl">:</span>

                  {/* Header Value */}
                  <div
                    className="w-[35%] h-full flex items-center px-2 text-start border-2 border-black/30 rounded-md overflow-x-auto whitespace-nowrap hide-scrollbar"
                    title={header.value}
                  >
                    {header.value}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                    onClick={() =>
                      setHeaders(headers.filter((_, i) => i !== index))
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="text-xl text-center font-medium text-black/75">
              Body
            </h3>
            <textarea
              placeholder="enter your body"
              className="w-full h-40  rounded-md border-2 border-black/30 p-2 overflow-auto  bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </>
        )}
        <button
          className="px-2 py-1 rounded-md bg-blue-500/90 hover:bg-blue-600/90 text-xl font-bold text-white"
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
}
