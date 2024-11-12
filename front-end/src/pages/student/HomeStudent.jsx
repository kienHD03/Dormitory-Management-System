// pages/HomeStudent.jsx
import styles from "./HomeStudent.module.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../utils/axios";

const HomeStudent = () => {
  const [news, setNews] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    fetch("/api/news")
      .then((response) => response.json())
      .then((data) => setNews(data))
      .catch((error) => console.error("Error fetching news:", error));
  }, []);

  useEffect(() => {
    fetch("/api/user-info")
      .then((response) => response.json())
      .then((data) => setUserInfo(data))
      .catch((error) => console.error("Error fetching user info:", error));
  }, []);

  return (
    <div className={styles["student-management-container"]}>
      {/* Tin tức chiếm 3/4 */}
      <div className={styles["news-section"]}>
        <div className={styles["news-header"]}>
          <h2 className={styles["title"]}>Tin tức</h2>
        </div>
        <div className={styles["news-content"]}>
          {news.length > 0 ? (
            news.map((item, index) => <p key={index}>{item.title}</p>)
          ) : (
            <p>Đang tải tin tức...</p>
          )}
        </div>
        <Link to="/student/news">
          <i>Xem thêm</i>
        </Link>
      </div>

      {/* Thông tin cá nhân chiếm 1/4 */}
      <div className={styles["info-section"]}>
        <div className={styles["info-header"]}>
          <h2 className={styles["title"]}>Thông tin cá nhân</h2>
        </div>
        <div className={styles["info-content"]}>
          <p>Họ và tên: {userInfo.fullName || "Đang tải..."}</p>
          <p>Mã sinh viên: {userInfo.studentId || "Đang tải..."}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeStudent;
