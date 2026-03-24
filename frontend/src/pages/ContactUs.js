import React from "react";
import { motion } from "framer-motion";

const ContactUs = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 px-4 sm:px-6 lg:px-8 pb-12"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-blue-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-gray-300 mt-3 text-base md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Have questions, partnership ideas, or feedback? Reach out to our
            team.
          </motion.p>
        </div>

        <motion.div
          className="bg-gray-800 rounded-lg border border-gray-700 p-6 md:p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-3">
            Email
          </h2>
          <p className="text-gray-200 text-base md:text-lg break-words">
            <a
              href="mailto:bugsecure06@gmail.com"
              className="text-blue-300 hover:text-blue-200 underline"
            >
              bugsecure06@gmail.com
            </a>
          </p>

          <p className="text-gray-400 text-sm md:text-base mt-4">
            We typically respond within 1-2 business days.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactUs;

