import React from "react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 w-full bg-slate-800 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
        {/* Left */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">📘 ระบบเช็คชื่อเข้าเรียน</span>
          <span className="text-xs text-slate-400">v1.0</span>
        </div>

        {/* Center */}
        <div className="flex items-center gap-2">
          <span>สถานะระบบ:</span>
          <span className="flex items-center gap-1 text-green-400 font-medium">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Online
          </span>
        </div>

        {/* Right */}
        <div className="text-xs text-slate-400">
          © {year} Attendance System. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
