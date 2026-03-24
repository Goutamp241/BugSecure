import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { convertUSDToINR } from "../utils/currency";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const AnalyticsCharts = ({
  analytics,
  userRole,
  range,
  onRangeChange,
}) => {
  const submissionsByMonthData = analytics?.submissionsByMonth || [];
  const bugReportsBySeverityData = analytics?.bugReportsBySeverity || [];
  const paymentsByStatusData = analytics?.paymentsByStatus || [];

  const earningsByPeriodData = analytics?.earningsByPeriod || [];
  const bugsSubmittedVsAcceptedData =
    analytics?.bugsSubmittedVsAcceptedByPeriod || [];
  const userEarningsPieData = analytics?.userEarningsPie || [];

  const valueToINRLabel = (value) => {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (!Number.isFinite(num)) return "₹0.00 INR";
    return `₹${convertUSDToINR(num).toFixed(2)} INR`;
  };

  const handleRangeChange = (e) => {
    if (onRangeChange) {
      onRangeChange(e.target.value);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-bold text-blue-400">
          Analytics
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">Range:</label>
          <select
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
            value={range || "monthly"}
            onChange={handleRangeChange}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Money Added Over Time */}
        {earningsByPeriodData.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              Money Added Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsByPeriodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => valueToINRLabel(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earningsUSD"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Earnings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bugs Submitted vs Accepted */}
        {bugsSubmittedVsAcceptedData.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              Bugs Submitted vs Accepted
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bugsSubmittedVsAcceptedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="period" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="submittedCount"
                  fill="#3b82f6"
                  name="Submitted"
                />
                <Bar
                  dataKey="acceptedCount"
                  fill="#10b981"
                  name="Accepted"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Earnings Pie */}
        {userEarningsPieData.length > 0 &&
          (userRole === "ADMIN" || userRole === "USER") && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                User Earnings Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userEarningsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, earningsUSD }) =>
                      `${name}: ${valueToINRLabel(earningsUSD)}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="earningsUSD"
                    nameKey="name"
                  >
                    {userEarningsPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => valueToINRLabel(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

        {/* Legacy charts (kept) */}
        {submissionsByMonthData.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              Submissions by Month
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={submissionsByMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {bugReportsBySeverityData.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              Bug Reports by Severity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bugReportsBySeverityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ severity, count }) => `${severity}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="severity"
                >
                  {bugReportsBySeverityData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {paymentsByStatusData.length > 0 &&
          (userRole === "ADMIN" || userRole === "COMPANY") && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                Payments by Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentsByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="status" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    name="Payments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        {userRole === "ADMIN" &&
          analytics?.topResearchers &&
          analytics.topResearchers.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                Top Researchers
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.topResearchers}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#9ca3af"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="earnings"
                    fill="#f59e0b"
                    name="Earnings (USD)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
      </div>
    </div>
  );
};

export default AnalyticsCharts;













