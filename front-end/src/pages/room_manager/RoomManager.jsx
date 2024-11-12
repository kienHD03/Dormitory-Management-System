import { useEffect, useState } from "react";
import styles from "./RoomManager.module.css";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import MyPagination from "../../components/Pagination/MyPagination";

const RoomManager = () => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterType, setFilterType] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoomPeople, setSelectedRoomPeople] = useState([]);

  const usersPerPage = 10;

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/rooms");
      if (response.status === 200) {
        const { departments, mergedRooms } = response.data.data;
        const roomsData = mergedRooms.map((room) => ({
          id: room.id,
          name: room.room,
          type: room.room_type,
          gender: room.gender,
          capacity: room.capacity,
          price: room.price * 4,
          status: room.people_count < room.capacity ? "available" : "full",
          building: room.department,
          people: room.people,
          expiredAt: room.room_expired_date,
        }));
        setBuildings(departments);
        setRooms(roomsData);
      } else {
        toast.error("Error fetching room data");
      }
    } catch (error) {
      console.error("Fetch rooms error:", error);
      toast.error("Error fetching room data");
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await axios.get("/rooms/types");
      console.log(response.data.data);
      if (response.status === 200) {
        setRoomTypes(response.data.data);
      } else {
        toast.error("Error fetching room types");
      }
    } catch (error) {
      console.error("Fetch room types error:", error);
      toast.error("Error fetching room types");
    }
  };

  const handleShowDateModal = () => setShowDateModal(true);
  const handleHideDateModal = () => setShowDateModal(false);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleConfirmDate = async () => {
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate).setHours(0, 0, 0, 0);

    if (selected < currentDate) {
      toast.error("Thời gian hết hạn phải lớn hơn hoặc bằng thời gian hiện tại");
      return;
    }
    try {
      const response = await axios.put("/rooms/expired-date", { expiredDate: selectedDate });
      if (response.status === 200) {
        toast.success("Cập nhật thời gian hết hạn thành công");
        setRooms((prev) =>
          prev.map((room) => ({
            ...room,
            expiredAt: selectedDate,
          }))
        );
        setShowDateModal(false);
      } else {
        toast.error("Cập nhật thời gian hết hạn thất bại");
      }
    } catch (error) {
      toast.error("Cập nhật thời gian hết hạn thất bại");
    }
  };

  const handleViewInfo = (people) => {
    const sortedPeople =
      (people[0].bed &&
        [...people].sort((a, b) => {
          const bedA = +a.bed.slice(-1);
          const bedB = +b.bed.slice(-1);

          return bedA - bedB;
        })) ||
      [];
    setSelectedRoomPeople(sortedPeople);
    setShowPeopleModal(true);
  };

  const handleClosePeopleModal = () => {
    setShowPeopleModal(false);
    setSelectedRoomPeople([]);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
      (filterBuilding === "" || room.building === filterBuilding) &&
      (filterType === "" || room.type === filterType)
  );

  const totalPages = Math.ceil(filteredRooms.length / usersPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const uniqueRoomTypes = Array.from(new Set(roomTypes.map((type) => type.name))).map((name) =>
    roomTypes.find((type) => type.name === name)
  );

  return (
    <div className={styles.container}>
      <h2>Quản lý phòng</h2>

      <div className={styles.actions}>
        <input
          type="text"
          placeholder="Tìm kiếm phòng"
          className={styles.searchInput}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <select
          className={styles.select}
          value={filterBuilding}
          onChange={(e) => setFilterBuilding(e.target.value)}
        >
          <option value="">Chọn tòa nhà</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.name}>
              {building.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Chọn loại phòng</option>
          {uniqueRoomTypes.map((type) => (
            <option key={type.id} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>

        <button className={styles.addButton} onClick={handleShowDateModal}>
          Chọn thời gian hết hạn phòng
        </button>
      </div>

      {showDateModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Chọn thời gian hết hạn</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={styles.input}
            />
            <button className={styles.confirmButton} onClick={handleConfirmDate}>
              Xác nhận
            </button>
            <button className={styles.cancelButton} onClick={handleHideDateModal}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {showPeopleModal && (
        <div className={styles.overlay}>
          <div className={styles.modalRoom}>
            <h2>Người trong phòng</h2>
            {selectedRoomPeople.length > 0 ? (
              <table className={styles.peopleTable}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Giường</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRoomPeople.map((person, index) => (
                    <tr key={index}>
                      <td>{person.email}</td>
                      <td>{person.bed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Hiện trong phòng không có người nào đang ở</p>
            )}

            <button className="btn btn-danger mt-2" onClick={handleClosePeopleModal}>
              Đóng
            </button>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>tên phòng</th>
            <th>Loại phòng</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Tòa nhà</th>
            <th>Ngày hết hạn</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginatedRooms.map((room) => (
            <tr key={room.id}>
              <td>{room.name}</td>
              <td>{room.type}</td>
              <td>{room.price}</td>
              <td>{room.status === "available" ? "Còn trống" : "Đã đầy"}</td>
              <td>{room.building}</td>
              <td>{toLocaleData(room.expiredAt)}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handleViewInfo(room.people)}>
                  Xem thông tin
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default RoomManager;
