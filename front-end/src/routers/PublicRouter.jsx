import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { verifyAccessToken } from "../utils/jwt";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import NotFound from "../components/NotFound";
//phần student
import HomeStudent from "../pages/student/HomeStudent";
import News from "../pages/news/News";
import Booking from "../pages/booking/Booking";
import Resident_Histories from "../pages/resident_histories/Resident_Histories";
import Invoice from "../pages/Invoice/Invoice";
import Request from "../pages/request/Request";
import Response from "../pages/response/Response";

import HomeManager from "../pages/manager/HomeManager";
import Posts from "../pages/posts/Posts";
import Request_Manager from "../pages/RequestManager/RequestManager";
import Report_Manager from "../pages/ReportManager/Report";
import Feedback_Manager from "../pages/feedback/Feedback";

import Admin from "../pages/admin/Admin";
import User_Admin from "../pages/userAdmin/UserAdmin";

import Staff from "../pages/staff/Staff";
import Report_Staff from "../pages/ReportStaff/ReportStaff";

import Layout from "../layouts/Layout";
import Verify from "../pages/OTP/Verify";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import AuthRedirectMiddleware from "../middlewares/AuthRedirectMiddleWare";
import RoomManager from "../pages/room_manager/RoomManager";
import ChatBot from "../pages/ChatBot/ChatBot";
import UserManagement from "../pages/UserManagement/UserManagement";
import Profile from "../pages/profile/Profile";
import Home from "../pages/Home/Home";
import InvoiceManagement from "../pages/InvoiceManagement/InvoiceManagement";

const PublicRouter = () => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const loadUserFromToken = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      const user = verifyAccessToken(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (!user || user.exp < currentTime) {
        localStorage.removeItem("token");
      }
      setUser(user);
    }
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
    <Routes>
      <Route element={<AuthMiddleware />}>
        <Route element={<Layout />}>
          <Route path="/admin">
            <Route index element={<Admin />} />
            <Route path="users" element={<User_Admin />} />
          </Route>

          <Route path="/manager">
            <Route index element={<HomeManager />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="posts" element={<Posts />} />
            <Route path="requests" element={<Request_Manager />} />
            <Route path="reports" element={<Report_Manager />} />
            <Route path="invoices" element={<InvoiceManagement />} />
            <Route path="feedback" element={<Feedback_Manager />} />
          </Route>

          <Route path="/staff">
            <Route index element={<Staff />} />
            <Route path="reports" element={<Report_Staff />} />
          </Route>

          <Route path="/student">
            <Route index element={<HomeStudent />} />
            <Route path="news" element={<News />} />
            {!user.room && <Route path="booking" element={<Booking />} />}

            <Route path="profile" element={<Profile />} />
            <Route path="resident_histories" element={<Resident_Histories />} />
            <Route path="invoice" element={<Invoice />} />
            {user.room && <Route path="requests" element={<Request />} />}
            {user.room && <Route path="response" element={<Response />} />}
          </Route>
          <Route path="/chatbot" element={<ChatBot />} />
        </Route>
      </Route>

      <Route element={<AuthRedirectMiddleware />}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/home" element={<Home />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default PublicRouter;
