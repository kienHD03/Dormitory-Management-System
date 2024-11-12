import { useNavigate } from "react-router-dom";
import "./Header.css";
import { googleLogout } from "@react-oauth/google";

const Header = ({ handleToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    googleLogout();
    navigate("/login");
  };
  return (
    <header className="header ">
      <div className="sidebar__toggle-btn" onClick={handleToggle}>
        <i className="fa-solid fa-bars"></i>
      </div>

      <div className="logout">
        <button onClick={handleLogout}>
          <i className="fa-solid fa-sign-out-alt"></i> Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;
