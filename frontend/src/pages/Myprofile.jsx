import { useEffect, useState } from "react";
import {
  User,
  Save,
  Edit2,
  ArrowLeft,
  Home,
  Mail,
  BookOpen,
  CreditCard,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "./Subject";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

export default function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({});
  const [load, setLoad] = useState(true);
  const [previewProfile, setPreviewProfile] = useState("");
  const [profileFile, setProfileFile] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_lvjjRAVDQ-nBDq_4dy1xCyRjjDaHV-Tqcw&s");
  const handleImgPciker = (e) => {
    if (e.target.files[0]) {
      setPreviewProfile(URL.createObjectURL(e.target.files[0]));
      setProfileFile(e.target.files[0]);
    }
  };

  const getData = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("loginToken")).data;
      if (!data) return (location.href = "/");
      const res = await axios.get(API_URL + `/students/${data?.student_id}`);
      setFormData({
        stundent_id: res.data?.data?.student_id,
        fullname: res.data?.data?.fullname,
        major: res.data?.data?.major,
        std_class_id: res?.data?.data?.std_class_id,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.put(
        `${API_URL}/students/${formData.stundent_id}`,
        formData,
      );
      setMessage("บันทึกข้อมูลสำเร็จ!");
      setIsEditing(false);
      getData();
    } catch (error) {
      setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (load) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <Header />
      <div className="max-w-4xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">หน้าหลัก</span>
          </Link>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Edit2 className="w-5 h-5" />
              <span className="font-medium">แก้ไขข้อมูล</span>
            </button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-48">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>

            {/* Profile Image */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <label
                  htmlFor="img-picker"
                  className="w-32 h-32 overflow-hidden cursor-pointer rounded-full border-6 border-white shadow-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden"
                >
                  <input onChange={handleImgPciker} type="file" id="img-picker" className="hidden" />
                  <img src={previewProfile} className="w-full h-full object-cover" alt="" />
                </label>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 px-8 pb-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ข้อมูลโปรไฟล์
              </h1>
              <p className="text-gray-500">จัดการข้อมูลส่วนตัวของคุณ</p>
            </div>

            {/* Message Alert */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl ${message.includes("สำเร็จ") ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}
              >
                <p
                  className={`text-center font-medium ${message.includes("สำเร็จ") ? "text-green-700" : "text-red-700"}`}
                >
                  {message}
                </p>
              </div>
            )}

            {/* Field Container */}
            <div className="space-y-6">
              {/* Student ID */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  รหัสนักศึกษา
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="std_class_id"
                    value={formData.std_class_id || ""}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                ) : (
                  <div className="px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
                    <p className="text-gray-800 font-medium">
                      {formData.std_class_id}
                    </p>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-5 h-5 text-indigo-600" />
                  ชื่อ-นามสกุล
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-800 font-medium"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                ) : (
                  <div className="px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
                    <p className="text-gray-800 font-medium">
                      {formData.fullname}
                    </p>
                  </div>
                )}
              </div>

              {/* Major */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  สาขาวิชา
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="major"
                    value={formData.major || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-800 font-medium"
                    placeholder="กรอกสาขาวิชา"
                  />
                ) : (
                  <div className="px-4 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl">
                    <p className="text-gray-800 font-medium">
                      {formData.major}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      getData();
                    }}
                    className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium border-2 border-gray-300"
                    disabled={loading}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
