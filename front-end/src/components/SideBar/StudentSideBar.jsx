import { Link } from "react-router-dom";

const StudentSideBar = ({ user }) => {
  return (
    <ul>
      <li>
        <Link to="/student" className={location.pathname === "/student" ? "active" : ""}>
          <i className="fa-solid fa-user"></i> Trang chủ
        </Link>
      </li>
      <li>
        <Link to="/student/news" className={location.pathname === "/student/news" ? "active" : ""}>
          <i className="fa-solid fa-calendar"></i> Tin tức
        </Link>
      </li>
      <li>
        <Link
          to="/student/profile"
          className={location.pathname === "/student/profile" ? "active" : ""}
        >
          <i className="fa-solid fa-user"></i> Thông tin sinh viên
        </Link>
      </li>
      <li>
        <Link
          to="/student/booking"
          className={
            location.pathname === "/student/booking" ? "active" : user.room ? "disabled" : ""
          }
          onClick={(e) => user.room && e.preventDefault()}
        >
          <i className="fa-solid fa-building"></i> Đặt phòng
        </Link>
      </li>

      <li>
        <Link
          to="/student/resident_histories"
          className={location.pathname === "/student/resident_histories" ? "active" : ""}
        >
          <i className="fa-solid fa-clock-rotate-left"></i> Lịch sử cư trú
        </Link>
      </li>

      <li>
        <Link
          to="/student/invoice"
          className={location.pathname === "/student/invoice" ? "active" : ""}
        >
          <i className="fa-solid fa-money-bill-wave"></i> Hóa đơn
        </Link>
      </li>
      <li>
        <Link
          to="/student/requests"
          className={
            location.pathname === "/student/requests" ? "active" : !user.room ? "disabled" : ""
          }
        >
          <i className="fa-solid fa-envelope"></i> Yêu cầu
        </Link>
      </li>
      <li>
        <Link
          to="/student/response"
          className={
            location.pathname === "/student/response" ? "active" : !user.room ? "disabled" : ""
          }
        >
          <i className="fa-solid fa-bell"></i> Phản hồi và lịch sử yêu cầu
        </Link>
      </li>
      <li>
        <Link to="/chatbot" className={location.pathname === "/chatbot" ? "active" : ""}>
          <i className="fa-solid fa-comments"></i> Chatbot
        </Link>
      </li>
    </ul>
  );
};

export default StudentSideBar;
