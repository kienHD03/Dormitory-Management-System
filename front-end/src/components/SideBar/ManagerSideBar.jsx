import { Link } from "react-router-dom";

const ManagerSideBar = () => {
  return (
    <ul>
      <li>
        <Link to="/manager" className={location.pathname === "/manager" ? "active" : ""}>
          <i className="fa-solid fa-user"></i> Trang chủ
        </Link>
      </li>
      <li>
        <Link
          to="/manager/users"
          className={location.pathname === "/manager/users" ? "active" : ""}
        >
          <i className="fa-solid fa-users"></i> Quản lý sinh viên
        </Link>
      </li>
      <li>
        <Link
          to="/manager/posts"
          className={location.pathname === "/manager/posts" ? "active" : ""}
        >
          <i className="fa-solid fa-newspaper"></i> Quản lý bài viết
        </Link>
      </li>
      <li>
        <Link
          to="/manager/rooms"
          className={location.pathname === "/manager/rooms" ? "active" : ""}
        >
          <i className="fa-solid fa-building"></i> Quản lý phòng
        </Link>
      </li>
      <li>
        <Link
          to="/manager/invoices"
          className={location.pathname === "/manager/invoices" ? "active" : ""}
        >
          <i className="fa-solid fa-building"></i> Quản lý hóa đơn
        </Link>
      </li>
      <li>
        <Link
          to="/manager/requests"
          className={location.pathname === "/manager/requests" ? "active" : ""}
        >
          <i className="fa-solid fa-clipboard"></i> Quản lý yêu cầu sinh viên
        </Link>
      </li>
      <li>
        <Link
          to="/manager/reports"
          className={location.pathname === "/manager/reports" ? "active" : ""}
        >
          <i className="fa-solid fa-envelope"></i> Gửi yêu cầu cho nhân viên
        </Link>
      </li>
      <li>
        <Link
          to="/manager/feedback"
          className={location.pathname === "/manager/feedback" ? "active" : ""}
        >
          <i className="fa-solid fa-comments"></i> Lịch sử phản hồi
        </Link>
      </li>
    </ul>
  );
};

export default ManagerSideBar;
