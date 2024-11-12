// components/LayoutManager.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import Link và useLocation
import styles from "./LayoutManager.module.css"; // Thêm file CSS tương ứng
import SideBar from "../components/SideBar/SideBar";
import Header from "../components/Header/Header";

const LayoutManager = ({ children }) => {
  const [isSidebarActive, setIsSidebarActive] = useState(true);

  const handleToggle = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  return (
    <div className={styles["layout-manager"]}>
      <Header handleToggle={handleToggle} />

      <div
        className={`${styles.sidebar} ${
          isSidebarActive ? styles.active : "styles.active"
        }`}
      >
        <SideBar />
      </div>

      <div className={styles["main-content"]}>{children}</div>
    </div>
  );
};

export default LayoutManager;
