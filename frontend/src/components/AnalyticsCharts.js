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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const AnalyticsCharts = ({ analytics, userRole }) => {
  // Prepare data for submissions by month chart
  const submissionsByMonthData = analytics?.submissionsByMonth || [];

  // Prepare data for bug reports by severity chart
  const bugReportsBySeverityData = analytics?.bugReportsBySeverity || [];

  // Prepare data for payments by status chart
  const paymentsByStatusData = analytics?.paymentsByStatus || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Submissions by Month */}
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

      {/* Bug Reports by Severity */}
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
                {bugReportsBySeverityData.map((entry, index) => (
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

      {/* Payments by Status */}
      {paymentsByStatusData.length > 0 && (userRole === "ADMIN" || userRole === "COMPANY") && (
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
              <Bar dataKey="count" fill="#10b981" name="Payments" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Researchers (Admin only) */}
      {userRole === "ADMIN" && analytics?.topResearchers && analytics.topResearchers.length > 0 && (
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
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="earnings" fill="#f59e0b" name="Earnings (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;













