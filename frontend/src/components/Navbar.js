import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-400 border-b-2 border-blue-400"
      : "text-gray-300 hover:text-blue-400";

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl fixed w-full z-50 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3039/3039382.png"
            alt="logo"
            className="w-8 h-8 md:w-9 md:h-9"
          />
          <h1 className="text-xl md:text-2xl font-extrabold text-blue-400 tracking-wide">
            BugSecure
          </h1>
        </div>
        <ul className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-lg font-medium">
          <li>
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
          </li>
          {!localStorage.getItem("token") ? (
            <>
              <li>
                <Link to="/login" className={isActive("/login")}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={isActive("/register")}>
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/dashboard" className={isActive("/dashboard")}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className={isActive("/profile")}>
                  Profile
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
