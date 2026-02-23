// ตัวอย่าง Backend API Endpoint (Node.js + Express + PostgreSQL)
// วางไว้ใน backend/routes/auth.js หรือ backend/controllers/authController.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // สำหรับเข้ารหัสรหัสผ่าน
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Check',
  user: 'postgres',
  password: '123456'
});

// POST /api/login - Login endpoint ที่ตรวจสอบ role อัตโนมัติ
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({ 
      err: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' 
    });
  }

  try {
    let user = null;
    let role = null;

    // 1. ตรวจสอบในตาราง professors ก่อน (role = 2)
    const professorQuery = await pool.query(
      'SELECT id, fullname, username, password FROM professors WHERE username = $1',
      [username]
    );

    if (professorQuery.rows.length > 0) {
      const professor = professorQuery.rows[0];
      
      // ตรวจสอบรหัสผ่าน
      // ถ้าใช้ bcrypt: const isMatch = await bcrypt.compare(password, professor.password);
      // ถ้าเก็บ plain text (ไม่แนะนำ):
      if (password === professor.password) {
        user = professor;
        role = 2; // อาจารย์
      }
    }

    // 2. ถ้าไม่เจอใน professors ให้ตรวจสอบในตาราง students (role = 1)
    if (!user) {
      const studentQuery = await pool.query(
        'SELECT student_id, std_class_id, fullname, username, password, major FROM students WHERE username = $1',
        [username]
      );

      if (studentQuery.rows.length > 0) {
        const student = studentQuery.rows[0];
        
        // ตรวจสอบรหัสผ่าน
        if (password === student.password) {
          user = student;
          role = 1; // นักเรียน
        }
      }
    }

    // 3. ถ้าไม่เจอในทั้ง 2 ตาราง หรือรหัสผ่านไม่ถูกต้อง
    if (!user) {
      return res.status(401).json({ 
        err: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
      });
    }

    // 4. สร้าง token และส่งกลับ
    const token = {
      data: {
        role: role,
        username: user.username,
        fullname: user.fullname,
        id: role === 2 ? user.id : user.student_id,
        stdClassId: role === 1 ? user.std_class_id : null,
        major: role === 1 ? user.major : null,
        signInDate: new Date()
      }
    };

    return res.status(200).json(token);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      err: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

// POST /api/create-std - Register student
router.post('/create-std', async (req, res) => {
  const { fullName, studentId, username, password } = req.body;

  // Validation
  if (!fullName || !studentId || !username || !password) {
    return res.status(400).json({ 
      err: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      err: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
    });
  }

  try {
    // ตรวจสอบว่า username ซ้ำหรือไม่ในทั้ง students และ professors
    const checkUsernameStd = await pool.query(
      'SELECT username FROM students WHERE username = $1',
      [username]
    );
    const checkUsernameProf = await pool.query(
      'SELECT username FROM professors WHERE username = $1',
      [username]
    );

    if (checkUsernameStd.rows.length > 0 || checkUsernameProf.rows.length > 0) {
      return res.status(400).json({ 
        err: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' 
      });
    }

    // ตรวจสอบว่า student_id ซ้ำหรือไม่
    const checkStudentId = await pool.query(
      'SELECT std_class_id FROM students WHERE std_class_id = $1',
      [studentId]
    );

    if (checkStudentId.rows.length > 0) {
      return res.status(400).json({ 
        err: 'รหัสนักเรียนนี้ถูกใช้งานแล้ว' 
      });
    }

    // แนะนำ: ใช้ bcrypt เข้ารหัสรหัสผ่าน
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert ข้อมูล
    const result = await pool.query(
      `INSERT INTO students (std_class_id, fullname, username, password, major) 
       VALUES ($1, $2, $3, $4, 'IT') 
       RETURNING student_id, fullname, username`,
      [studentId, fullName, username, password] // ใช้ password ตรงๆ (ไม่แนะนำในการใช้งานจริง)
    );

    return res.status(200).json({
      message: 'ลงทะเบียนสำเร็จ',
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      err: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

// POST /api/create-professor - Register professor
router.post('/create-professor', async (req, res) => {
  const { fullName, tel, username, password } = req.body;

  // Validation
  if (!fullName || !tel || !username || !password) {
    return res.status(400).json({ 
      err: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      err: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
    });
  }

  if (tel.length !== 10 || !/^0\d{9}$/.test(tel)) {
    return res.status(400).json({ 
      err: 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)' 
    });
  }

  try {
    // ตรวจสอบว่า username ซ้ำหรือไม่ในทั้ง students และ professors
    const checkUsernameStd = await pool.query(
      'SELECT username FROM students WHERE username = $1',
      [username]
    );
    const checkUsernameProf = await pool.query(
      'SELECT username FROM professors WHERE username = $1',
      [username]
    );

    if (checkUsernameStd.rows.length > 0 || checkUsernameProf.rows.length > 0) {
      return res.status(400).json({ 
        err: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' 
      });
    }

    // แนะนำ: ใช้ bcrypt เข้ารหัสรหัสผ่าน
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Insert ข้อมูล
    const result = await pool.query(
      `INSERT INTO professors (fullname, tel, username, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, fullname, username`,
      [fullName, tel, username, password] // ใช้ password ตรงๆ (ไม่แนะนำในการใช้งานจริง)
    );

    return res.status(200).json({
      message: 'ลงทะเบียนสำเร็จ',
      professor: result.rows[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      err: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' 
    });
  }
});

module.exports = router;

