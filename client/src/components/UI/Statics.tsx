import React, { useState, useEffect } from "react";
import { useGlobal } from "../Layout/context/Context";
import { RxCross2 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa";

interface Statistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  methodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

const Statistics: React.FC = () => {
  const { token } = useGlobal();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://postman-clone-ci4y.onrender.com/api/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch statistics");
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!stats || stats.totalRequests === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No statistics available</p>
        <p className="text-gray-400 text-sm mt-2">
          Make some API requests to see statistics
        </p>
      </div>
    );
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500";
      case "POST":
        return "bg-green-500";
      case "PUT":
        return "bg-yellow-500";
      case "DELETE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    const statusCode = parseInt(status);
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 400 && statusCode < 500) return "bg-yellow-500";
    if (statusCode >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Request Statistics</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Requests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    <FaCheck size={20} />
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Successful
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.successfulRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">
                    <RxCross2 size={20} />
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Failed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.failedRequests}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.successRate.toFixed(1)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Requests by Method
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.methodBreakdown).map(([method, count]) => (
              <div key={method} className="flex items-center">
                <div className="flex items-center flex-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-3 ${getMethodColor(
                      method
                    )}`}
                  ></span>
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {method}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getMethodColor(method)}`}
                        style={{
                          width: `${(count / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Requests by Status Code
          </h3>
          <div className="space-y-4">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div className="flex items-center flex-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-3 ${getStatusColor(
                      status
                    )}`}
                  ></span>
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {status}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{
                          width: `${(count / stats.totalRequests) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Rate Visualization */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Success Rate Overview
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${stats.successRate}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {stats.successRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {stats.successfulRequests} of {stats.totalRequests} successful
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchStatistics}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default Statistics;
