import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { verifyAccessToken } from "../utils/jwt";
import NotFound from "../components/NotFound";
import Spinner from "../components/Spinner/Spinner";

const AuthMiddleware = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const path = location.pathname;

  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("token"));
        if (!token) {
          return navigate("/login");
        }

        const user = verifyAccessToken(token);
        if (!user) {
          localStorage.removeItem("token");
          return navigate("/login");
        }

        const currentTime = Math.floor(Date.now() / 1000);
        if (user.exp < currentTime) {
          localStorage.removeItem("token");
          return navigate("/login");
        }

        if (user.status === 0) {
          return navigate("/verify");
        }

        if (path.startsWith("/student") && user.role === "Student") {
          setIsVerified(true);
        } else if (path.startsWith("/manager") && user.role === "Manager") {
          setIsVerified(true);
        } else if (path.startsWith("/admin") && user.role === "Admin") {
          setIsVerified(true);
        } else if (path.startsWith("/staff") && user.role === "Staff") {
          setIsVerified(true);
        } else if (path.startsWith("/chatbot") && user.status === 1) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (e) {
        localStorage.removeItem("token");
        navigate("/login");
        setIsVerified(false);
        console.error(e);
      } finally {
        setIsLoading(false); // Loading is done
      }
    };

    verifyUser();
  }, [path, navigate]);

  if (isLoading) {
    return <Spinner />;
  }

  return <div className="auth-wrapper h-100">{isVerified ? <Outlet /> : <NotFound />}</div>;
};

export default AuthMiddleware;
