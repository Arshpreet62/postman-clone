"use client";

import React, { useState } from "react";
import { useGlobal } from "./context/Context";
import { useRouter } from "next/navigation";
import RequestForm from "../UI/Form";
import RequestHistory from "../UI/RequestHistory";
import Statistics from "../UI/Statics";
import ResponseShowcase from "../UI/ResponseDisplay";

const Dashboard: React.FC = () => {
  const { user, logout, responseData } = useGlobal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"request" | "history" | "stats">(
    "request",
  );

  const handleLogout = async () => {
    try {
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/");
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">API Tester</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user ? user.email : "Guest"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("request")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "request"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Make Request
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Request History
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stats"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Statistics
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {activeTab === "request" && (
            <div className="space-y-6">
              <RequestForm />
              {responseData && (
                <ResponseShowcase
                  request={responseData.request}
                  response={responseData.response}
                />
              )}
            </div>
          )}
          {activeTab === "history" && <RequestHistory />}
          {activeTab === "stats" && <Statistics />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
