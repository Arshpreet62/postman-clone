import React, { useState, useEffect } from "react";
import { useGlobal } from "../Layout/context/Context";
import ResponseShowcase from "./ResponseDisplay";

interface RequestHistoryItem {
  _id: string; // MongoDB document ID as a string
  user: string; // the userId field you store
  endpoint: string; // the URL or endpoint
  method: string; // HTTP method (GET, POST, etc.)
  timestamp: string; // ISO string date (from new Date())
  request: {
    headers: Record<string, string | string[]>; // headers can be strings or arrays of strings
    body?: any; // request body can be any type (optional)
  };
  response: {
    status: number; // HTTP status code, e.g. 500
    statusText: string; // status text, e.g. "Request Failed"
    headers: Record<string, string | string[]>; // response headers, same format as request headers
    body?: any; // response body (error object or anything else)
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRequests: number;
  limit: number;
}

// Helper to normalize headers: convert string[] to comma-joined strings
const normalizeHeaders = (
  headers: Record<string, string | string[]>
): Record<string, string> => {
  const normalized: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    normalized[key] = Array.isArray(value) ? value.join(", ") : value;
  });
  return normalized;
};

const RequestHistory: React.FC = () => {
  const { token } = useGlobal();
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestHistoryItem | null>(null);

  const fetchHistory = async (page: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://postman-clone-ci4y.onrender.com/api/history?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        `https://postman-clone-ci4y.onrender.com/api/history/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        // Refresh current page after deletion
        fetchHistory(currentPage);
        setSelectedRequest(null);
      } else {
        console.error("Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const clearAllHistory = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to clear all request history?")) return;

    try {
      const response = await fetch(
        "https://postman-clone-ci4y.onrender.com/api/history",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setHistory([]);
        setPagination(null);
        setSelectedRequest(null);
      } else {
        console.error("Failed to clear history");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  // Return color classes for status codes
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  // Return color classes for HTTP methods
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "POST":
        return "bg-green-100 text-green-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fetch history on page or token change
  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Request History</h2>
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No request history found</p>
          <p className="text-gray-400 text-sm mt-2">
            Make some API requests to see them here
          </p>
        </div>
      ) : (
        <>
          <ul className="bg-white shadow rounded-md divide-y divide-gray-200">
            {history.map((req) => (
              <li
                key={req._id}
                className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getMethodColor(
                      req.method
                    )}`}
                  >
                    {req.method}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                      {req.endpoint}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      req.response.status
                    )}`}
                  >
                    {req.response.status}
                  </span>
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteRequest(req._id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 rounded bg-gray-100 text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ResponseShowcase
              request={{
                url: selectedRequest.endpoint,
                method: selectedRequest.method,
                headers: normalizeHeaders(selectedRequest.request.headers),
                body: selectedRequest.request.body
                  ? JSON.stringify(selectedRequest.request.body, null, 2)
                  : "",
              }}
              response={{
                status: selectedRequest.response.status,
                statusText: selectedRequest.response.statusText,
                headers: normalizeHeaders(selectedRequest.response.headers),
                body: selectedRequest.response.body,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestHistory;
