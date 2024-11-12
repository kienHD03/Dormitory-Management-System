import { useNavigate, Outlet } from "react-router-dom";
import { verifyAccessToken } from "../utils/jwt";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner/Spinner";

const AuthRedirectMiddleware = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  console.log("ok");

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      try {
        setIsLoading(true);
        const user = verifyAccessToken(token);

        const currentTime = Math.floor(Date.now() / 1000);

        if (!user || user.exp < currentTime) {
          localStorage.removeItem("token");
        }

        if (user.status !== 0) {
          if (user.role === "Student") {
            setIsLoading(false);
            navigate("/student");
          } else if (user.role === "Manager") {
            setIsLoading(false);
            navigate("/manager");
          } else if (user.role === "Admin") {
            setIsLoading(false);
            navigate("/admin");
          } else {
            setIsLoading(false);
            navigate("/staff");
          }
        }
      } catch (error) {
        setIsLoading(false);
        localStorage.removeItem("token");
      }
    }
  }, []);

  if (isLoading) {
    return <Spinner />;
  }

  return <Outlet />;
};

export default AuthRedirectMiddleware;
