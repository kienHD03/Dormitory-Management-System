import styles from "./UserAdmin.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import MyPagination from "../../components/Pagination/MyPagination";

const UserAdmin = () => {
  const [userList, setUserList] = useState([]); // Dữ liệu danh sách người dùng
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [genderFilter, setGenderFilter] = useState(""); // Bộ lọc giới tính
  const [statusFilter, setStatusFilter] = useState(""); // Bộ lọc trạng thái
  const [roleFilter, setRoleFilter] = useState(""); // Bộ lọc quyền
  const [selectedUser, setSelectedUser] = useState(null); // Người dùng được chọn để xem chi tiết
  const [editRole, setEditRole] = useState(""); // Vai trò được chọn để chỉnh sửa
  const [isEditingRole, setIsEditingRole] = useState(false); // Trạng thái sửa vai trò
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [errors, setErrors] = useState({});
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    gender: "",
    password: "",
    role: "",
    phone: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchUserList = async () => {
    try {
      const response = await axios.get("/users");

      // Cập nhật danh sách người dùng từ response.data.users
      if (response.status === 200) {
        const newUsers = response.data.data.users.filter((user) => user.role !== "Admin");
        setUserList(newUsers);
      } else {
        console.error("Lỗi khi lấy dữ liệu, không có dữ liệu người dùng");
        toast.error("Không có dữ liệu người dùng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể lấy danh sách người dùng.");
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const filteredUserList = userList.filter((user) => {
    const matchesSearchTerm =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    const matchesGenderFilter =
      genderFilter === "" ||
      (genderFilter === "1" && user.gender === true) ||
      (genderFilter === "0" && user.gender === false);

    const matchesStatusFilter =
      statusFilter === "" ||
      (statusFilter === "1" && user.status === 1) ||
      (statusFilter === "0" && user.status === 0);

    const matchesRoleFilter = roleFilter === "" || user.role === roleFilter;

    return matchesSearchTerm && matchesGenderFilter && matchesStatusFilter && matchesRoleFilter;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentFilteredUsers = filteredUserList.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUserList.length / usersPerPage);

  const deleteUser = async (id) => {
    // console.log(id);
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        const response = await axios.delete(`/users/${id}`);
        // console.log(response);
        if (response.status === 200) {
          toast.success("Xóa người dùng thành công!");
          setUserList((prevList) => prevList.filter((user) => user.id !== id));
        }
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        toast.error("Lỗi khi xóa người dùng");
      }
    }
  };

  // Mở modal để xem thông tin hoặc chỉnh sửa role
  const openUserDetail = (user) => {
    setSelectedUser(user);
    setIsEditingRole(false); // Đặt lại trạng thái chỉnh sửa
  };

  // Mở modal để chỉnh sửa role
  const openEditRole = (user) => {
    setSelectedUser(user);
    setEditRole(user.role); // Lưu role hiện tại để chỉnh sửa
    setIsEditingRole(true); // Bật chế độ chỉnh sửa role
  };

  // Đóng modal
  const closeUserDetail = () => {
    setSelectedUser(null);
    setIsEditingRole(false); // Đặt lại trạng thái chỉnh sửa khi đóng modal
  };

  const openAddUserModal = () => {
    setIsAddingUser(true);
  };
  const closeAddUserModal = () => {
    setIsAddingUser(false);
    setNewUser({
      fullname: "",
      email: "",
      gender: "",
      password: "",
      role: "",
      phone: "",
    });
  };
  const validateNewUser = () => {
    const errors = {};

    if (!newUser.fullname.trim()) {
      errors.fullname = "Họ và tên không được để trống";
    }

    if (!newUser.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!newUser.phone.trim()) {
      errors.phone = "Số điện thoại không được để trống";
    } else if (!/^\d{10}$/.test(newUser.phone)) {
      errors.phone = "Số điện thoại phải có 10 chữ số";
    } else if (!/^0\d{9,10}$/.test(newUser.phone)) {
      errors.phone = "Số điện thoại phải bắt đầu với số 0";
    }

    if (!newUser.password.trim()) {
      errors.password = "Mật khẩu không được để trống";
    } else if (newUser.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!newUser.gender) {
      errors.gender = "Vui lòng chọn giới tính";
    }

    if (!newUser.role) {
      errors.role = "Vui lòng chọn chức vụ";
    }

    return errors;
  };

  const handleAddUser = async () => {
    const validationErrors = validateNewUser();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post("/users/create", newUser);
      console.log(response);
      if (response.status === 201) {
        toast.success("Thêm người dùng thành công!");
        setUserList((prevList) => [...prevList, response.data.data.user]);
        closeAddUserModal();
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi thêm người dùng");
    }
  };

  const updateUserRole = async (id, newRole) => {
    try {
      let roleNum = 0;
      if (newRole === "Student") {
        roleNum = 4;
      } else if (newRole === "Manager") {
        roleNum = 2;
      } else if (newRole === "Staff") {
        roleNum = 3;
      }
      const response = await axios.patch(`/users/${id}/role`, {
        role: roleNum,
      });
      if (response.status === 200) {
        toast.success("Cập nhật quyền thành công!");
        setUserList((prevList) =>
          prevList.map((user) => (user.id === id ? { ...user, role: newRole } : user))
        );
        closeUserDetail();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền:", error);
      toast.error("Lỗi khi cập nhật quyền người dùng");
    }
  };

  return (
    <div className={styles["user-admin-section"]}>
      <h2 className={styles["title"]}>Quản lý Người dùng</h2>
      <div className={styles["filter-section"]}>
        <div className={styles["inputGroup"]}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles["inputGroup"]}>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="">Tất cả giới tính</option>
            <option value="1">Nam</option>
            <option value="0">Nữ</option>
          </select>
        </div>
        <div className={styles["inputGroup"]}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đã kích hoạt</option>
            <option value="0">Chưa kích hoạt</option>
          </select>
        </div>
        <div className={styles["inputGroup"]}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả chức vụ</option>
            <option value="Student">Sinh viên</option>
            <option value="Manager">Quản lý</option>
            <option value="Staff">Nhân viên</option>
          </select>
        </div>
        <button className={styles["button-add"]} onClick={openAddUserModal}>
          Thêm tài khoản mới
        </button>
      </div>

      {currentFilteredUsers.length === 0 ? (
        <div className={styles["no-user-message"]}>Hiện tại không có người dùng nào</div>
      ) : (
        <table className={styles["user-table"]}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
              <th>Chức vụ</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {currentFilteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullname}</td>
                <td>{user.phone}</td>
                <td>{user.gender === true ? "Nam" : "Nữ"}</td>
                <td>{user.status === 1 ? "Đã kích hoạt" : "Chưa kích hoạt"}</td>
                <td>
                  {user.role === "Student"
                    ? "Sinh viên"
                    : user.role === "Manager"
                    ? "Quản lý"
                    : user.role === "Admin"
                    ? "Quản trị viên"
                    : "Nhân viên"}
                </td>
                <td>
                  <button className={styles["button-view"]} onClick={() => openUserDetail(user)}>
                    Xem
                  </button>
                  <button className={styles["button-edit"]} onClick={() => openEditRole(user)}>
                    Sửa
                  </button>
                  {user.status === 0 && (
                    <button className={styles["button-delete"]} onClick={() => deleteUser(user.id)}>
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isAddingUser && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <span className={styles["close"]} onClick={closeAddUserModal}>
              &times;
            </span>
            <h3 className={styles["title"]}>Thêm tài khoản mới</h3>
            <div className={styles["inputGroup"]}>
              <label>Họ và tên:</label>
              <input
                type="text"
                value={newUser.fullname}
                onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              />
              {errors.fullname && <p className={styles["error-message"]}>{errors.fullname}</p>}
            </div>
            <div className={styles["inputGroup"]}>
              <label>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              {errors.email && <p className={styles["error-message"]}>{errors.email}</p>}
            </div>
            <div className={styles["inputGroup"]}>
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              />
              {errors.phone && <p className={styles["error-message"]}>{errors.phone}</p>}
            </div>
            <div className={styles["inputGroup"]}>
              <label>Giới tính:</label>
              <select
                value={newUser.gender}
                onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              {errors.gender && <p className={styles["error-message"]}>{errors.gender}</p>}
            </div>
            <div className={styles["inputGroup"]}>
              <label>Mật khẩu:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              {errors.password && <p className={styles["error-message"]}>{errors.password}</p>}
            </div>
            <div className={styles["inputGroup"]}>
              <label>Chức vụ:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="">Chọn chức vụ</option>
                <option value="4">Sinh viên</option>
                <option value="2">Quản lý</option>
                <option value="3">Nhân viên</option>
              </select>
              {errors.role && <p className={styles["error-message"]}>{errors.role}</p>}
            </div>
            <button className={styles["button-save"]} onClick={handleAddUser}>
              Thêm
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <span className={styles["close"]} onClick={closeUserDetail}>
              &times;
            </span>
            {!isEditingRole ? (
              <>
                <h3>Chi tiết phòng</h3>
                <p>Phòng: {selectedUser.room ? selectedUser.room : "Chưa có phòng"}</p>
                <p>Giường: {selectedUser.bed ? selectedUser.bed : "Chưa có giường"}</p>
                <p>
                  Tòa: {selectedUser.department ? selectedUser.department : "Chưa có thông tin"}
                </p>
                <p>
                  Hết hạn đặt phòng:{" "}
                  {selectedUser.expired_at
                    ? new Date(selectedUser.expired_at).toLocaleString("vi-VN", {
                        timeZone: "UTC",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Chưa xác định"}
                </p>
              </>
            ) : (
              <>
                <h3>Chỉnh sửa vai trò</h3>
                <div className={styles["inputGroup"]}>
                  <label>Vai trò mới:</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="Student">Sinh viên</option>
                    <option value="Manager">Quản lý</option>
                    <option value="Staff">Nhân viên</option>
                  </select>
                </div>
                <button
                  className={styles["button-save"]}
                  onClick={() => updateUserRole(selectedUser.id, editRole)}
                >
                  Lưu
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {totalPages > 1 && (
        <MyPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default UserAdmin;
