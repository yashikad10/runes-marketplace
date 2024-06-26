"use client";
import React, { useState } from "react";
import Link from "next/link";
import WalletButton from "../Wallet/WalletButton";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className=" text-white p-2 border-b border-gray-700 h-20">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl p-2 font-bold bg-gradient-to-r from-[#2C74B3] to-[#205295] text-transparent bg-clip-text text-center">
          Rune Marketplace
        </Link>
        <WalletButton />
      </div>
    </header>
  );
};

export default Header;
