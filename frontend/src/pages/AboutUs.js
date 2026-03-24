import React from "react";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-blue-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            About BugSecure
          </motion.h1>
          <motion.p
            className="text-gray-300 mt-3 text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            BugSecure is a secure, controlled bug bounty platform that connects
            companies with security researchers. Companies can test their code
            safely, and researchers can responsibly discover vulnerabilities
            and earn rewards.
          </motion.p>
        </div>

        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 md:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-4">
            Our Founders
          </h2>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li>Goutam Kumar</li>
            <li>Naman Babbar</li>
            <li>Vasu Kamra</li>
          </ul>

          <div className="mt-6 text-gray-300">
            <p>
              We focus on practical security workflows, role-based access, and
              a trustworthy handling of submissions, rewards, and attachments.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutUs;

