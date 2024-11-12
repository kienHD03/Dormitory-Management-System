// pages/Admin.jsx
import styles from "./Admin.module.css"; // Import styles cho Admin

const Admin = () => {
  return (
    <div className={styles["admin-functions"]}>
      <div className={styles["function-box"]}>
        <i className="fa-solid fa-users"></i>
        <h3>Quản lý người dùng</h3>
        <p>Thêm, chỉnh sửa và xóa người dùng trong hệ thống.</p>
        <a href="#">Xem chi tiết</a>
      </div>
      <div className={styles["function-box"]}>
        <i className="fa-solid fa-newspaper"></i>
        <h3>Quản lý bài viết</h3>
        <p>Đăng, chỉnh sửa và xóa các bài viết thông báo.</p>
        <a href="#">Xem chi tiết</a>
      </div>
      <div className={styles["function-box"]}>
        <i className="fa-solid fa-building"></i>
        <h3>Quản lý phòng</h3>
        <p>Thêm mới, cập nhật thông tin và kiểm tra trạng thái phòng.</p>
        <a href="/manager/rooms">Xem chi tiết</a>
      </div>
      <div className={styles["function-box"]}>
        <i className="fa-solid fa-clipboard"></i>
        <h3>Quản lý yêu cầu</h3>
        <p>Xem và duyệt các yêu cầu đăng ký phòng của sinh viên.</p>
        <a href="#">Xem chi tiết</a>
      </div>
      <div className={styles["function-box"]}>
        <i className="fa-solid fa-comments"></i>
        <h3>Phản hồi</h3>
        <p>Kiểm tra và trả lời phản hồi từ sinh viên.</p>
        <a href="#">Xem chi tiết</a>
      </div>
    </div>
  );
};

export default Admin;
