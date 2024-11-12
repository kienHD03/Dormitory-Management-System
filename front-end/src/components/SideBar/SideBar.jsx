import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyAccessToken } from "../../utils/jwt";
import ManagerSideBar from "./ManagerSideBar";
import StudentSideBar from "./StudentSideBar";
import AdminSideBar from "./AdminSideBar";
import StaffSideBar from "./StaffSideBar";

const SideBar = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const loadUserFromToken = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) {
      navigate("/login");
      return;
    }
    const user = verifyAccessToken(token);
    setUser(user);
  };

  useEffect(() => {
    loadUserFromToken();

    const handleStorageChange = (event) => {
      if (event.key === "token") {
        loadUserFromToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return (
    <div className="sidebar">
      {user.role === "Admin" && <AdminSideBar />}
      {user.role === "Manager" && <ManagerSideBar />}
      {user.role === "Student" && <StudentSideBar user={user} />}
      {user.role === "Staff" && <StaffSideBar />}
    </div>
  );
};

export default SideBar;
