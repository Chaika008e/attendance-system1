import { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Users2,
  Pen,
  Book,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./Subject";
import Swal from "sweetalert2";
import Users from "./Users";
import DashboardStat from "../components/Dashboard-stat";
import DashboardStudentRow from "../components/dashboars-student-row";
import DashboardProfessorRow from "../components/dashboard-professor-row";
import DashboardSubjectRow from "../components/dashboard-subject-row";
import Header from "../components/header";
import Footer from "../components/footer";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tableData, setTableData] = useState([]);
  // const [stats, setStats] = useState({});

  // Sample data
  const [students, setStudents] = useState([
    {
      id: "6501234567",
      name: "สมชาย ใจดี",
      major: "วิทยาการคอมพิวเตอร์",
      email: "somchai@email.com",
    },
    {
      id: "6501234568",
      name: "สมหญิง รักเรียน",
      major: "วิศวกรรมซอฟต์แวร์",
      email: "somying@email.com",
    },
    {
      id: "6501234569",
      name: "ประยุทธ มานะ",
      name: "ระบบสารสนเทศ",
      email: "prayut@email.com",
    },
  ]);

  const [teachers, setTeachers] = useState([
    {
      id: "T001",
      name: "ดร.วิชัย สอนดี",
      email: "wichai@university.ac.th",
      department: "คอมพิวเตอร์",
    },
    {
      id: "T002",
      name: "อ.สมพร ใจเย็น",
      email: "somporn@university.ac.th",
      department: "วิศวกรรม",
    },
    {
      id: "T003",
      name: "ผศ.ดร.นภา วิชาการ",
      email: "napa@university.ac.th",
      department: "วิทยาศาสตร์",
    },
  ]);

  const [subjects, setSubjects] = useState([
    {
      id: "CS101",
      name: "การเขียนโปรแกรมเบื้องต้น",
      credits: "3",
      teacher: "ดร.วิชัย สอนดี",
    },
    {
      id: "CS201",
      name: "โครงสร้างข้อมูล",
      credits: "3",
      teacher: "อ.สมพร ใจเย็น",
    },
    {
      id: "CS301",
      name: "ฐานข้อมูล",
      credits: "3",
      teacher: "ผศ.ดร.นภา วิชาการ",
    },
  ]);

  const [loadAll, setLoadAll] = useState(true);
  const getAllList = async () => {
    try {
      const students = await axios.get(API_URL + "/students");
      setStudents(students.data.data);

      const professors = await axios.get(API_URL + "/get-all-professors");
      setTeachers(professors.data.data);
      console.log(
        "🚀 ~ getAllList ~ professors.data.data:",
        professors.data.data,
      );

      const course = await axios.get(API_URL + "/get-all-subjects");
      setSubjects(course.data.data);

      if (activeTab === "students") {
        setTableData(students.data.data);
      } else if (activeTab === "teachers") {
        setTableData(professors.data.data);
      } else if (activeTab === "subjects") {
        setTableData(course.data.data);
      } else {
        setTableData(students.data.data);
      }
    } catch (error) {
      console.error(error);
      alert("ตรวจสอบเครือข่าย");
    } finally {
      setLoadAll(false);
    }
  };
  useEffect(() => {
    getAllList();
  }, []);

  const [formData, setFormData] = useState({});

  const activeTabData = async () => {
    if (activeTab === "students") {
      setTableData(students);
    }
    if (activeTab === "teachers") {
      setTableData(teachers);
    } else {
      setTableData(subjects);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้?")) {
      let api = "";
      if (activeTab === "students") {
        api = `/students/${item?.student_id}`;
      } else if (activeTab === "teachers") {
        api = `/delete-professor/${item?.id}`;
      } else {
        api = `/delete-subject/${item?.course_id}`;
      }
      try {
        const res = await axios.delete(API_URL + api);

        if (res.status === 200) {
          getAllList();
          Swal.fire("ลบข้อมูลแล้ว", "", "success");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("ตรวจสอบเครือข่าย", "", "error");
      }
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    let api = "";
    if (editingItem) {
      // Update existing
      if (activeTab === "students") {
        api = `/students/${formData?.student_id}`;
      } else if (activeTab === "teachers") {
        api = `/update-professor/${formData?.id}`;
      } else {
        api = `/update-subject/${formData?.course_id}`;
      }
    } else {
      // Add new
      if (activeTab === "students") {
        api = "/create-std";
      } else if (activeTab === "teachers") {
        api = "/create-professor";
      } else {
        api = "/create-subject";
      }
    }
    if (formData.tel.length !== 10) {
      return Swal.fire("หมายเลขโทรศัพท์ไม่ถูกต้อง", "", "error");
    }

    try {
      let res = null;
      if (editingItem) {
        res = await axios.put(API_URL + api, formData);
      } else {
        res = await axios.post(API_URL + api, formData);
      }

      if (res.status === 200 || res.status === 201) {
        getAllList();
        Swal.fire("บันทึกข้อมูลแล้ว", "", "success");
      }
    } catch (error) {
      console.error(error);
      alert("ตรวจสอบเครือข่าย");
    } finally {
      setSaving(false);
    }
    setShowModal(false);
    setFormData({});
  };

  function searchData(keyword) {
    setTableData(
      tableData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(keyword),
        ),
      ),
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Navbar */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 mt-20">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            ยินดีต้อนรับ!, Admin Dashboard
          </h2>
          <p className="text-gray-600">
            จัดการข้อมูลนักศึกษา อาจารย์ และรายวิชา
          </p>
        </div>

        {/* Stats Grid */}
        <DashboardStat />

        {/* Management Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                (setActiveTab("students"), setTableData(students));
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "students"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                นักศึกษา
              </div>
            </button>
            <button
              onClick={() => {
                (setActiveTab("teachers"), setTableData(teachers));
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "teachers"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                อาจารย์
              </div>
            </button>
            <button
              onClick={() => {
                (setActiveTab("subjects"), setTableData(subjects));
              }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "subjects"
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5" />
                รายวิชา
              </div>
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => {
                    (searchData(e.target.value), setSearchTerm(e.target.value));
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              {activeTab !== "students" && (
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  เพิ่มข้อมูล
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  {activeTab === "students" && (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        รหัสนักศึกษา
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        ชื่อ-นามสกุล
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        สาขาวิชา
                      </th>
                      {activeTab !== "students" && (
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          อีเมล
                        </th>
                      )}
                    </>
                  )}
                  {activeTab === "teachers" && (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        รหัสอาจารย์
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        ชื่อ-นามสกุล
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        เบอร์โทรศัพท์
                      </th>
                    </>
                  )}
                  {activeTab === "subjects" && (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        รหัสวิชา
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        ชื่อวิชา
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        อาจารย์ผู้สอน
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    {activeTab === "students" && (
                      <DashboardStudentRow item={item} />
                    )}
                    {activeTab === "teachers" && (
                      <DashboardProfessorRow item={item} />
                    )}
                    {activeTab === "subjects" && (
                      <DashboardSubjectRow item={item} />
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-sky-500 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingItem ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === "students" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสนักศึกษา
                    </label>
                    <input
                      type="text"
                      value={formData.id || formData?.std_class_id}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-200 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="650XXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={formData.fullname || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="ชื่อ นามสกุล"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      สาขาวิชา
                    </label>
                    <input
                      type="text"
                      value={formData.major || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, major: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="วิทยาการคอมพิวเตอร์"
                    />
                  </div>
                </>
              )}

              {activeTab === "teachers" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสผู้ใช้งาน
                    </label>
                    <input
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="เช่น teacher01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสผ่าน
                    </label>
                    <input
                      type="text"
                      value={formData.password || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="เช่น teacher1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={formData.fullname || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="ชื่อ นามสกุล"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={formData.tel || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, tel: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="0912345678"
                    />
                  </div>
                </>
              )}

              {activeTab === "subjects" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสวิชา
                    </label>
                    <input
                      type="text"
                      value={formData.course_id || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          course_id: e.target.value,
                        })
                      }
                      readOnly
                      className="w-full px-4 py-3 bg-gray-200 border-2 border-gray-50 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="สร้างอัตโนมัติ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อวิชา
                    </label>
                    <input
                      type="text"
                      value={formData.course_name || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          course_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      placeholder="การเขียนโปรแกรม"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      อาจารย์ผู้สอน
                    </label>
                    <select
                      value={formData.teacher_id}
                      onChange={(option) =>
                        setFormData((prev) => ({
                          ...prev,
                          teacher_id: option.target.value,
                        }))
                      }
                      className="w-full p-2 rounded-lg border border-gray-200 outline"
                    >
                      <option disabled>เลือกอาจารย์</option>
                      {teachers.map((t, index) => (
                        <option value={t?.id} key={index}>
                          {t.fullname}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                >
                  {saving ? (
                    <Loader2 color="white" className="animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Dashboard;
