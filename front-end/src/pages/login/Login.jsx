import { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useForm } from "react-hook-form";
import axios from "../../utils/axios";
import { verifyAccessToken } from "../../utils/jwt";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../../components/Spinner/Spinner";
import { useGoogleLogin } from "@react-oauth/google"; // Thêm useGoogleLogin

const Login = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      try {
        const user = verifyAccessToken(token);

        if (user.role === "Student") {
          navigate("/student");
        } else if (user.role === "Manager") {
          navigate("/manager");
        } else if (user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/staff");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post("/auth/login", data);
      if (response.data.success) {
        const tokens = response.data.data;
        if (!tokens) {
          setLoading(false);
          toast.error("Tokens not found");
          return;
        }
        const { accessToken, refreshToken } = tokens;
        const user = verifyAccessToken(accessToken);
        localStorage.setItem("token", JSON.stringify(accessToken));
        toast.success("Đăng nhập thành công");
        if (user.status === 0) {
          setLoading(false);
          reset();
          navigate("/verify");
          return;
        }

        setLoading(false);
        reset();
        if (user.role === "Student") {
          navigate("/student");
        } else if (user.role === "Manager") {
          navigate("/manager");
        } else if (user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/staff");
        }
      }
    } catch (e) {
      setLoading(false);
      if (e.status === 404 || e.status === 401) {
        toast.error("Sai email hoặc mật khẩu");
      } else {
        toast.error("Đã có lỗi xảy ra");
      }
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const userInfo = await axios
          .get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          .then((res) => res.data);
        // console.log(userInfo);

        const genderResponse = await axios
          .get(`https://people.googleapis.com/v1/people/me?&personFields=genders`, {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          .then((res) => res.data);

        // console.log(genderResponse);

        const gender = genderResponse.genders && genderResponse.genders[0].value;
        const boolGender = gender === "male" ? 1 : 0;

        // console.log(userInfo, gender);

        const response = await axios.post("/auth/google-login", {
          email: userInfo.email,
          name: userInfo.name,
          gender: boolGender,
        });

        const { accessToken, refreshToken } = response.data.data;
        const user = verifyAccessToken(accessToken);

        localStorage.setItem("token", JSON.stringify(accessToken));
        toast.success("Đăng nhập thành công");

        setLoading(false);

        if (user.role === "Student") {
          navigate("/student");
        } else if (user.role === "Manager") {
          navigate("/manager");
        } else if (user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/staff");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Đã có lỗi xảy ra trong quá trình đăng nhập với Google");
        console.error("Error during Google login:", error);
      }
    },
    onError: () => {
      toast.error("Đăng nhập bằng Google thất bại");
    },
    scope:
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.gender.read", // Các scope cần thiết
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className={styles["login-container"]}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles["input-group"]}>
          <label htmlFor="email" className="form-babel">
            Email:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-control"
            {...register("email", {
              required: {
                value: true,
                message: "email không được để trống",
              },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "email không hợp lệ",
              },
            })}
          />
          {errors && errors.email && <p className="text-danger">{errors.email.message}</p>}
        </div>
        <div className={styles["input-group"]}>
          <label htmlFor="password" className="form-babel">
            Mật khẩu:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-control"
            {...register("password", {
              required: {
                value: true,
                message: "password không được để trống",
              },
            })}
          />
          {errors && errors.password && <p className="text-danger">{errors.password.message}</p>}
        </div>
        <div className={styles["button-group"]}>
          <button type="submit" disabled={loading}>
            Đăng Nhập
          </button>
        </div>
        <p className={styles["register-link"]}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>

      <div className={styles.divider}>
        <span>hoặc</span>
      </div>

      <div className="text-center">
        <button className={styles.googleLoginBtn} onClick={() => googleLogin()}>
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
};

export default Login;
