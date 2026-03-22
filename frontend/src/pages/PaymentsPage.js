import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { formatCurrencyWithConversion } from "../utils/currency";

const PaymentsPage = ({ user: userProp }) => {
  const [user, setUser] = useState(userProp);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If user not provided as prop, get from localStorage
    if (!user || !user.role) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser && storedUser.role) {
        setUser(storedUser);
      } else {
        // Fetch user from API
        fetchUser();
      }
    }
  }, []);

  useEffect(() => {
    if (user && user.role) {
      fetchPayments();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const res = await API.get("/api/dashboard/me");
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/login");
    }
  };

  const fetchPayments = async () => {
    if (!user || !user.role) {
      setLoading(false);
      return;
    }
    try {
      const endpoint = user.role === "COMPANY" ? "/api/payments/company" : "/api/payments/researcher";
      const res = await API.get(endpoint);
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId, status, transactionId, notes) => {
    try {
      const res = await API.put(`/api/payments/${paymentId}/status`, {
        status,
        transactionId,
        notes,
      });
      if (res.data.success) {
        fetchPayments();
        alert("Payment status updated successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update payment status");
    }
  };

  if (loading || !user || !user.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const totalEarned = payments
    .filter(p => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amountUSD || 0), 0);

  const totalPending = payments
    .filter(p => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((sum, p) => sum + (p.amountUSD || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-20 md:pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
              Payment History
            </h1>
            <p className="text-gray-300 text-sm md:text-base">
              {user.role === "COMPANY" 
                ? "View payment history. Payments are now automatic via wallet when you approve bug reports." 
                : "View your payment history. Rewards are automatically credited to your wallet when bug reports are approved."}
            </p>
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> Payments are now automated via wallet. When a company approves a bug report, 
                the reward is automatically transferred from the company's wallet to the researcher's wallet. 
                No manual payment processing is required.
              </p>
            </div>
          </div>
        </div>

        {user.role === "COMPANY" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Total Paid</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrencyWithConversion(totalEarned).usd}
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {formatCurrencyWithConversion(totalEarned).inr}
              </p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Pending Payments</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrencyWithConversion(totalPending).usd}
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {formatCurrencyWithConversion(totalPending).inr}
              </p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 sm:col-span-2 md:col-span-1">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Total Payments</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">{payments.length}</p>
            </div>
          </div>
        )}

        {user.role !== "COMPANY" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Total Earned</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrencyWithConversion(totalEarned).usd}
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {formatCurrencyWithConversion(totalEarned).inr}
              </p>
            </div>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700">
              <h3 className="text-sm md:text-lg font-semibold text-blue-400 mb-2">Pending</h3>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {formatCurrencyWithConversion(totalPending).usd}
              </p>
              <p className="text-gray-400 text-xs md:text-sm mt-1">
                {formatCurrencyWithConversion(totalPending).inr}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4 md:p-6 border border-gray-700">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-400">Payments</h2>
          {payments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No payments found.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-gray-700 p-4 md:p-6 rounded-lg border border-gray-600"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 break-words">
                        {payment.bugReportTitle}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm break-words">
                        {user.role === "COMPANY" 
                          ? `Researcher: ${payment.researcherName}`
                          : `Company: ${payment.companyName}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ${
                        payment.status === "COMPLETED"
                          ? "bg-green-600 text-white"
                          : payment.status === "FAILED"
                          ? "bg-red-600 text-white"
                          : payment.status === "PROCESSING"
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs md:text-sm">Amount (INR)</p>
                      <p className="text-white font-bold text-sm md:text-lg">
                        {formatCurrencyWithConversion(payment.amountUSD).inr}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs md:text-sm">Amount (USD)</p>
                      <p className="text-white font-bold text-sm md:text-lg">
                        {formatCurrencyWithConversion(payment.amountUSD).usd}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs md:text-sm">Payment Method</p>
                      <p className="text-white font-semibold text-xs md:text-sm break-words">{payment.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs md:text-sm">Date</p>
                      <p className="text-white text-xs md:text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {payment.transactionId && (
                    <p className="text-gray-400 text-xs md:text-sm mb-2 break-words">
                      Transaction ID: {payment.transactionId}
                    </p>
                  )}

                  {payment.notes && (
                    <p className="text-gray-400 text-xs md:text-sm mb-4 break-words">Notes: {payment.notes}</p>
                  )}

                  {user.role === "COMPANY" && payment.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() =>
                          handleUpdateStatus(payment.id, "PROCESSING", null, null)
                        }
                        className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition text-xs md:text-sm"
                      >
                        Mark as Processing
                      </button>
                      <button
                        onClick={() => {
                          const transactionId = prompt("Enter Transaction ID:");
                          const notes = prompt("Enter Notes (optional):");
                          if (transactionId) {
                            handleUpdateStatus(
                              payment.id,
                              "COMPLETED",
                              transactionId,
                              notes || null
                            );
                          }
                        }}
                        className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition text-xs md:text-sm"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;

