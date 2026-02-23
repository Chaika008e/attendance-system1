import { useEffect, useState } from "react";
import {
  Trash2,
  UserPlus,
  Search,
  Home,
  User,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "./Subject";
import Header from "../components/header";
import Footer from "../components/footer";
import { Link } from "react-router-dom";

export default function Users() {
  const [students, setStudents] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [load, setLoad] = useState(true);
  const getAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data.data);
      console.log("🚀 ~ getAll ~ res.data:", res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    getAll();
  }, []);
  if (load) return <p>กำลังโหลด...</p>;

  const confirmDelete = async (id) => {
    try {
      // ส่งคำขอลบไปยัง API
      await axios.delete(`${API_URL}/students/${id}`);

      // ลบออกจาก state
      getAll();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 py-8 px-4">
      <Header />
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => (location.href = "/dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-gray-700 rounded-xl transition-all shadow-md hover:shadow-lg border border-blue-100"
          >
            <Home className="w-5 h-5 text-blue-600" />
            <span className="font-medium">หน้าหลัก</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                จัดการนักศึกษา
              </h1>
              <p className="text-sm text-gray-600">ดูและจัดการข้อมูลนักศึกษา</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Stats Bar */}
          <div className="bg-gradient-to-r from-blue-500 to-sky-500 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                <span className="font-semibold text-lg">
                  นักศึกษาทั้งหมด: {students.length} คน
                </span>
              </div>
              <div className="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                แสดง {students.length} รายการ
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
            {/* <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหา รหัสนักศึกษา, ชื่อ, หรือสาขาวิชา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-800"
              />
            </div> */}
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    รหัสนักศึกษา
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    สาขาวิชา
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ชั้นปี
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {student.std_class_id || student?.student_id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {student.fullname}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.major}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.year ? `ปี ${student.year}` : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-medium">ลบ</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                        <p className="text-lg font-medium">
                          ไม่พบข้อมูลนักศึกษา
                        </p>
                        <p className="text-sm">
                          ลองค้นหาด้วยคำอื่น หรือเพิ่มนักศึกษาใหม่
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          {students.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                แสดง{" "}
                <span className="font-semibold text-gray-800">
                  {students.length}
                </span>{" "}
                จาก{" "}
                <span className="font-semibold text-gray-800">
                  {students.length}
                </span>{" "}
                รายการ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">ยืนยันการลบ</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                คุณต้องการลบนักศึกษาคนนี้ใช่หรือไม่?
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล</p>
                <p className="font-semibold text-gray-800 mb-3">
                  {studentToDelete?.fullname}
                </p>
                <p className="text-sm text-gray-600 mb-1">รหัสนักศึกษา</p>
                <p className="font-semibold text-gray-800">
                  {studentToDelete?.student_id}
                </p>
              </div>
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
