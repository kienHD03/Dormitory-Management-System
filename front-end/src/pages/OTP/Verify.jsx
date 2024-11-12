import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Verify.module.css";
import { verifyAccessToken } from "../../utils/jwt";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner/Spinner";

const Verify = () => {
  const [otp, setOtp] = useState();
  const [seconds, setSeconds] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    try {
      e.preventDefault();
      const token = JSON.parse(localStorage.getItem("token"));
      const user = verifyAccessToken(token);
      if (!user) {
        console.log("User not found");
        toast.error("User not found");
      }
      const data = {
        email: user.email,
        otp: otp,
      };
      setIsLoading(true);
      const response = await axios.post("/auth/verify", data);
      toast.success("Xác thực thành công");
      if (response.data.success) {
        const token = response.data.data;
        localStorage.setItem("token", JSON.stringify(token));
        setIsLoading(false);
        navigate("/student");
        return;
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);

      toast.error("Xác thực thất bại");
    }
  };

  const handleResend = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const user = verifyAccessToken(token);
      if (!user) {
        console.error("User not found");
      }
      const data = {
        email: user.email,
      };
      const response = await axios.post("/auth/otp", data);
      if (response.data.success) {
        setSeconds(10);
        toast.success("Gửi mã OTP thành công");
        return;
      }
    } catch (e) {
      console.error(e);
      toast.error("Gửi mã OTP thất bại");
    }
  };

  const handleCancel = () => {
    navigate("/login");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div className={styles.container}>
      <h2>Nhập mã OTP</h2>
      <form className={styles.otpContainer} onSubmit={handleVerify}>
        <input
          type="text"
          name="otp"
          value={otp}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setOtp(value);
            }
          }}
          maxLength="6"
        />
        <button>Xác nhận</button>
      </form>

      <div className={styles.actions}>
        <button onClick={handleResend} disabled={seconds > 0} className={styles.button}>
          Gửi lại {seconds > 0 && `(${seconds}s)`}
        </button>
        <button onClick={handleCancel} className={styles.button}>
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Verify;
