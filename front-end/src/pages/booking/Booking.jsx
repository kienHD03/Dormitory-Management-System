import styles from "./Booking.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import Payment from "../payment/Payment";
import { useNavigate } from "react-router-dom";
import MyPagination from "../../components/Pagination/MyPagination";

const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [buildings, setBuildings] = useState([]);
  const [beds, setBeds] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);

  const [currentRoom, setCurrentRoom] = useState({});
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);

  const roomsPerPage = 10;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLast = currentPage * roomsPerPage;
  const indexOfFirst = indexOfLast - roomsPerPage;

  const navigate = useNavigate();

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const getRooms = async () => {
    try {
      const response = await axios.get("/rooms");
      if (response.status !== 200) {
        toast.error("Lỗi khi lấy dữ liệu phòng");
        return;
      }

      const departments = response.data.data.departments;
      const mergedRooms = response.data.data.mergedRooms;
      const beds = response.data.data.beds;
      const newRooms = mergedRooms.map((room) => {
        return {
          id: room.id,
          room: room.room,
          room_type: room.room_type,
          gender: room.gender,
          capacity: room.capacity,
          price: room.price,
          status: room.people_count < room.capacity ? "available" : "full",
          department: room.department,
          people: room.people,
          expired_at: room.room_expired_date,
        };
      });
      const newRoomsFiltered = newRooms.filter((room) => room.status !== "full");
      setBuildings(departments);
      setBeds(beds);

      const token = JSON.parse(localStorage.getItem("token"));
      const user = verifyAccessToken(token);
      if (user.gender) {
        const filteredRoom = newRoomsFiltered.filter((room) => user.gender === room.gender);
        setRooms(filteredRoom);
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi lấy dữ liệu");
    }
  };

  const createResidentHistory = async ({ userId, roomId, bedId, expired_at }) => {
    try {
      const response = await axios.post("/users/resident-history", {
        userId,
        roomId,
        bedId,
        description: "Đặt phòng",
        expiredAt: expired_at,
      });
      console.log(response);
      if (response.status !== 200) {
        toast.error("Đã có lỗi xảy ra khi tạo lịch sử cư trú");
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createInvoice = async ({ email, price }) => {
    try {
      const currentTimeUTC = new Date();
      const timezoneOffset = 7;
      const currentTimeGMT7 = new Date(currentTimeUTC.getTime() + timezoneOffset * 60 * 60 * 1000);
      const response = await axios.post("/invoice", {
        email,
        amount: price,
        type: "Đặt phòng",
        description: "Thanh toán phòng",
        status: "Đã thanh toán",
        updateDate: currentTimeGMT7,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const createBooking = async ({ userId, roomId, bedId, expired_at }) => {
    try {
      const response = await axios.post("/rooms/booking", {
        userId,
        roomId,
        bedId,
        expiredAt: expired_at,
      });
      console.log(response);
      if (response.status !== 200) {
        toast.error("Đã có lỗi xảy ra khi đặt phòng");
        return;
      }
      const data = response.data.data;
      const { accessToken } = data;
      localStorage.setItem("token", JSON.stringify(accessToken));
      toast.success("Đặt phòng thành công");
      navigate("/student/profile");
      setShowQRCode(false);
    } catch (error) {
      console.log(error);
      setShowQRCode(false);
      getRooms();
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    createInvoice(paymentData);
    createResidentHistory(paymentData);
    createBooking(paymentData);
  };

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    const user = verifyAccessToken(token);
    setUserId(user.id);
    if (!selectedRoom) return;
    const firstAvailableBed = beds.slice(0, selectedRoom.capacity).find((bed) => {
      return !selectedRoom.people.some((person) => person.bed === bed.name);
    });

    if (firstAvailableBed) {
      setSelectedBedId(firstAvailableBed.id);
    }
  }, [beds, selectedRoom]);

  const handleBedChange = (event) => {
    const selectedBedId = event.target.value;
    setSelectedBedId(selectedBedId);
  };

  const handleCancel = () => {
    setShowQRCode(false);
  };

  useEffect(() => {
    try {
      getRooms();
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi lấy dữ liệu");
    }
  }, []);

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter((room) =>
        room.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBuilding !== "all") {
      filtered = filtered.filter((room) => room.department === selectedBuilding);
    }

    setFilteredRooms(filtered);
  };

  useEffect(() => {
    filterRooms();
  }, [searchTerm, selectedBuilding, rooms]);

  const currentFilteredRooms = filteredRooms.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handleBooking = (room) => {
    if (room.status !== "full") {
      setSelectedRoom(room);
      setCurrentRoom(room);
      setShowConfirm(true);
    } else {
      toast.error("Phòng đã đầy, vui lòng chọn phòng khác.");
    }
  };

  const handleConfirmBooking = () => {
    setShowConfirm(false);
    setSelectedRoom(null);
    setShowQRCode(true);
    setCurrentRoom(selectedRoom);
    setData({
      roomId: currentRoom.id,
      bedId: selectedBedId,
      price: currentRoom.price * 4,
      userId,
      roomName: currentRoom.room,
      expired_at: currentRoom.expired_at,
      email: verifyAccessToken(JSON.parse(localStorage.getItem("token"))).email,
    });
  };

  const handleShowDetail = (room) => {
    setSelectedRoom(room);
    setShowDetail(true);
    setCurrentRoom(room);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedRoom(null);
  };

  const handleBookingTest = (paymentData) => {
    createInvoice(paymentData);
    createResidentHistory(paymentData);
    createBooking(paymentData);
  };

  return (
    <div className={styles["booking-wrapper"]}>
      <div className={styles["booking-section"]}>
        <h1>Trang Đặt Phòng</h1>
        <p>Chọn phòng và xác nhận để đặt phòng.</p>

        <div className={styles["search-container"]}>
          <input
            type="text"
            placeholder="Tìm kiếm phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles["search-input"]}
          />

          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className={styles["building-select"]}
          >
            <option value="all">Tất cả các tòa</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.name}>
                Tòa {building.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles["room-container"]}>
          {currentFilteredRooms.length > 0 ? (
            currentFilteredRooms.map((room) => (
              <div className={styles["room-card"]} key={room.id}>
                <h3>{room.room}</h3>
                <p>Giá: {(room.price * 4).toLocaleString()} VND</p>
                <p>Trạng thái: {room.status === "full" ? "Đã đầy" : "Còn trống"}</p>
                <p>Tòa: {room.department}</p>
                <button
                  className={styles["button-booking"]}
                  onClick={() => handleBooking(room)}
                  disabled={room.status === "full"}
                >
                  Đặt Phòng
                </button>
                <button className={styles["button-details"]} onClick={() => handleShowDetail(room)}>
                  Xem Chi Tiết
                </button>
              </div>
            ))
          ) : (
            <p>Không có phòng phù hợp.</p>
          )}
        </div>
        {showConfirm && selectedRoom && (
          <div className={styles["confirm-modal"]}>
            <div className={styles["confirm-content"]}>
              <h2>Chi Tiết Phòng: {selectedRoom.name}</h2>
              <p>Giá: {(selectedRoom.price * 4).toLocaleString()} VND (4 tháng)</p>
              <p>Trạng thái: {selectedRoom.status === "full" ? "Đã đầy" : "Còn trống"}</p>
              <p>Loại phòng: {selectedRoom.room_type}</p>
              <p>Tầng: {selectedRoom.room.split("")[1]}</p>
              <p>Tòa nhà: {selectedRoom.department}</p>
              <p>Ngày kết thúc: {toLocaleData(selectedRoom.expired_at)}</p>
              <label htmlFor="bedSelect">Chọn giường:</label>
              <select id="bedSelect" onChange={handleBedChange} className="form-control">
                {beds.slice(0, selectedRoom.capacity).map((bed, index) => {
                  const isBedTaken = selectedRoom.people.some((person) => person.bed === bed.name);
                  return (
                    !isBedTaken && (
                      <option key={index} value={bed.id} disabled={isBedTaken}>
                        {bed.name} {isBedTaken ? "(Đã đặt)" : ""}
                      </option>
                    )
                  );
                })}
              </select>
              <p>Bạn có chắc muốn đặt phòng {selectedRoom.name}?</p>
              {/* <button className={styles["confirm-button"]} onClick={handleConfirmBooking}>
                Xác Nhận Đặt Phòng
              </button> */}
              <button
                className={styles["confirm-button"]}
                onClick={() =>
                  handleBookingTest({
                    ...currentRoom,
                    roomName: currentRoom.room,
                    email: verifyAccessToken(JSON.parse(localStorage.getItem("token"))).email,
                    price: currentRoom.price * 4,
                    roomId: currentRoom.id,
                    bedId: selectedBedId,
                    userId,
                  })
                }
              >
                Xác Nhận Đặt Phòng
              </button>
              <button className={styles["close-button"]} onClick={() => setShowConfirm(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
        {showDetail && selectedRoom && (
          <div className={styles["detail-modal"]}>
            <div className={styles["detail-content"]}>
              <h2>Chi Tiết Phòng: {selectedRoom.name}</h2>
              <p>Giá: {(selectedRoom.price * 4).toLocaleString()} VND (4 tháng)</p>
              <p>Trạng thái: {selectedRoom.status === "full" ? "Đã đầy" : "Còn trống"}</p>
              <p>Loại phòng: {selectedRoom.room_type}</p>
              <p>Tầng: {selectedRoom.room.split("")[1]}</p>
              <p>Tòa nhà: {selectedRoom.department}</p>
              <p>Ngày kết thúc: {toLocaleData(selectedRoom.expired_at)}</p>
              <button className={styles["close-button"]} onClick={handleCloseDetail}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
      {showQRCode && (
        <Payment handleSuccess={handlePaymentSuccess} handleCancel={handleCancel} data={data} />
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

export default Booking;
