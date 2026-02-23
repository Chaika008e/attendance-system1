import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [token, setToken] = useState();
  const getToken = () => {
    const token = JSON.parse(localStorage.getItem("loginToken"));
    if (!token) return (location.href = "/");

    setToken(token?.data);
  };
  useEffect(() => {
    getToken();
  }, []);

  const handleLogout = () => {
    alert("ออกจากระบบ");
    localStorage.removeItem("loginToken");
    location.href = "/";
  };
  return (
    <nav className="bg-white fixed top-0 z-50 w-full shadow-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              ระบบจัดเช็คชื่อเข้าเรียน
            </h1>
            <p className="text-xs text-gray-500">
              StudyClass System Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {token?.role == 3 && <Link to={"/dashboard"}>หน้าหลัก</Link>}

          {token?.role == 1 && <Link to={"/my-profile"}>ข้อมูลส่วนตัว</Link>}

          <Link to={"/crud/subject"}>
            {token?.role == 1 ? "เช็คชื่อ" : "จัดการรายวิชา"}
          </Link>
          {(token?.role == "3" || token?.role == "2") && (
            <Link to={"/users"}>จัดการนักศึกษา</Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Header;
