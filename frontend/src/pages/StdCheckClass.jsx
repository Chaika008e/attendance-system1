import React, { useEffect, useState } from "react";
import {
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "./Subject";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/header";
import Footer from "../components/footer";

export default function StdCheckClass() {
  const [load, setLoad] = useState(true);
  const [course, setCourses] = useState(null);
  const params = useParams();
  const [stdData, setStdData] = useState();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("");
  const [leaveDocument, setLeaveDocument] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchCourses = async () => {
    try {
      //   setLoading(true);
      const response = await fetch(`${API_URL}/get-subject/${params.classId}`);
      const data = await response.json();
      setCourses(data.data);
      console.log("🚀 ~ fetchCourses ~ data.data:", data.data);
    } catch (error) {
      alert("ไม่สามารถโหลดข้อมูลวิชาได้");
    } finally {
      //   setLoading(false);
    }
  };

  const getData = async () => {
    try {
      const data = JSON.parse(localStorage.getItem("loginToken")).data;
      console.log("🚀 ~ getData ~ data:", data);
      if (!data) return (location.href = "/");
      const res = await axios.get(API_URL + `/students/${data?.student_id}`);
      setStdData({
        stundent_id: res.data?.data?.student_id,
        fullname: res.data?.data?.fullname,
        major: res.data?.data?.major,
        std_class_id: res?.data?.data?.std_class_id,
      });
      console.log("🚀 ~ getData ~ res.data:", res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoad(false);
    }
  };
  useEffect(() => {
    getData();
    fetchCourses();
  }, []);

  const subjects = [
    {
      id: 1,
      code: "CS101",
      name: "การเขียนโปรแกรมพื้นฐาน",
      time: "08:00-10:00",
    },
    { id: 2, code: "CS102", name: "โครงสร้างข้อมูล", time: "10:00-12:00" },
    { id: 3, code: "MA201", name: "คณิตศาสตร์ดิสครีต", time: "13:00-15:00" },
    { id: 4, code: "EN101", name: "ภาษาอังกฤษพื้นฐาน", time: "15:00-17:00" },
  ];

  const statusOptions = [
    {
      value: "มาเรียน",
      label: "เข้าเรียนปกติ",
      icon: CheckCircle,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      value: "ลา",
      label: "ลา",
      icon: FileText,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      value: "ขาด",
      label: "ขาด",
      icon: XCircle,
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
    },
    {
      value: "สาย",
      label: "มาสาย",
      icon: Clock,
      color: "bg-yellow-500",
      hoverColor: "hover:bg-yellow-600",
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setLeaveDocument(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    }
  };

  const checkClass = async (status, stdId) => {
    console.log("🚀 ~ checkClass ~ status:", status);
    if (!status) return alert("กรุณาเลือกสถานะการเข้าเรียน");
    const { isConfirmed } = await Swal.fire({
      title: status,
      text: `ยืนยันการเข้าเรียน`,
      confirmButtonText: "ยืนยัน",
      showDenyButton: true,
      denyButtonText: "ยกเลิก",
      icon: "question",
      confirmButtonColor: "#4F46E5",
      denyButtonColor: "#6B7280",
    });
    if (!isConfirmed) return;

    if (status === "ลา" && !leaveDocument)
      return Swal.fire("กรุณาแนบใบลา", "แนบหลักฐานการลา", "warning");

    setLoad(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("classId", params.classId);
      formData.append("stdId", stdId);
      if (status === "ลา") {
        formData.append("leavDoc", leaveDocument);
      }
      const res = await axios.post(API_URL + `/check-class`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200) {
        Swal.fire({
          title: "เช็คชื่อแล้ว",
          text: `บันทึก ${status} สำเร็จ`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
        location.href = `/class-detail/${params.classId}/${params.stdId}`;
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้",
        icon: "error",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setLoad(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!studentName || !studentId || !selectedSubject || !status) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (status === "leave" && !leaveDocument) {
      alert("กรุณาแนบใบลาสำหรับการลา");
      return;
    }

    setSubmitted(true);

    setTimeout(() => {
      alert("บันทึกการเช็คชื่อเรียบร้อยแล้ว");
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setStudentName("");
    setStudentId("");
    setSelectedSubject("");
    setStatus("");
    setLeaveDocument(null);
    setPreviewUrl("");
    setSubmitted(false);
  };

  const selectedSubjectData = subjects.find(
    (s) => s.id === parseInt(selectedSubject),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <Header />
      <Link
        to={"/crud/subject"}
        className="flex hover:text-blue-500 hover:underline items-center gap-2"
      >
        <ArrowLeft />
        <p>กลับ</p>
      </Link>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              ระบบเช็คชื่อเข้าเรียน
            </h1>
            <p className="text-blue-100 text-center mt-2">
              กรุณาบันทึกสถานะการเข้าเรียนของคุณ
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={stdData?.fullname}
                    readOnly
                    // onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัสนักเรียน
                  </label>
                  <input
                    type="text"
                    value={stdData?.std_class_id}
                    readOnly
                    // onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                    placeholder="กรอกรหัสนักเรียน"
                  />
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  วิชา
                </label>
                <div className="flex items-center gap-2 mt-3 rounded-lg border border-gray-300 p-3">
                  <p>
                    วิชา:{course?.course_name} | อาจารย์ผู้สอน:
                    {course?.teacher_name}
                  </p>
                </div>
              </div>

              {selectedSubjectData && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">วิชาที่เลือก:</span>{" "}
                    {selectedSubjectData.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    เวลาเรียน: {selectedSubjectData.time}
                  </p>
                </div>
              )}

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  สถานะการเข้าเรียน
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatus(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          status === option.value
                            ? `${option.color} text-white border-transparent shadow-lg scale-105`
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="mx-auto mb-2" size={28} />
                        <span className="font-semibold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leave Document Upload */}
              {status === "ลา" && (
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    แนบใบลา (รูปภาพเท่านั้น)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition">
                      {previewUrl ? (
                        <div className="relative w-full h-full p-2">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 mb-3 text-blue-500" />
                          <p className="mb-2 text-sm text-gray-600">
                            <span className="font-semibold">
                              คลิกเพื่ออัพโหลด
                            </span>{" "}
                            หรือลากไฟล์มาวาง
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (สูงสุด 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  {leaveDocument && (
                    <p className="mt-2 text-sm text-gray-600">
                      ไฟล์: {leaveDocument.name}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={() => checkClass(status, params.stdId)}
                disabled={submitted}
                className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                  submitted
                    ? "bg-green-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {submitted ? (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="mr-2" size={24} />
                    บันทึกเรียบร้อย
                  </span>
                ) : (
                  "บันทึกการเช็คชื่อ"
                )}
              </button>

              {/* Reset Button */}
              {(studentName || studentId || selectedSubject || status) && (
                <button
                  onClick={resetForm}
                  className="w-full py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  ล้างข้อมูล
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>กรุณาเช็คชื่อทุกครั้งก่อนเข้าเรียน</p>
          <p className="mt-1">หากมีปัญหาการใช้งาน กรุณาติดต่ออาจารย์ผู้สอน</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
