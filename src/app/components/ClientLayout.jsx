"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ClientLayout({ children }) {
  const [open, setOpen] = useState(true);
const handleClick = () => {
    setOpen(prev => !prev);
    console.log("Menu icon clicked");
  };
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar className="fixed top-0 left-0 z-3" open={open} handleClick={handleClick} />

      {/* Right side content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Navbar */}
        <Navbar className="relative top-0 left-0 z-1" handleClick={handleClick} />

        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}