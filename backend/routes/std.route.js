import { Router } from "express";
import pool from "../config/pg.js";
import upload from "../middleware/upload.js";
const stdRoute = Router();

// ✅ ลงทะเบียนนักเรียน
stdRoute.post("/create-std", async (req, res) => {
  try {
    const { fullName, studentId, username, password } = req.body;
    
    if (!fullName || !studentId || !username || !password) {
      return res.status(400).json({ err: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    if (password.length < 6) {
      return res.status(400).json({ err: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    // เช็ค username ซ้ำทั้งใน students และ professors
    const checkUsernameStd = await pool.query(
      "SELECT username FROM students WHERE username = $1",
      [username]
    );
    const checkUsernameProf = await pool.query(
      "SELECT username FROM professors WHERE username = $1",
      [username]
    );

    if (checkUsernameStd.rows.length > 0 || checkUsernameProf.rows.length > 0) {
      return res.json({ err: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }

    // เช็ค student_id ซ้ำ
    const checkStudentId = await pool.query(
      "SELECT std_class_id FROM students WHERE std_class_id = $1",
      [studentId]
    );

    if (checkStudentId.rows.length > 0) {
      return res.json({ err: "รหัสนักเรียนนี้ถูกใช้งานแล้ว" });
    }

    const query = `INSERT INTO students (fullname, std_class_id, username, password, major) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const result = await pool.query(query, [
      fullName,
      studentId,
      username,
      password,
      "IT",
    ]);

    if (!result) return res.status(400).json({ err: "ไม่สามารถสร้างบัญชีได้" });

    return res.status(200).json({ 
      ok: true,
      message: "ลงทะเบียนสำเร็จ",
      student: result.rows[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "เกิดข้อผิดพลาดในระบบ" });
  }
});

// ➕ ลงทะเบียนอาจารย์ (ใหม่)
stdRoute.post("/create-professor", async (req, res) => {
  try {
    console.log("📥 Request Body:", req.body);
    const { fullName, tel, username, password } = req.body;

    if (!fullName || !tel || !username || !password) {
      console.log("❌ Missing fields:", { fullName, tel, username, password });
      return res.status(400).json({ err: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    if (password.length < 6) {
      return res.status(400).json({ err: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
    }

    if (tel.length !== 10 || !/^0\d{9}$/.test(tel)) {
      return res.status(400).json({ 
        err: "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)" 
      });
    }

    console.log("🔍 Checking username duplicates...");
    
    // เช็ค username ซ้ำทั้งใน students และ professors
    const checkUsernameStd = await pool.query(
      "SELECT username FROM students WHERE username = $1",
      [username]
    );
    const checkUsernameProf = await pool.query(
      "SELECT username FROM professors WHERE username = $1",
      [username]
    );

    if (checkUsernameStd.rows.length > 0 || checkUsernameProf.rows.length > 0) {
      console.log("❌ Username already exists");
      return res.json({ err: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }

    console.log("💾 Inserting into database...");
    const query = `INSERT INTO professors (fullname, tel, username, password) 
                   VALUES ($1, $2, $3, $4) RETURNING id, fullname, username`;

    const result = await pool.query(query, [fullName, tel, username, password]);
    console.log("✅ Insert successful:", result.rows[0]);

    if (!result) return res.status(400).json({ err: "ไม่สามารถสร้างบัญชีได้" });

    return res.status(200).json({
      ok: true,
      message: "ลงทะเบียนสำเร็จ",
      professor: result.rows[0]
    });
  } catch (error) {
    console.error("❌ ERROR in /create-professor:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ err: "เกิดข้อผิดพลาดในระบบ", detail: error.message });
  }
});

// ✅ Login - ตรวจสอบ role อัตโนมัติ (แก้ไขใหม่)
stdRoute.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ err: "กรุณากรอก username และ password" });
    }

    let user = null;
    let role = null;

    // 1. ตรวจสอบในตาราง professors ก่อน (role = 2)
    const professorQuery = `
      SELECT id, fullname, username, password
      FROM professors
      WHERE username = $1 AND password = $2
      LIMIT 1
    `;
    const professorResult = await pool.query(professorQuery, [username, password]);

    if (professorResult.rows.length > 0) {
      user = professorResult.rows[0];
      role = 2; // อาจารย์
    }

    // 2. ถ้าไม่เจอใน professors ให้ตรวจสอบในตาราง students (role = 1)
    if (!user) {
      const studentQuery = `
        SELECT student_id, std_class_id, fullname, username, password, major
        FROM students
        WHERE username = $1 AND password = $2
        LIMIT 1
      `;
      const studentResult = await pool.query(studentQuery, [username, password]);

      if (studentResult.rows.length > 0) {
        user = studentResult.rows[0];
        role = 1; // นักเรียน
      }
    }

    // 3. ถ้าไม่เจอในทั้ง 2 ตาราง
    if (!user) {
      return res.status(401).json({ err: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    // 4. ส่งข้อมูล user พร้อม role กลับไป
    return res.status(200).json({
      data: {
        ...user,
        role: role,
        signInDate: new Date()
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "เกิดข้อผิดพลาดในระบบ" });
  }
});

stdRoute.post("/create-easy", async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
  }
});

stdRoute.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🚀 ~ req.params:", req.params);
    const { fullname, major } = req.body;
    console.log("🚀 ~ req.body:", req.body);

    if (!id) {
      return res.status(400).json({ err: "กรุณาระบุ id" });
    }

    if (!fullname && !major) {
      return res.status(400).json({
        err: "ต้องมีอย่างน้อย fullname หรือ major",
      });
    }

    const query = `
      UPDATE students
      SET
        fullname = COALESCE($1, fullname),
        major = COALESCE($2, major)
      WHERE student_id = $3
      RETURNING  fullname, major
    `;

    const result = await pool.query(query, [fullname, major, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ err: "ไม่พบข้อมูลนักเรียน" });
    }

    return res.status(200).json({
      ok: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Internal server error" });
  }
});

stdRoute.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ err: "กรุณาระบุ id" });
    }

    const query = `
      SELECT student_id, fullname, std_class_id, username, major
      FROM students
      WHERE student_id = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ err: "ไม่พบข้อมูลนักเรียน" });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Internal server error" });
  }
});

stdRoute.delete("/students/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ err: "กรุณาระบุ id" });
    }

    await client.query("BEGIN");

    // 1. ลบข้อมูลลูกก่อน
    await client.query("DELETE FROM enrollments WHERE student_id = $1", [id]);

    // 2. ลบนักเรียน (ต้องมี RETURNING)
    const result = await client.query(
      `
      DELETE FROM students
      WHERE student_id = $1
      RETURNING student_id
      `,
      [id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ err: "ไม่พบข้อมูลนักเรียน" });
    }

    await client.query("COMMIT");

    return res.status(200).json({
      ok: true,
      msg: "ลบข้อมูลเรียบร้อย",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ err: "Internal server error" });
  } finally {
    client.release();
  }
});

stdRoute.get("/students", async (req, res) => {
  try {
    const query = `
   SELECT
  student_id,
  fullname,
  std_class_id,
  username,
  major
FROM students 

    `;

    const result = await pool.query(query);
    console.log("🚀 ~ result.rows:", result.rows);
    return res.status(200).json({
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Internal server error" });
  }
});

stdRoute.post("/check-class", upload.single("leavDoc"), async (req, res) => {
  try {
    const { status, classId, stdId } = req.body;
    const filePath = req.file ? req.file.path : null;

    const query = `
        INSERT INTO attendance
        (course_id, student_id, checkin_time, status, leave_file)
        VALUES ($1, $2, $3, $4, $5)
      `;

    await pool.query(query, [classId, stdId, new Date(), status, filePath]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Upload failed" });
  }
});

export default stdRoute;