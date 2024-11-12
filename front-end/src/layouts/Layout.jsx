import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar/SideBar";
import Header from "../components/Header/Header";
import "./Layout.css";

const Layout = () => {
  const [isActive, setIsActive] = useState(true);
  const handleToggle = () => {
    setIsActive(!isActive);
  };
  return (
    <div className="layout-wrapper h-100">
      <Header handleToggle={handleToggle} />
      <div className="row mt-4">
        {isActive && (
          <div className="col-3">
            <SideBar isActive={isActive} />
          </div>
        )}
        <div className={`${isActive ? "col-9" : "col-12"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
