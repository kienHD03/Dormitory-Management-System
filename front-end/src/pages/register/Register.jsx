import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import Spinner from "../../components/Spinner/Spinner";
import "./Register.css";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await axios.post("/auth/register", data);
      console.log(response.data);
      if (!response.data.success) {
        setIsLoading(false);
        toast.error("Đã có lỗi xảy ra");
        return;
      }
      setIsLoading(false);
      toast.success("Đăng ký thành công");
      reset();
      navigate("/login");
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      toast.error("Email đã tồn tại");
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="register-form">
      <h2>Đăng Ký</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
          <label htmlFor="fullname">Họ và tên:</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            {...register("fullname", {
              required: {
                value: true,
                message: "Họ và tên không được để trống",
              },
            })}
          />
          {errors && errors.fullname && <p className="text-danger">{errors.fullname.message}</p>}
          <i className="fa-solid fa-user input-icon"></i>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            {...register("email", {
              required: {
                value: true,
                message: "email không được để trống",
              },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "email không đúng định dạng",
              },
            })}
          />
          {errors && errors.email && <p className="text-danger">{errors.email.message}</p>}
          <i className="fa-solid fa-envelope input-icon"></i>
        </div>

        <div className="input-group">
          <label>Giới tính:</label>
          <div className="radio-group">
            <label htmlFor="male">
              <input
                type="radio"
                id="male"
                value="male"
                {...register("gender", { required: "Vui lòng chọn giới tính" })}
              />
              Nam
            </label>
            <label htmlFor="female">
              <input
                type="radio"
                id="female"
                value="female"
                {...register("gender", { required: "Vui lòng chọn giới tính" })}
              />
              Nữ
            </label>
          </div>
          {errors && errors.gender && <p className="text-danger">{errors.gender.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            name="password"
            {...register("password", {
              required: {
                value: true,
                message: "password không được để trống",
              },
              minLength: {
                value: 6,
                message: "password phải lớn hơn 6 ký tự",
              },
            })}
          />
          {errors && errors.password && <p className="text-danger">{errors.password.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="repassword">Nhập lại Mật khẩu:</label>
          <input
            type="password"
            id="repassword"
            name="repassword"
            {...register("repassword", {
              required: {
                value: true,
                message: "password không được để trống",
              },
              minLength: {
                value: 6,
                message: "password phải lớn hơn 6 ký tự",
              },
              validate: (value) =>
                value === document.getElementById("password").value || "Mật khẩu không khớp",
            })}
          />
          {errors && errors.repassword && (
            <p className="text-danger">{errors.repassword.message}</p>
          )}
        </div>

        <div className="button-group">
          <button type="submit" disabled={isLoading}>
            Đăng Ký
          </button>
        </div>
      </form>

      <div className="divider">
        <Link to="/login">Đăng nhập</Link>
      </div>

      <div
        id="g_id_onload"
        data-client_id="YOUR_GOOGLE_CLIENT_ID"
        data-context="signup"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
      ></div>

      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text="sign_up_with"
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </div>
  );
};

export default Register;
