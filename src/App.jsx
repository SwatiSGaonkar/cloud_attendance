import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import "./index.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [message, setMessage] = useState("");

  const [subject, setSubject] = useState("Java");
  const [lecture, setLecture] = useState("1st Hour");

  const [students, setStudents] = useState([
    { name: "Rahul", status: "Present" },
    { name: "Ananya", status: "Present" },
    { name: "Swati", status: "Present" },
    { name: "Arjun", status: "Present" },
  ]);

  const [records, setRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] =
    useState("Java");

  const [subjectRecords, setSubjectRecords] =
    useState([]);

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjects = [
    "Java",
    "DBMS",
    "Cloud Computing",
    "Data Structures",
    "Operating Systems",
  ];

  const lectures = [
    "1st Hour",
    "2nd Hour",
    "3rd Hour",
    "4th Hour",
    "5th Hour",
    "6th Hour",
  ];

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setLoggedIn(true);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Invalid email or password");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setPage("dashboard");
  };

  // CHANGE STATUS
  const changeStatus = (index, status) => {
    const updatedStudents = [...students];

    updatedStudents[index].status = status;

    setStudents(updatedStudents);
  };

  // SAVE ATTENDANCE
  const saveAttendance = async () => {
    try {
      const now = new Date();

      const dateId = now
        .toISOString()
        .split("T")[0];

      const subjectId = subject
        .replace(/\s+/g, "_")
        .toLowerCase();

      const lectureId = lecture
        .replace(/\s+/g, "_")
        .toLowerCase();

      const documentId =
        `${dateId}_${subjectId}_${lectureId}`;

      const displayDate =
        now.toLocaleDateString();

      const attendanceRef = doc(
        db,
        "attendance",
        documentId
      );

      await setDoc(attendanceRef, {
        date: displayDate,
        dateId: dateId,
        subject: subject,
        lecture: lecture,
        students: students,
        updatedAt: new Date().toISOString(),
      });

      alert(
        `${subject} ${lecture} attendance saved successfully!`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to save attendance.");
    }
  };

  // LOAD ATTENDANCE
  const loadAttendance = async () => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "attendance")
      );

      const attendanceRecords = [];

      querySnapshot.forEach((document) => {
        attendanceRecords.push({
          id: document.id,
          ...document.data(),
        });
      });

      attendanceRecords.sort((a, b) =>
        b.id.localeCompare(a.id)
      );

      setRecords(attendanceRecords);
      setLoading(false);
      setPage("view");
    } catch (error) {
      console.error(error);
      alert("Failed to load attendance.");
      setLoading(false);
    }
  };

  // SHOW SUBJECT ATTENDANCE
  const showSubjectAttendance = () => {
    const filteredRecords =
      records.filter(
        (record) =>
          record.subject === selectedSubject
      );

    setSubjectRecords(filteredRecords);

    const studentSummary = {};

    filteredRecords.forEach((record) => {
      if (!record.students) {
        return;
      }

      record.students.forEach((student) => {
        if (!studentSummary[student.name]) {
          studentSummary[student.name] = {
            name: student.name,
            present: 0,
            absent: 0,
          };
        }

        if (student.status === "Present") {
          studentSummary[student.name].present++;
        } else {
          studentSummary[student.name].absent++;
        }
      });
    });

    const summaryArray =
      Object.values(studentSummary).map(
        (student) => {
          const total =
            student.present + student.absent;

          const percentage =
            total === 0
              ? 0
              : (student.present / total) * 100;

          return {
            ...student,
            total,
            percentage:
              percentage.toFixed(2),
          };
        }
      );

    setSummary(summaryArray);
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="login-page">

        <div className="login-card">

          <div className="logo-circle">
            📚
          </div>

          <h1>
            Attendify
          </h1>

          <p className="login-subtitle">
            Cloud Based Student Attendance
            Management System
          </p>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button full-width"
            >
              Sign In
            </button>

          </form>

          {message && (
            <p className="error-message">
              {message}
            </p>
          )}

          <p className="login-footer">
            Powered by Firebase Cloud
          </p>

        </div>

      </div>
    );
  }

  // MARK ATTENDANCE
  if (page === "attendance") {
    return (
      <div className="app-layout">

        <Sidebar
          page={page}
          setPage={setPage}
          handleLogout={handleLogout}
        />

        <main className="main-content">

          <div className="topbar">
            <div>
              <h1>Mark Attendance</h1>
              <p>
                Record attendance for your class
              </p>
            </div>

            <div className="user-badge">
              👨‍🏫 Teacher
            </div>
          </div>

          <div className="attendance-card">

            <div className="date-banner">
              <span>📅</span>

              <div>
                <small>
                  Today's Date
                </small>

                <strong>
                  {new Date().toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="selection-grid">

              <div className="form-field">
                <label>
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                >
                  {subjects.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  Lecture
                </label>

                <select
                  value={lecture}
                  onChange={(e) =>
                    setLecture(e.target.value)
                  }
                >
                  {lectures.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="attendance-header">
              <div>
                <h2>
                  {subject}
                </h2>

                <span>
                  {lecture}
                </span>
              </div>

              <span className="student-count">
                {students.length} Students
              </span>
            </div>

            <div className="student-list">

              {students.map(
                (student, index) => (
                  <div
                    className="student-item"
                    key={student.name}
                  >

                    <div className="student-info">

                      <div className="avatar">
                        {student.name.charAt(0)}
                      </div>

                      <div>
                        <strong>
                          {student.name}
                        </strong>

                        <small>
                          Student
                        </small>
                      </div>

                    </div>

                    <select
                      className={
                        student.status ===
                          "Present"
                          ? "status-present"
                          : "status-absent"
                      }
                      value={student.status}
                      onChange={(e) =>
                        changeStatus(
                          index,
                          e.target.value
                        )
                      }
                    >

                      <option value="Present">
                        Present
                      </option>

                      <option value="Absent">
                        Absent
                      </option>

                    </select>

                  </div>
                )
              )}

            </div>

            <button
              onClick={saveAttendance}
              className="primary-button save-button"
            >
              ✓ Save Attendance
            </button>

          </div>

        </main>

      </div>
    );
  }

  // VIEW ATTENDANCE
  if (page === "view") {
    return (
      <div className="app-layout">

        <Sidebar
          page={page}
          setPage={setPage}
          handleLogout={handleLogout}
        />

        <main className="main-content">

          <div className="topbar">

            <div>
              <h1>
                Attendance Records
              </h1>

              <p>
                View attendance by subject
              </p>
            </div>

            <div className="user-badge">
              👨‍🏫 Teacher
            </div>

          </div>

          {loading ? (
            <div className="loading-card">
              Loading attendance...
            </div>
          ) : (
            <>

              <div className="subject-selector-card">

                <div>
                  <label>
                    Select Subject
                  </label>

                  <select
                    value={selectedSubject}
                    onChange={(e) =>
                      setSelectedSubject(
                        e.target.value
                      )
                    }
                  >

                    {subjects.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>
                </div>

                <button
                  onClick={
                    showSubjectAttendance
                  }
                  className="primary-button"
                >
                  View Summary
                </button>

              </div>

              {summary.length > 0 && (
                <div className="summary-section">

                  <div className="section-title">
                    <div>
                      <h2>
                        {selectedSubject}
                      </h2>

                      <p>
                        Subject Attendance Summary
                      </p>
                    </div>
                  </div>

                  <div className="summary-grid">

                    {summary.map(
                      (student) => (
                        <div
                          className="summary-card"
                          key={student.name}
                        >

                          <div className="summary-card-top">

                            <div className="avatar">
                              {student.name.charAt(
                                0
                              )}
                            </div>

                            <strong>
                              {student.name}
                            </strong>

                          </div>

                          <div className="percentage">
                            {student.percentage}%
                          </div>

                          <div className="progress-bar">

                            <div
                              className="progress-fill"
                              style={{
                                width:
                                  `${student.percentage}%`,
                              }}
                            />

                          </div>

                          <div className="summary-stats">

                            <span>
                              <b className="green">
                                {student.present}
                              </b>{" "}
                              Present
                            </span>

                            <span>
                              <b className="red">
                                {student.absent}
                              </b>{" "}
                              Absent
                            </span>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )}

              {subjectRecords.length > 0 && (
                <div className="records-section">

                  <div className="section-title">
                    <div>
                      <h2>
                        Lecture Records
                      </h2>

                      <p>
                        Individual class attendance
                      </p>
                    </div>
                  </div>

                  {subjectRecords.map(
                    (record) => (
                      <div
                        className="lecture-card"
                        key={record.id}
                      >

                        <div className="lecture-heading">

                          <div>
                            <h3>
                              {record.lecture}
                            </h3>

                            <span>
                              📅 {record.date}
                            </span>
                          </div>

                          <span className="subject-tag">
                            {record.subject}
                          </span>

                        </div>

                        <div className="lecture-students">

                          {record.students &&
                            record.students.map(
                              (student) => (
                                <div
                                  className="lecture-student"
                                  key={
                                    student.name
                                  }
                                >

                                  <span>
                                    {student.name}
                                  </span>

                                  <span
                                    className={
                                      student.status ===
                                        "Present"
                                        ? "badge-present"
                                        : "badge-absent"
                                    }
                                  >
                                    {student.status}
                                  </span>

                                </div>
                              )
                            )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

              {subjectRecords.length === 0 && (
                <div className="empty-card">

                  <div className="empty-icon">
                    📋
                  </div>

                  <h3>
                    No Attendance Records
                  </h3>

                  <p>
                    No records found for{" "}
                    {selectedSubject}.
                  </p>

                </div>
              )}

            </>
          )}

        </main>

      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="app-layout">

      <Sidebar
        page={page}
        setPage={setPage}
        handleLogout={handleLogout}
      />

      <main className="main-content">

        <div className="topbar">

          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, Teacher 👋
            </p>
          </div>

          <div className="user-badge">
            👨‍🏫 Teacher
          </div>

        </div>

        <div className="welcome-card">

          <div>
            <span className="welcome-label">
              CLOUD ATTENDANCE
            </span>

            <h2>
              Manage your classroom
              attendance easily.
            </h2>

            <p>
              Record, manage and review
              student attendance from
              one place.
            </p>

            <button
              onClick={() =>
                setPage("attendance")
              }
              className="white-button"
            >
              Mark Attendance →
            </button>
          </div>

          <div className="welcome-icon">
            📚
          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon blue">
              👨‍🎓
            </div>

            <div>
              <span>
                Students
              </span>

              <strong>
                {students.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon purple">
              📚
            </div>

            <div>
              <span>
                Subjects
              </span>

              <strong>
                {subjects.length}
              </strong>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ☁️
            </div>

            <div>
              <span>
                Cloud Database
              </span>

              <strong>
                Active
              </strong>
            </div>

          </div>

        </div>

        <div className="quick-section">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-grid">

            <button
              className="quick-card"
              onClick={() =>
                setPage("attendance")
              }
            >

              <div className="quick-icon blue">
                ✓
              </div>

              <div>
                <strong>
                  Mark Attendance
                </strong>

                <span>
                  Record today's class
                </span>
              </div>

              <b>
                →
              </b>

            </button>

            <button
              className="quick-card"
              onClick={loadAttendance}
            >

              <div className="quick-icon purple">
                📊
              </div>

              <div>
                <strong>
                  View Reports
                </strong>

                <span>
                  Check subject attendance
                </span>
              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

// SIDEBAR

function Sidebar({
  page,
  setPage,
  handleLogout,
}) {
  return (
    <aside className="sidebar">

      <div className="brand">

        <div className="brand-icon">
          📚
        </div>

        <div>
          <strong>
            Attendify
          </strong>

          <span>
            Cloud Attendance
          </span>
        </div>

      </div>

      <nav>

        <button
          className={
            page === "dashboard"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("dashboard")
          }
        >
          <span>⌂</span>
          Dashboard
        </button>

        <button
          className={
            page === "attendance"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("attendance")
          }
        >
          <span>✓</span>
          Mark Attendance
        </button>

        <button
          className={
            page === "view"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setPage("view")
          }
        >
          <span>▤</span>
          Attendance Records
        </button>

      </nav>

      <div className="sidebar-bottom">

        <div className="cloud-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              Cloud Connected
            </strong>

            <small>
              Firebase
            </small>
          </div>

        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </div>

    </aside>
  );
}

export default App;