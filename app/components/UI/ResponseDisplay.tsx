"use client";

import React, { useState } from "react";

export type RequestData = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
};

export type ResponseData = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  savedToHistory?: boolean;
};

type Props = {
  request?: RequestData;
  response?: ResponseData;
};

const ResponseShowcase: React.FC<Props> = ({ request, response }) => {
  const [copied, setCopied] = useState(false);

  if (!request || !response) return null;

  const formattedHeaders = Object.entries(response.headers).map(
    ([key, value]) => `${key}: ${value}`,
  );

  const generatedFetchCode = () => {
    const method = request.method;
    const headers = request.headers || null;
    const body =
      method !== "GET" && request.body
        ? `body: JSON.stringify(${JSON.stringify(request.body, null, 2)})`
        : "";

    return `fetch("${request.url}", {
  method: "${method}",
  headers: ${JSON.stringify(headers, null, 2)},
  ${body ? body + "," : ""}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
  };

  const code = generatedFetchCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="p-4 bg-gray-800 rounded-xl text-white shadow">
        <div className="flex items-center justify-between h-20">
          <div>
            <h2 className="text-lg font-bold mb-2">Response</h2>
            <p>
              Status: {response.status} {response.statusText}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex py-3 px-8 bg-orange-500 hover:bg-orange-400 rounded-md transition"
          >
            {copied ? (
              "Copied!"
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                />
              </svg>
            )}
          </button>
        </div>

        {response.headers && (
          <>
            <h3 className="mt-4 font-semibold">Headers</h3>
            <pre className="bg-gray-700 p-3 rounded-md overflow-auto text-sm">
              {formattedHeaders.join("\n")}
            </pre>
          </>
        )}

        <h3 className="mt-4 font-semibold">Body</h3>
        <pre className="bg-gray-700 p-3 max-h-100 rounded-md overflow-auto text-sm">
          {JSON.stringify(response.body, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ResponseShowcase;
