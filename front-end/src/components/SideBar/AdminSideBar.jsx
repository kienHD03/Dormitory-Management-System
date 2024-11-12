import { Link } from "react-router-dom";

const AdminSideBar = () => {
  return (
    <ul>
      <li>
        <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>
          <i className="fa-solid fa-user"></i> Trang chủ
        </Link>
      </li>
      <li>
        <Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>
          <i className="fa-solid fa-users"></i> Quản lý người dùng
        </Link>
      </li>
      {/* <li>
        <Link
          to="/admin/posts"
          className={location.pathname === "/admin/posts" ? "active" : ""}
        >
          <i className="fa-solid fa-newspaper"></i> Quản lý bài viết
        </Link>
      </li> */}
      {/* <li>
        <Link
          to="/admin/rooms"
          className={location.pathname === "/admin/rooms" ? "active" : ""}
        >
          <i className="fa-solid fa-building"></i> Quản lý phòng
        </Link>
      </li> */}
      {/* <li>
        <Link
          to="/admin/requests"
          className={location.pathname === "/admin/requests" ? "active" : ""}
        >
          <i className="fa-solid fa-clipboard"></i> Quản lý yêu cầu
        </Link>
      </li>
      <li>
        <Link
          to="/admin/feedback"
          className={location.pathname === "/admin/feedback" ? "active" : ""}
        >
          <i className="fa-solid fa-comments"></i> Phản hồi
        </Link>
      </li> */}
      <li>
        <Link to="/chatbot" className={location.pathname === "/admin/chatbot" ? "active" : ""}>
          <i className="fa-solid fa-comments"></i> Chatbot
        </Link>
      </li>
    </ul>
  );
};

export default AdminSideBar;
