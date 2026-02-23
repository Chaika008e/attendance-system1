import { useState } from "react";
import {
  Lock,
  User,
  LogIn,
  GraduationCap,
  Phone,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./Subject";
import Swal from "sweetalert2";

function Register() {
  const [userType, setUserType] = useState(1); // 1 = นักเรียน, 2 = อาจารย์
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "", // ใช้สำหรับนักเรียน
    tel: "", // ใช้สำหรับอาจารย์
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      return Swal.fire("กรุณากรอกชื่อ-นามสกุล", "", "warning");
    }

    // Validate ตามประเภทผู้ใช้
    if (userType === 1 && !formData.studentId.trim()) {
      return Swal.fire("กรุณากรอกรหัสนักเรียน", "", "warning");
    }

    if (userType === 2 && !formData.tel.trim()) {
      return Swal.fire("กรุณากรอกเบอร์โทรศัพท์", "", "warning");
    }

    if (!formData.username.trim()) {
      return Swal.fire("กรุณากรอกชื่อผู้ใช้", "", "warning");
    }

    if (!formData.password.trim()) {
      return Swal.fire("กรุณากรอกรหัสผ่าน", "", "warning");
    }

    if (formData.password !== formData.confirmPassword) {
      return Swal.fire("รหัสผ่านไม่ตรงกัน", "โปรดตรวจสอบรหัสผ่านอีกครั้ง", "error");
    }

    if (formData.password.length < 6) {
      return Swal.fire(
        "รหัสผ่านสั้นเกินไป",
        "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        "warning"
      );
    }

    setIsLoading(true);

    try {
      const endpoint =
        userType === 1 ? "/create-std" : "/create-professor";

      const payload =
        userType === 1
          ? {
              fullName: formData.fullName,
              studentId: formData.studentId,
              username: formData.username,
              password: formData.password,
            }
          : {
              fullName: formData.fullName,
              tel: formData.tel,
              username: formData.username,
              password: formData.password,
            };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      if (res.data.err) {
        return Swal.fire("ลงทะเบียนไม่สำเร็จ", res.data.err, "error");
      }

      if (res.status === 200) {
        Swal.fire({
          title: "ลงทะเบียนสำเร็จ!",
          text: "คุณสามารถเข้าสู่ระบบได้แล้ว",
          icon: "success",
          confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        }).then(() => {
          window.location.href = "/";
        });

        // Reset form
        setFormData({
          fullName: "",
          studentId: "",
          tel: "",
          username: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "เกิดข้อผิดพลาด",
        error.response?.data?.err || "ไม่สามารถลงทะเบียนได้",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-1/2 left-1/3 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-2xl border border-white/20 my-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          ลงทะเบียนผู้ใช้ใหม่
        </h2>
        <p className="text-white/70 text-center mb-8 text-sm">
          กรอกข้อมูลเพื่อสร้างบัญชีในระบบเช็คชื่อเข้าเรียน
        </p>

        {/* Form */}
        <div className="space-y-4">
          {/* Role Selection */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-sm text-white font-semibold">ประเภทผู้ใช้:</p>
            <button
              onClick={() => setUserType(1)}
              disabled={isLoading}
              className={`p-2 px-4 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                userType === 1
                  ? "bg-white text-emerald-700 shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              นักเรียน
            </button>
            <button
              onClick={() => setUserType(2)}
              disabled={isLoading}
              className={`p-2 px-4 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                userType === 2
                  ? "bg-white text-emerald-700 shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              อาจารย์
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />
              ชื่อ-นามสกุล
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                placeholder="นายสมชาย ใจดี"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Student ID / Tel (ขึ้นกับ userType) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userType === 1 ? (
              <div>
                <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4" />
                  รหัสนักเรียน
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                    placeholder="663170010324"
                    value={formData.studentId}
                    onChange={(e) => handleChange("studentId", e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  เบอร์โทรศัพท์
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                    placeholder="0812345678"
                    value={formData.tel}
                    onChange={(e) => handleChange("tel", e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                  placeholder="username123"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block flex items-center gap-2 text-sm">
                <Lock className="w-4 h-4" />
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full p-3 pl-10 rounded-xl bg-white/90 text-gray-800 outline-none focus:ring-2 focus:ring-emerald-400 transition shadow-sm text-sm"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>กำลังลงทะเบียน...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>ลงทะเบียน</span>
              </>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-white/70 text-sm">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                to={"/"}
                className="text-emerald-300 hover:text-emerald-200 font-semibold underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-white/60 text-xs mt-4">
            © {new Date().getFullYear()} ระบบเช็คชื่อเข้าเรียน - All Rights
            Reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;