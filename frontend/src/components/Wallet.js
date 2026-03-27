import React, { useState, useEffect } from "react";
import API from "../services/api";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showCompanyAgreement, setShowCompanyAgreement] = useState(false);
  const [companyAgreementAccepted, setCompanyAgreementAccepted] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [withdrawalReference, setWithdrawalReference] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    fetchWallet();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await API.get("/api/wallet");
      if (res.data.success) {
        setWallet(res.data.data);
        setSelectedCurrency(res.data.data?.currency || "USD");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = (c) => {
    const cc = (c || "USD").toUpperCase();
    if (cc === "INR") return "₹";
    if (cc === "EUR") return "€";
    return "$";
  };

  const convertFromUsd = (amountUsd, c) => {
    const cc = (c || "USD").toUpperCase();
    const rates = { USD: 1, INR: 83, EUR: 0.92 };
    const r = rates[cc] || 1;
    return (amountUsd || 0) * r;
  };

  const formatMoney = (amountUsd, c) => {
    const cc = (c || "USD").toUpperCase();
    const v = convertFromUsd(amountUsd, cc);
    return `${currencySymbol(cc)}${Number(v).toFixed(2)}`;
  };

  const handleChangeCurrency = async (currency) => {
    setSelectedCurrency(currency);
    try {
      const res = await API.post("/api/wallet/currency", { currency });
      if (res.data?.success) {
        setWallet(res.data.data);
        setSelectedCurrency(res.data.data?.currency || currency);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update currency");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");

    // Check if company agreement is accepted
    if (user?.role === "COMPANY" && !user?.companyAgreementAccepted) {
      setShowCompanyAgreement(true);
      return;
    }

    try {
      const res = await API.post("/api/wallet/deposit", {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        description: description || "Wallet deposit",
        paymentMethod: paymentMethod,
      });
      if (res.data.success) {
        setWallet(res.data.data);
        setShowDeposit(false);
        setAmount("");
        setDescription("");
        alert("Deposit successful!");
        fetchWallet();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Deposit failed";
      setError(errorMsg);
      if (errorMsg.includes("Company agreement must be accepted")) {
        setShowCompanyAgreement(true);
      }
    }
  };

  const handleAcceptCompanyAgreement = async () => {
    if (!companyAgreementAccepted) {
      setError("Please accept the company agreement to continue");
      return;
    }

    try {
      const agreementText = "Company Agreement Terms and Conditions";
      const res = await API.post("/api/contract/company/accept", {
        agreementText: agreementText,
      });
      if (res.data.success) {
        // Update user in localStorage
        const updatedUser = { ...user, companyAgreementAccepted: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowCompanyAgreement(false);
        setCompanyAgreementAccepted(false);
        // Retry deposit
        handleDeposit({ preventDefault: () => {} });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept agreement");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!paymentMethod) {
      setError("Please select a withdrawal method");
      return;
    }

    if (paymentMethod === "BANK_TRANSFER") {
      if (!accountHolderName || !accountHolderName.trim()) {
        setError("Account holder name is required for bank transfers");
        return;
      }
      if (!withdrawalReference || !withdrawalReference.trim()) {
        setError("Bank account number is required");
        return;
      }
      if (!ifscCode || !ifscCode.trim()) {
        setError("IFSC code is required for bank transfers");
        return;
      }
      // Validate IFSC format (4 letters + 0 + 6 digits)
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifscCode.toUpperCase())) {
        setError("Invalid IFSC code format. Format: 4 letters + 0 + 6 alphanumeric (e.g., SBIN0000456)");
        return;
      }
    }

    if (paymentMethod === "UPI") {
      if (!withdrawalReference || !withdrawalReference.trim()) {
        setError("UPI ID is required");
        return;
      }
      // Validate UPI format
      const upiRegex = /^[\w.-]+@[a-zA-Z]+$/;
      if (!upiRegex.test(withdrawalReference)) {
        setError("Invalid UPI ID format. Format: name@provider (e.g., yourname@okaxis)");
        return;
      }
    }

    if (paymentMethod === "PAYPAL") {
      if (!withdrawalReference || !withdrawalReference.trim()) {
        setError("PayPal email is required");
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(withdrawalReference)) {
        setError("Invalid email format");
        return;
      }
    }

    try {
      const res = await API.post("/api/wallet/withdraw", {
        amount: parseFloat(amount),
        currency: selectedCurrency,
        description: description || `Wallet withdrawal via ${paymentMethod}`,
        withdrawalMethod: paymentMethod,
        withdrawalReference: withdrawalReference,
        accountHolderName: paymentMethod === "BANK_TRANSFER" ? accountHolderName : null,
        ifscCode: paymentMethod === "BANK_TRANSFER" ? ifscCode : null,
      });
      if (res.data.success) {
        setWallet(res.data.data);
        setShowWithdraw(false);
        setAmount("");
        setDescription("");
        setPaymentMethod("");
        setWithdrawalReference("");
        setAccountHolderName("");
        setIfscCode("");
        alert("Withdrawal successful! Funds will be transferred within 2-3 business days.");
        fetchWallet();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Withdrawal failed");
    }
  };

  const isCompany = user?.role === "COMPANY";
  const isResearcher = user?.role === "USER";

  if (loading) {
    return <div className="text-white p-4">Loading wallet...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">Wallet</h2>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
      )}

      {wallet && (
        <>
          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-400 text-sm">Wallet Address</p>
                <p className="text-white font-mono text-sm">{wallet.walletAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatMoney(wallet.balance, selectedCurrency)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-gray-400 text-sm">Currency</div>
              <select
                value={selectedCurrency}
                onChange={(e) => handleChangeCurrency(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            {/* Companies can only deposit */}
            {isCompany && (
              <button
                onClick={() => {
                  setShowDeposit(true);
                  setShowWithdraw(false);
                }}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                Add Funds (Deposit)
              </button>
            )}
            
            {/* Researchers can only withdraw */}
            {isResearcher && (
              <button
                onClick={() => {
                  setShowWithdraw(true);
                  setShowDeposit(false);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Withdraw Funds
              </button>
            )}
          </div>

          {/* Deposit Modal (Companies Only) */}
          {showDeposit && isCompany && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Add Funds to Wallet</h3>
                <form onSubmit={handleDeposit}>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Amount ({selectedCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Payment Method</label>
                    <select
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Description (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Initial funding for bug bounty program"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                    >
                      Add Funds
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeposit(false);
                        setAmount("");
                        setDescription("");
                      }}
                      className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Withdraw Modal (Researchers Only) */}
          {showWithdraw && isResearcher && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Withdraw Funds</h3>
                <form onSubmit={handleWithdraw}>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Amount ({selectedCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={convertFromUsd(wallet?.balance || 0, selectedCurrency)}
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Available: {formatMoney(wallet?.balance || 0, selectedCurrency)}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Withdrawal Method</label>
                    <select
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        // Clear fields when method changes
                        setWithdrawalReference("");
                        setAccountHolderName("");
                        setIfscCode("");
                      }}
                      required
                    >
                      <option value="">Select Method</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="PAYPAL">PayPal</option>
                    </select>
                  </div>

                  {/* Dynamic Fields for Bank Transfer */}
                  {paymentMethod === "BANK_TRANSFER" && (
                    <>
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-300">Account Holder Name</label>
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white"
                          value={accountHolderName || ""}
                          onChange={(e) => setAccountHolderName(e.target.value)}
                          placeholder="Enter account holder name"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-300">Bank Account Number</label>
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white"
                          value={withdrawalReference || ""}
                          onChange={(e) => setWithdrawalReference(e.target.value)}
                          placeholder="Enter bank account number"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2 text-gray-300">IFSC Code</label>
                        <input
                          type="text"
                          className="w-full p-3 rounded-lg bg-gray-700 text-white"
                          value={ifscCode || ""}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          placeholder="Enter IFSC code (e.g., SBIN0000456)"
                          required
                          maxLength={11}
                        />
                        <p className="text-gray-400 text-xs mt-1">
                          Format: 4 letters + 0 + 6 digits (e.g., SBIN0000456)
                        </p>
                      </div>
                    </>
                  )}

                  {/* Dynamic Fields for UPI */}
                  {paymentMethod === "UPI" && (
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-300">UPI ID</label>
                      <input
                        type="text"
                        className="w-full p-3 rounded-lg bg-gray-700 text-white"
                        value={withdrawalReference || ""}
                        onChange={(e) => setWithdrawalReference(e.target.value)}
                        placeholder="Enter UPI ID (e.g., yourname@okaxis)"
                        required
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        Format: name@provider (e.g., goutam@okaxis, name@paytm)
                      </p>
                    </div>
                  )}

                  {/* Dynamic Fields for PayPal */}
                  {paymentMethod === "PAYPAL" && (
                    <div className="mb-4">
                      <label className="block mb-2 text-gray-300">PayPal Email</label>
                      <input
                        type="email"
                        className="w-full p-3 rounded-lg bg-gray-700 text-white"
                        value={withdrawalReference || ""}
                        onChange={(e) => setWithdrawalReference(e.target.value)}
                        placeholder="Enter PayPal email address"
                        required
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block mb-2 text-gray-300">Description (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg bg-gray-700 text-white"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Withdrawal to bank account"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                    >
                      Withdraw
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWithdraw(false);
                        setAmount("");
                        setDescription("");
                        setPaymentMethod("");
                        setWithdrawalReference("");
                        setAccountHolderName("");
                        setIfscCode("");
                      }}
                      className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Company Agreement Modal */}
          {showCompanyAgreement && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Company Agreement</h3>
                <div className="text-gray-300 mb-6 space-y-4 text-sm">
                  <p className="font-semibold text-white">Terms and Conditions for Companies:</p>
                  <p>1. You agree to maintain legitimate bug bounty programs and only post authentic security testing opportunities.</p>
                  <p>2. You commit to rewarding researchers fairly and promptly for verified vulnerabilities according to the severity and quality of their reports.</p>
                  <p>3. You confirm that all funds deposited into your wallet will be used exclusively for verified bug bounty rewards and legitimate security testing programs.</p>
                  <p>4. You agree to review and respond to bug reports in a timely manner and provide constructive feedback to researchers.</p>
                  <p>5. You understand that false or misleading submissions may result in account suspension and loss of deposited funds.</p>
                  <p>6. You agree to comply with all applicable laws and regulations regarding security testing and bug bounty programs.</p>
                  <p>7. You confirm that your company has the legal authority to conduct bug bounty programs and reward security researchers.</p>
                  <p>8. You understand that BugSecure acts as a platform facilitator and is not responsible for disputes between companies and researchers.</p>
                </div>
                <div className="mb-6">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={companyAgreementAccepted}
                      onChange={(e) => setCompanyAgreementAccepted(e.target.checked)}
                      className="mr-2 w-4 h-4"
                    />
                    <span>I have read and agree to the Company Terms and Conditions</span>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleAcceptCompanyAgreement}
                    disabled={!companyAgreementAccepted}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
                  >
                    Accept and Continue
                  </button>
                  <button
                    onClick={() => {
                      setShowCompanyAgreement(false);
                      setCompanyAgreementAccepted(false);
                      setShowDeposit(false);
                    }}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4">Transaction History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wallet.transactionHistory && wallet.transactionHistory.length > 0 ? (
                wallet.transactionHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-semibold">{tx.transactionType}</p>
                      <p className="text-gray-400 text-sm">{tx.description}</p>
                      <p className="text-gray-500 text-xs">{tx.createdAt}</p>
                      {tx.fromUser && (
                        <p className="text-gray-500 text-xs">From: {tx.fromUser}</p>
                      )}
                      {tx.toUser && (
                        <p className="text-gray-500 text-xs">To: {tx.toUser}</p>
                      )}
                      {tx.withdrawalMethod && (
                        <div className="mt-2 text-xs">
                          <p className="text-gray-500">Method: {tx.withdrawalMethod}</p>
                          {tx.withdrawalMethod === "BANK_TRANSFER" && (
                            <>
                              {tx.accountHolderName && (
                                <p className="text-gray-500">Account: {tx.accountHolderName}</p>
                              )}
                              {tx.withdrawalReference && (
                                <p className="text-gray-500">Account No: {tx.withdrawalReference}</p>
                              )}
                              {tx.ifscCode && (
                                <p className="text-gray-500">IFSC: {tx.ifscCode}</p>
                              )}
                            </>
                          )}
                          {tx.withdrawalMethod === "UPI" && tx.withdrawalReference && (
                            <p className="text-gray-500">UPI ID: {tx.withdrawalReference}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.transactionType === "DEPOSIT" || tx.transactionType === "REWARD"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {tx.transactionType === "DEPOSIT" || tx.transactionType === "REWARD"
                          ? "+"
                          : "-"}
                        {currencySymbol(tx.currency)}{tx.amount?.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-xs">{tx.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No transactions yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Wallet;


