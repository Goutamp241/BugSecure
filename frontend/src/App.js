import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import PaymentsPage from "./pages/PaymentsPage";
import ProfilePage from "./pages/ProfilePage";
import SandboxEnvironment from "./pages/SandboxEnvironment";
import TestingPanel from "./pages/TestingPanel";
import BugSubmissionPage from "./pages/BugSubmissionPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import { initFxRates } from "./utils/currency";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payments" element={<PaymentsPageWrapper />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/sandbox/:sandboxId" element={<SandboxEnvironment />} />
          <Route path="/testing/:submissionId" element={<TestingPanel />} />
          <Route path="/bug-submit/:submissionId" element={<BugSubmissionPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    // Warm FX cache for currency rendering.
    initFxRates();
  }, []);

  return (
    <Router>
      <Navbar />
      <AppRoutes />
    </Router>
  );
}

// Wrapper component to get user from localStorage
const PaymentsPageWrapper = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return <PaymentsPage user={user} />;
};

export default App;
