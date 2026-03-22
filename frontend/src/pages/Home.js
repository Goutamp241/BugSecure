import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center pt-20 md:pt-24 px-4 sm:px-6 pb-12">
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 text-center text-blue-400 drop-shadow-lg px-4"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to BugSecure
      </motion.h1>

      <motion.p
        className="text-base sm:text-lg md:text-xl text-gray-300 text-center mb-6 md:mb-10 max-w-2xl px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
      >
        A platform for companies to test their code security and for researchers to discover bugs and earn rewards. Connect companies with security researchers in a secure, controlled environment.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-6 px-4 w-full sm:w-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 px-6 md:px-8 py-2 md:py-3 rounded-lg text-base md:text-lg font-semibold transition shadow-lg hover:shadow-blue-500/40 text-center"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-gray-700 hover:bg-gray-600 px-6 md:px-8 py-2 md:py-3 rounded-lg text-base md:text-lg font-semibold transition shadow-lg hover:shadow-gray-500/40 text-center"
        >
          Register
        </Link>
      </motion.div>

      <motion.img
        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1080&auto=format&fit=crop"
        alt="cyber security"
        className="w-full max-w-sm sm:max-w-md md:w-80 lg:w-[500px] mt-8 md:mt-14 rounded-xl shadow-2xl hover:scale-105 transition-transform duration-700 px-4"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
      />
    </div>
  );
};

export default Home;
