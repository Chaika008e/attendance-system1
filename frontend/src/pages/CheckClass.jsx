import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL } from "./Subject";
import CheckClassRow from "../components/check-class-row";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Header from "../components/header";
import Footer from "../components/footer";

const CheckClass = () => {
  const { classId } = useParams();
  const [loading, setLoading] = useState(false);
  const [course, setCourses] = useState(null);
  const [student, setStudents] = useState([]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get-subject/${classId}`);
      const data = await response.json();
      setCourses(data.data);
    } catch (error) {
      alert("ไม่สามารถโหลดข้อมูลวิชาได้");
    } finally {
      setLoading(false);
    }
  };

  const getAll = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      const uniqueStudents = Array.from(
        new Map(res.data.data.map((std) => [std.fullname, std])).values(),
      );
      setStudents(uniqueStudents);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
    getAll();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-5xl mx-auto">
        <Link
          to={"/crud/subject"}
          className="flex hover:text-blue-500 hover:underline items-center gap-2"
        >
          <ArrowLeft />
          <p>กลับ</p>
        </Link>
      </div>
      <div className="max-w-5xl mt-5 mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              📋 เช็คชื่อเข้าเรียน
            </h1>
            <p className="text-indigo-100">
              {new Date().toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
                weekday: "long",
              })}
            </p>
          </div>

          {/* Course Info */}
          <div className="p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">📚 ชื่อวิชา</p>
                <p className="text-lg font-semibold text-gray-800">
                  {course?.course_name || "-"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">🔢 รหัสวิชา</p>
                <p className="text-lg font-semibold text-gray-800">
                  {course?.course_id || "-"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-sm md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">👨‍🏫 ผู้สอน</p>
                <p className="text-lg font-semibold text-gray-800">
                  {course?.teacher_name || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                👥 รายชื่อผู้เข้าเรียน
              </h2>
              <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
                {student.length} คน
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                    ชื่อ - นามสกุล
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-200">
                    เช็คชื่อ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {student.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg
                          className="mx-auto h-12 w-12 mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          ไม่มีรายชื่อนักเรียน
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  student.map((s, index) => (
                    <CheckClassRow
                      key={s.student_id || index}
                      data={s}
                      index={index + 1}
                      classId={classId}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>💡 กรุณาตรวจสอบรายชื่อให้ถูกต้องก่อนบันทึก</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckClass;
