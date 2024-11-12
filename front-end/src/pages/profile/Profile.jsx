import styles from "./Profile.module.css"; // Import CSS module
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";

const Profile = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("token")));
  const [user, setUser] = useState(verifyAccessToken(token));
  const [isEditing, setIsEditing] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullname: user.fullname,
    gender: user.gender ? "1" : "0", // Chuyển đổi giá trị giới tính thành chuỗi "1" hoặc "0"
    phone: user.phone === null ? "" : user.phone,
  });

  // Trạng thái cho chế độ đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  const handleEditClick = () => {
    setIsEditing(true); // Mở chế độ chỉnh sửa thông tin cá nhân
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value, // Chỉ cần lưu giá trị
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPasswordData((prevData) => ({
      ...prevData,
      [name]: value, // Lưu giá trị mật khẩu mới
    }));
  };

  const fetchUserData = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    const user = verifyAccessToken(token);
    setUser(user);
    setNewUserData({
      fullname: user.fullname,
      gender: user.gender ? "1" : "0",
      phone: user.phone === null ? "" : user.phone,
    });
  };

  const handleSave = async () => {
    if (!newUserData.fullname.trim()) {
      alert("Vui lòng nhập Họ và Tên.");
      return;
    }

    if (!newUserData.phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(newUserData.phone) && newUserData.phone !== "") {
      alert("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }

    try {
      const response = await axios.put(`/users/${user.id}`, newUserData);

      if (response.status === 200) {
        const data = response.data.data;
        const { accessToken } = data;
        localStorage.setItem("token", JSON.stringify(accessToken));
        toast.success("Cập nhật thông tin thành công!");
        fetchUserData();
        setIsEditing(false); // Đóng chế độ chỉnh sửa
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  const handleCancel = () => {
    setNewUserData({
      fullname: user.fullname,
      gender: user.gender ? "1" : "0",
      phone: user.phone === null ? "" : user.phone,
    });
    setIsEditing(false); // Đóng chế độ chỉnh sửa mà không lưu thay đổi
  };

  const handleChangePasswordClick = () => {
    setIsChangingPassword(true);
  };

  const handleChangePassword = async () => {
    if (!newPasswordData.newPassword.trim() || !newPasswordData.confirmPassword.trim()) {
      alert("Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.");
      return;
    }

    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const response = await axios.patch(`/users/${user.id}/password`, {
        newPassword: newPasswordData.newPassword,
      });

      if (response.status === 200) {
        toast.success("Đổi mật khẩu thành công!");
        setIsChangingPassword(false);
        setNewPasswordData({ newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      toast.error("Đổi mật khẩu thất bại!");
    }
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setNewPasswordData({ newPassword: "", confirmPassword: "" }); // Reset dữ liệu mật khẩu
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileTitle}>Thông tin sinh viên</h1>
      <div className={styles.infoGrid}>
        <div className={styles.personalInfo}>
          <h2>Thông tin cá nhân</h2>
          <p>
            <strong>Họ và Tên:</strong> {user.fullname}
          </p>
          <p>
            <strong>Giới tính:</strong> {user.gender === true ? "Nam" : "Nữ"}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone === null ? "Chưa cập nhật" : user.phone}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div className={styles.roomInfo}>
          <h2>Thông tin phòng</h2>
          <p>
            <strong>Tòa nhà:</strong> {user.department ? user.department : "Chưa có dữ liệu"}
          </p>
          <p>
            <strong>Tầng:</strong> {user.room !== null && user.room[1]}
          </p>
          <p>
            <strong>Phòng:</strong> {user.room ? user.room : "Chưa có dữ liệu"}
          </p>
          <p>
            <strong>Giường:</strong> {user.bed === null ? "Chưa có dữ liệu" : user.bed}
          </p>
          <p>
            <strong>Ngày hết hạn phòng:</strong>{" "}
            {user.expired_at === null ? "N/A" : toLocaleData(user.expired_at)}
          </p>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button className={styles.editButton} onClick={handleEditClick}>
          Cập nhật
        </button>
        <button className={styles.editButton} onClick={handleChangePasswordClick}>
          Đổi mật khẩu
        </button>
      </div>

      {/* Khung chỉnh sửa thông tin cá nhân */}
      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.editContainer}>
            <h2>Cập nhật thông tin cá nhân</h2>
            <div className={styles.editFields}>
              <label>
                Họ và Tên:
                <input
                  type="text"
                  name="fullname"
                  value={newUserData.fullname}
                  onChange={handleChange}
                  placeholder="Nhập tên mới"
                />
              </label>
              <label>
                Giới tính:
                <select
                  name="gender"
                  value={newUserData.gender} // Sử dụng giá trị đúng cho giới tính
                  onChange={handleChange}
                >
                  <option value="1">Nam</option>
                  <option value="0">Nữ</option>
                </select>
              </label>
              <label>
                Số điện thoại:
                <input
                  type="text"
                  name="phone"
                  value={newUserData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={handleSave} className={styles.saveButton}>
                Cập nhật
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangingPassword && (
        <div className={styles.modalOverlay}>
          <div className={styles.editContainer}>
            <h2>Đổi mật khẩu</h2>
            <div className={styles.editFields}>
              <label>
                Mật khẩu mới:
                <input
                  type="password"
                  name="newPassword"
                  value={newPasswordData.newPassword}
                  onChange={(e) =>
                    setNewPasswordData({ ...newPasswordData, newPassword: e.target.value })
                  }
                  placeholder="Nhập mật khẩu mới"
                />
              </label>
              <label>
                Nhập lại mật khẩu mới:
                <input
                  type="password"
                  name="confirmPassword"
                  value={newPasswordData.confirmPassword}
                  onChange={(e) =>
                    setNewPasswordData({ ...newPasswordData, confirmPassword: e.target.value })
                  }
                  placeholder="Nhập lại mật khẩu mới"
                />
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button onClick={handleChangePassword} className={styles.saveButton}>
                Đổi mật khẩu
              </button>
              <button onClick={handleCancelChangePassword} className={styles.cancelButton}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
