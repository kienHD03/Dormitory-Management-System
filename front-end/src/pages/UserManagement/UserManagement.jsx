import styles from "./UserManagement.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import MyPagination from "../../components/Pagination/MyPagination";

const UserManagement = () => {
  const [userList, setUserList] = useState([]); // Dữ liệu danh sách người dùng
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [genderFilter, setGenderFilter] = useState(""); // Bộ lọc giới tính
  const [statusFilter, setStatusFilter] = useState(""); // Bộ lọc trạng thái
  const [roomSearchTerm, setRoomSearchTerm] = useState(""); // Tìm kiếm theo phòng
  const [selectedUser, setSelectedUser] = useState(null); // Người dùng được chọn để xem chi tiết
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Số người dùng trên mỗi trang
  const [editUser, setEditUser] = useState(null); // Người dùng được chọn để chỉnh sửa
  const [roomInput, setRoomInput] = useState(""); // Giá trị phòng
  const [bedInput, setBedInput] = useState(""); // Giá trị giường

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const response = await axios.get("/users");
        console.log("Toàn bộ dữ liệu nhận về:", response.data);

        if (
          response.status === 200 &&
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data.users)
        ) {
          setUserList(response.data.data.users);
        } else {
          console.error("Lỗi khi lấy dữ liệu, không có dữ liệu người dùng");
          toast.error("Không có dữ liệu người dùng");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không thể lấy danh sách người dùng.");
      }
    };

    fetchUserList();
  }, []);

  // Hàm tìm kiếm và lọc người dùng
  const filteredUserList = userList.filter((user) => {
    const matchesSearchTerm =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));

    const matchesRoomSearchTerm =
      roomSearchTerm === "" ||
      (user.room &&
        user.room.toLowerCase().includes(roomSearchTerm.toLowerCase()));

    const matchesGenderFilter =
      genderFilter === "" ||
      (genderFilter == 1 && user.gender == 1) ||
      (genderFilter == 0 && user.gender == 0);

    const matchesStatusFilter =
      statusFilter === "" ||
      (statusFilter == 1 && user.status == 1) ||
      (statusFilter == 0 && user.status == 0);

    const matchesRoleFilter = user.role === "Student";

    return (
      matchesSearchTerm &&
      matchesRoomSearchTerm &&
      matchesGenderFilter &&
      matchesStatusFilter &&
      matchesRoleFilter
    );
  });

  // Pagination logic for filtered users
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentFilteredUsers = filteredUserList.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredUserList.length / usersPerPage);

  // Xóa booking của người dùng
  const deleteBooking = async (id) => {
    console.log(id);
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa booking của người dùng này không?"
      )
    ) {
      try {
        const response = await axios.delete(`/users/${id}/booking`);
        if (response.status === 200) {
          toast.success("Hủy đặt phòng thành công!");

          // Cập nhật danh sách người dùng bằng cách loại bỏ phòng của người dùng đã xóa
          setUserList((prevList) =>
            prevList.map((user) =>
              user.id === id
                ? { ...user, room: "", bed: "", department: "", expired_at: "" }
                : user
            )
          );
        }
      } catch (error) {
        console.error("Lỗi khi hủy đặt phòng:", error);
        toast.error("Lỗi khi hủy đặt phòng");
      }
    }
  };

  // Hiển thị modal chi tiết người dùng
  const openUserDetail = (user) => {
    setSelectedUser(user);
  };

  const closeUserDetail = () => {
    setSelectedUser(null);
  };

  // Mở modal chỉnh sửa
  const openEditBooking = (user) => {
    setEditUser(user);
    setRoomInput(user.room || ""); // Set current room
    setBedInput(user.bed || ""); // Set current bed
  };

  const closeEditModal = () => {
    setEditUser(null);
    setRoomInput(""); // Reset room input
    setBedInput(""); // Reset bed input
  };

  // Lưu thay đổi
  const saveChanges = async () => {
    try {
      const response = await axios.put(`/users/${editUser.id}/booking`, {
        room: roomInput,
        bed: bedInput,
      });
      if (response.status === 200) {
        toast.success("Cập nhật thông tin người dùng thành công!");
        setUserList((prevList) =>
          prevList.map((user) =>
            user.id === editUser.id
              ? { ...user, room: roomInput, bed: bedInput }
              : user
          )
        );
        closeEditModal(); // Close modal after saving
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Lỗi khi cập nhật thông tin người dùng.");
    }
  };

  return (
    <div className={styles["user-admin-section"]}>
      <h2 className={styles["title"]}>Quản lý Sinh Viên</h2>
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
          <input
            type="text"
            placeholder="Phòng"
            value={roomSearchTerm}
            onChange={(e) => setRoomSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles["inputGroup"]}>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">Tất cả giới tính</option>
            <option value="1">Nam</option>
            <option value="0">Nữ</option>
          </select>
        </div>
        <div className={styles["inputGroup"]}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đã kích hoạt</option>
            <option value="0">Chưa kích hoạt</option>
          </select>
        </div>
      </div>

      {filteredUserList.length === 0 ? (
        <div className={styles["no-user-message"]}>
          Hiện tại không có người dùng nào
        </div>
      ) : (
        <table className={styles["user-table"]}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Giới tính</th>
              <th>Trạng thái</th>
              <th>Phòng</th>
              <th>Chức năng</th>
            </tr>
          </thead>
          <tbody>
            {currentFilteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullname}</td>
                <td>{user.phone}</td>
                <td>
                  {user.gender == 1
                    ? "Nam"
                    : user.gender == 0
                    ? "Nữ"
                    : "Chưa xác định"}
                </td>
                <td>
                  {user.status == 1
                    ? "Đã kích hoạt"
                    : user.status == 0
                    ? "Chưa kích hoạt"
                    : "Chưa xác định"}
                </td>
                <td>{user.room ? user.room : "Chưa có phòng"}</td>
                <td className={styles["button-table"]}>
                  <button
                    className={styles["button-view"]}
                    onClick={() => openUserDetail(user)}
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <span className={styles["close"]} onClick={closeUserDetail}>
              &times;
            </span>
            <h3>Thông tin chi tiết</h3>
            <p>Email: {selectedUser.email}</p>
            <p>Họ tên: {selectedUser.fullname}</p>
            <p>Số điện thoại: {selectedUser.phone}</p>
            <p>
              Phòng:{" "}
              {selectedUser.room ? selectedUser.room : "Chưa có dữ liệu phòng"}
            </p>
            <p>
              Giường:{" "}
              {selectedUser.bed ? selectedUser.bed : "Chưa có dữ liệu giường"}
            </p>
            <p>
              Tầng:{" "}
              {selectedUser.room
                ? selectedUser.room.split("")[1]
                : "Chưa có dữ liệu tầng"}
            </p>
            <p>
              Tòa:{" "}
              {selectedUser.department
                ? selectedUser.department
                : "Chưa có thông tin"}
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
          </div>
        </div>
      )}

      {editUser && (
        <div className={styles["modal"]}>
          <div className={styles["modal-content"]}>
            <span className={styles["close"]} onClick={closeEditModal}>
              &times;
            </span>
            <h3>Chỉnh sửa thông tin phòng</h3>
            <label>
              Phòng:
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
              />
            </label>
            <label>
              Giường:
              <input
                type="text"
                value={bedInput}
                onChange={(e) => setBedInput(e.target.value)}
              />
            </label>
            <button onClick={saveChanges}>Lưu thay đổi</button>
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

export default UserManagement;
