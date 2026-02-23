import { useEffect, useState } from "react";
import { Lock, User, LogIn, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./Subject";
import Swal from "sweetalert2";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    if (!username || !password) {
      Swal.fire("กรุณากรอกข้อมูล", "โปรดกรอกชื่อผู้ใช้และรหัสผ่าน", "warning");
      setIsLoading(false);
      return;
    }

    try {
      // ตรวจสอบ admin แบบ hardcode ก่อน
      if (username === "admin" && password === "1234") {
        const token = {
          data: { 
            role: 3, 
            signInDate: new Date(), 
            username: "admin",
            fullname: "ผู้ดูแลระบบ"
          },
        };
        localStorage.setItem("loginToken", JSON.stringify(token));
        Swal.fire("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับ ผู้ดูแลระบบ", "success");
        location.href = "/dashboard";
        return;
      }

      // เรียก API ที่จะตรวจสอบทั้ง students และ professors
      const res = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      if (res.data.err) {
        Swal.fire("เข้าสู่ระบบไม่สำเร็จ", res.data.err, "error");
        return;
      }

      if (res.status === 200) {
        localStorage.setItem("loginToken", JSON.stringify(res.data));
        
        const role = res.data.data.role;
        const fullname = res.data.data.fullname || username;
        
        Swal.fire(
          "เข้าสู่ระบบสำเร็จ", 
          `ยินดีต้อนรับ ${fullname}`, 
          "success"
        );

        // Redirect ตาม role
        if (role === 3) {
          location.href = "/dashboard";
        } else if (role === 2) {
          location.href = "/crud/subject";
        } else {
          location.href = "/my-profile";
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        error.response?.data?.err || "ไม่สามารถเข้าสู่ระบบได้",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  useEffect(() => {
    const tokenStr = localStorage.getItem("loginToken");
    if (tokenStr) {
      try {
        const token = JSON.parse(tokenStr);
        const role = token?.data?.role;
        
        if (role) {
          location.href =
            role == 3
              ? "/dashboard"
              : role == 2
                ? "/crud/subject"
                : "/my-profile";
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("loginToken");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          ระบบเช็คชื่อเข้าเรียน
        </h2>
        <p className="text-white/70 text-center mb-8 text-sm">
          เข้าสู่ระบบเพื่อเริ่มต้นการใช้งาน
        </p>

        {/* Form */}
        <div className="space-y-5">
          {/* Username Field */}
          <div>
            <label className="text-white font-semibold mb-2 block flex items-center gap-2">
              <User className="w-4 h-4" />
              ชื่อผู้ใช้
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 pl-11 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
                placeholder="กรอกชื่อผู้ใช้"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-white font-semibold mb-2 block flex items-center gap-2">
              <Lock className="w-4 h-4" />
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full p-3 pl-11 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 transition shadow-sm"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-white/70 text-sm">
              ยังไม่มีบัญชี?{" "}
              <Link
                to={"/register/"}
                className="text-emerald-300 hover:text-emerald-200 font-semibold underline"
              >
                ลงทะเบียน
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-white/60 text-xs mt-6">
            © {new Date().getFullYear()} ระบบเช็คชื่อเข้าเรียน - All Rights
            Reserved
          </p>
        </div>
      </div>
    </div>
  );
}