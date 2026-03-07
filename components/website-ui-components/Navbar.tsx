"use client";

import React from "react";
import Image from "next/image";

const Navbar = () => {
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
      </div>
    </nav>
  );
};

export default Navbar;
