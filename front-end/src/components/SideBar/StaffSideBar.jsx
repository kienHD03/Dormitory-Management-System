import { Link } from "react-router-dom";

const StaffSideBar = () => {
  return (
    <ul>
      <li>
        <Link
          to="/staff"
          className={location.pathname === "/staff" ? "active" : ""}
        >
          <i className="fa-solid fa-user"></i> Trang chủ
        </Link>
      </li>
      <li>
        <Link
          to="/staff/reports"
          className={location.pathname === "/staff/reports" ? "active" : ""}
        >
          <i className="fa-solid fa-envelope"></i> Yêu cầu 
        </Link>
      </li>
      <li>
        <Link
          to="/chatbot"
          className={location.pathname === "/staff/chatbot" ? "active" : ""}
        >
          <i className="fa-solid fa-comments"></i> Chatbot
        </Link>
      </li>
    </ul>
  );
};

export default StaffSideBar;
