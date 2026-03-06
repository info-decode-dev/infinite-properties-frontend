"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={120}
            height={60}
            priority
            className="logo-image"
          />
        </div>
        <button
          className="navbar-menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X size={24} className="menu-icon" />
          ) : (
            <Menu size={24} className="menu-icon" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
