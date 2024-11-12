import styles from "./Report.module.css";
import { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const Report = () => {
  const [reportList, setReportList] = useState([]); // Danh sách yêu cầu
  const [staffList, setStaffList] = useState([]); // Danh sách nhân viên
  const [roomsList, setRoomsList] = useState([]); // Danh sách phòng
  const [filteredReportList, setFilteredReportList] = useState([]); // Danh sách yêu cầu đã lọc
  const [selectedReportToView, setSelectedReportToView] = useState(null); // Yêu cầu đang được xem
  const [newReportStaff, setNewReportStaff] = useState(""); // Nhân viên
  const [ReportStaff, setReportStaff] = useState(""); // Nhân viên
  const [suggestionsStaff, setSuggestionsStaff] = useState([]);
  const [ShowSuggestionsStaff, setShowSuggestionsStaff] = useState(false);
  const [suggestionsRoom, setSuggestionsRoom] = useState([]);
  const [ShowSuggestionsRoom, setShowSuggestionsRoom] = useState(false);
  const [newReportTime, setNewReportTime] = useState(""); // Thời hạn
  const [newReportRoom, setNewReportRoom] = useState("");
  const [ReportRoom, setReportRoom] = useState("");
  const [newReportTitle, setNewReportTitle] = useState(""); // Tiêu đề yêu cầu mới
  const [newReportContent, setNewReportContent] = useState(""); // Nội dung yêu cầu mới
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái modal
  const [searchTitle, setSearchTitle] = useState(""); // Tiêu đề để lọc
  const [sortOrder, setSortOrder] = useState("desc"); // Trạng thái sắp xếp: desc là mới nhất, asc là cũ nhất
  const [currentPage, setCurrentPage] = useState(1);

  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7); // Điều chỉnh về UTC+7

  const token = JSON.parse(localStorage.getItem("token"));
  const user = verifyAccessToken(token); // Lấy thông tin người dùng từ token

  const suggestionsRefStaff = useRef(null);
  const suggestionsRefRoom = useRef(null);

  const reportsPerPage = 9;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const uniqueType = [...new Set(reportList.map((type) => type.title))];

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;

  // Fetch danh sách yêu cầu khi component mount
  useEffect(() => {
    const fetchReportList = async () => {
      try {
        const response = await axios.get("/reports");
        if (response.status !== 200) {
          throw new Error("Không thể lấy danh sách yêu cầu");
        }
        setStaffList(response.data.data.staffs);
        setRoomsList(response.data.data.rooms);
        // Lọc yêu cầu theo user_id từ token
        const userReports = response.data.data.reportsInfo.filter(
          (report) => report.user_id === user.id
        );

        setReportList(userReports);
        setFilteredReportList(userReports); // Đặt danh sách đã lọc ban đầu là danh sách yêu cầu của người dùng
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu:", error);
      }
    };
    fetchReportList();
  }, [user.id]);

  // Lọc và sắp xếp danh sách yêu cầu theo tiêu đề và thứ tự thời gian
  const filterReports = () => {
    let filtered = reportList
      .filter((report) =>
        report.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
      .filter((report) => report.status != 2 && report.status != 3);

    // Sắp xếp theo created_at
    filtered = filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

    setFilteredReportList(filtered);
  };

  useEffect(() => {
    filterReports(); // Gọi hàm lọc khi tiêu đề tìm kiếm hoặc thứ tự sắp xếp thay đổi
  }, [searchTitle, reportList, sortOrder]);

  const currentFilteredReports = filteredReportList.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredReportList.length / reportsPerPage);

  // Xem chi tiết yêu cầu
  const viewDetail = (report) => {
    setSelectedReportToView(report);
  };

  // Quay lại danh sách yêu cầu
  const goBack = () => setSelectedReportToView(null);

  // Tạo yêu cầu mới
  const addReport = async (reportList) => {
    //const now = new Date();

    // Lọc yêu cầu trong ngày
    // const reportsToday = reportList.filter((report) => {
    //   const createdAt = new Date(report.created_at);
    //   createdAt.setHours(createdAt.getHours() - 7);
    //   return createdAt.toDateString() == now.toDateString();
    // });

    // // Lấy report.created_at cuối cùng và gán cho lastReportTime
    // const lastReportTime = reportsToday.reduce((latest, report) => {
    //   const createdAt = new Date(report.created_at);
    //   createdAt.setHours(createdAt.getHours() - 7);
    //   return createdAt > latest ? createdAt : latest;
    // }, new Date(0)); // Khởi tạo với thời gian "không" (epoch time)

    // // Tính toán thời gian chênh lệch
    // const diffInMinutes = lastReportTime
    //   ? Math.floor((now - lastReportTime) / 60000) // Thời gian tính bằng phút
    //   : 0;

    // // Cập nhật số lần yêu cầu
    // const reportCount = reportsToday.length;

    // if (reportCount >= 10) {
    //   toast.error("Bạn đã đạt giới hạn 10 yêu cầu trong ngày.");
    //   return;
    // }

    // if (reportCount === 2 && diffInMinutes < 5) {
    //   toast.error("Vui lòng chờ 5 phút trước khi tạo yêu cầu tiếp theo.");
    //   return;
    // }

    // if (reportCount === 3 && diffInMinutes < 15) {
    //   toast.error("Vui lòng chờ 15 phút trước khi tạo yêu cầu tiếp theo.");
    //   return;
    // }

    // if (reportCount === 4 && diffInMinutes < 30) {
    //   toast.error("Vui lòng chờ 30 phút trước khi tạo yêu cầu tiếp theo.");
    //   return;
    // }

    // if (reportCount > 4 && diffInMinutes < 30) {
    //   toast.error("Vui lòng chờ 30 phút trước khi tạo yêu cầu tiếp theo.");
    //   return;
    // }

    if (
      !newReportTitle &&
      !newReportContent &&
      !ReportStaff &&
      !ReportRoom &&
      !newReportTime
    ) {
      toast.error("Vui lòng điền tất cả các trường!");
      return;
    }

    if (!newReportTitle) {
      toast.error("Vui lòng chọn loại yêu cầu!");
      return;
    }

    if (!ReportStaff) {
      toast.error("Vui lòng chọn nhân viên!");
      return;
    }

    console.log(ReportStaff, staffList );

    if (!newReportTime) {
      toast.error("Vui lòng chọn thời hạn!");
      return;
    }

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    if (newReportTime <= formattedToday) {
      toast.error("Vui lòng chọn lại thời hạn!");
      return;
    }

    if (!ReportRoom) {
      toast.error("Vui lòng chọn phòng!");
      return;
    }

    if (!newReportContent) {
      toast.error("Vui lòng điền nội dung yêu cầu!");
      return;
    }
    try {
      const response = await axios.post("/reports", {
        title: newReportTitle,
        content: newReportContent,
        user_id: user.id,
        staff_id: ReportStaff,
        room_id: ReportRoom,
        expired_at: newReportTime,
        created_at: currentDate,
        updated_at: currentDate,
      });

      if (response.status === 200) {
        toast.success("Yêu cầu đã được tạo thành công!");
        const staff = staffList.find((staff) => staff.id == ReportStaff);
        const StaffEmail = staff ? staff.email : null;

        const newReport = {
          id: response.data.data.reportId,
          title: newReportTitle,
          content: newReportContent,
          user_id: user.id,
          staff_email: StaffEmail,
          expired_at: newReportTime,
          created_at: currentDate,
          updated_at: currentDate,
        };
        setReportList([...reportList, newReport]);
      }

      resetForm(); // Đặt lại form
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi tạo yêu cầu:", error);
      toast.error("Lỗi khi tạo yêu cầu");
    }
  };

  // Hàm xử lý khi chọn thời hạn
  const handleTimeChange = (e) => {
    const selectedDate = e.target.value;
    setNewReportTime(selectedDate); // Cập nhật giá trị ngày đã chọn
  };

  // Đặt lại form sau khi tạo/chỉnh sửa yêu cầu
  const resetForm = () => {
    setNewReportTitle("");
    setNewReportContent("");
    setNewReportStaff("");
    setNewReportTime("");
    setNewReportRoom("");
    setReportStaff("");
    setReportRoom("");
    setIsModalOpen(false);
  };

  const getRandomStaff = () => {
    const staff = [...staffList];
    const randomStaff = [];

    for (let i = 0; i < 5 && staff.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * staff.length);
      randomStaff.push(staff.splice(randomIndex, 1)[0]);
    }

    return randomStaff;
  };

  const handleInputStaffClick = () => {
    if (newReportStaff.trim() === "") {
      setSuggestionsStaff(getRandomStaff());
    }
    setShowSuggestionsStaff(true); // Hiển thị gợi ý khi click vào ô nhân viên
  };

  const handleInputRoomClick = () => {
    if (newReportRoom.trim() === "") {
      setSuggestionsRoom(roomsList);
    }
    setShowSuggestionsRoom(true); // Hiển thị gợi ý khi click vào ô phòng
  };

  const handleInputStaffChange = (e) => {
    const inputValue = e.target.value;
    setNewReportStaff(inputValue);

    if (inputValue.trim() === "") {
      setSuggestionsStaff(getRandomStaff());
    } else {
      const filteredStaff = staffList.filter(
        (staff) =>
          staff.fullname.toLowerCase().includes(inputValue.toLowerCase()) ||
          staff.email.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestionsStaff(filteredStaff);
    }
    setShowSuggestionsStaff(true); // Hiển thị gợi ý khi nhập liệu
  };

  const handleInputRoomChange = (e) => {
    const inputValue = e.target.value;
    setNewReportRoom(inputValue);

    if (inputValue.trim() == "") {
      setSuggestionsRoom(roomsList);
    } else {
      const filteredRoom = roomsList.filter((room) =>
        room.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestionsRoom(filteredRoom);
    }
    setShowSuggestionsRoom(true);
  };

  // Ẩn gợi ý sau khi chọn
  const handleSelectSuggestionStaff = (staff) => {
    setNewReportStaff(`${staff.fullname} - ${staff.email}`);
    setReportStaff(staff.id);
    setShowSuggestionsStaff(false);
  };

  const handleSelectSuggestionRoom = (room) => {
    setNewReportRoom(`${room.name}`);
    setReportRoom(room.id);
    setShowSuggestionsRoom(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRefStaff.current &&
        !suggestionsRefStaff.current.contains(event.target)
      ) {
        setShowSuggestionsStaff(false);
      }

      // Chỉ ẩn gợi ý của Room nếu click ra ngoài ô Room, không ẩn gợi ý Staff
      if (
        suggestionsRefRoom.current &&
        !suggestionsRefRoom.current.contains(event.target)
      ) {
        setShowSuggestionsRoom(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles["report-manager-section"]}>
      {selectedReportToView ? (
        <div className={styles["detail-view"]}>
          <h1>{selectedReportToView.title}</h1>
          <div className={styles["info-report"]}>
            <button className={styles["back-button"]} onClick={goBack}>
              Quay lại danh sách yêu cầu
            </button>
            {selectedReportToView.staff_fullname && (
              <p>Người xử lý: {selectedReportToView.staff_fullname}</p>
            )}
          </div>
          <p>{selectedReportToView.content}</p>
        </div>
      ) : (
        <>
          <h2 className={styles["title"]}>Yêu cầu</h2>
          <div className={styles["filter-section"]}>
            <div className={styles["inputGroup"]}>
              <button onClick={() => setIsModalOpen(true)}>Tạo yêu cầu</button>
            </div>
            <div className={styles["inputGroup"]}>
            <select
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              >
                <option value="">Chọn tiêu đề</option>
                {uniqueType.map((title, index) => (
                  <option key={index} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>

          {isModalOpen && (
            <>
              <div className={styles.overlay} onClick={resetForm} />
              <div className={styles["add-report-modal"]}>
                <button className={styles["close-button"]} onClick={resetForm}>
                  Đóng
                </button>
                <select
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  className={styles["select"]}
                >
                  <option value="" disabled>
                    Chọn tiêu đề
                  </option>
                  <option value="Yêu cầu kiểm tra phòng">
                    Yêu cầu kiểm tra phòng
                  </option>
                  <option value="Yêu cầu dọn phòng">Yêu cầu dọn phòng</option>
                  <option value="Yêu cầu khác">Yêu cầu khác</option>
                </select>
                <div className={styles["selected-input"]}>
                  <div ref={suggestionsRefStaff}>
                    <input
                      placeholder="Chọn nhân viên"
                      value={newReportStaff}
                      onClick={handleInputStaffClick} // Hiển thị gợi ý khi click
                      onChange={handleInputStaffChange} // Cập nhật gợi ý khi thay đổi
                    />
                    {ShowSuggestionsStaff && (
                      <div className={styles["suggestionsStaff"]}>
                        {suggestionsStaff.map((staff) => (
                          <p
                            key={staff.id}
                            value={staff.id}
                            onClick={() => handleSelectSuggestionStaff(staff)} // Chọn nhân viên
                            className="suggestion-item"
                          >
                            {staff.fullname} - {staff.email}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="date"
                      value={newReportTime}
                      onChange={handleTimeChange}
                    />
                  </div>
                  <div ref={suggestionsRefRoom}>
                    <input
                      placeholder="Chọn phòng"
                      value={newReportRoom}
                      onClick={handleInputRoomClick} // Hiển thị gợi ý khi click
                      onChange={handleInputRoomChange} // Cập nhật gợi ý khi thay đổi
                    />
                    {ShowSuggestionsRoom && (
                      <div className={styles["suggestionsRoom"]}>
                        {suggestionsRoom.map((room) => (
                          <p
                            key={room.id}
                            value={room.id}
                            onClick={() => handleSelectSuggestionRoom(room)} // Chọn phòng
                            className="suggestion-item"
                          >
                            {room.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  placeholder="Nội dung"
                  value={newReportContent}
                  onChange={(e) => setNewReportContent(e.target.value)}
                />
                <button onClick={() => addReport(reportList)}>
                  Tạo yêu cầu
                </button>
              </div>
            </>
          )}

          {currentFilteredReports.length === 0 ? (
            <p>Hiện tại bạn đang không có yêu cầu nào</p>
          ) : (
            <>
              <table className={styles["report-table"]}>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Ngày tạo</th>
                    <th>Hạn xử lý</th>
                    <th>Người xử lý</th>
                    <th>Chức năng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFilteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.title}</td>
                      <td>
                        {new Date(report.created_at)
                          .toLocaleString("vi-VN", {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                          .replace("lúc ", "")}
                      </td>
                      <td>
                        {new Date(report.expired_at)
                          .toLocaleString("vi-VN", {
                            timeZone: "UTC",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          .replace("lúc ", "")}
                      </td>
                      <td>{report.staff_email}</td>
                      <td className={styles["view-table"]}>
                        <button onClick={() => viewDetail(report)}>Xem</button>
                      </td>
                      <td className={styles["status-table"]}>
                        {report.status == 3 ? (
                          <span>Từ chối</span>
                        ) : report.status == 2 ? (
                          <span>Đồng ý</span>
                        ) : report.status == 1 ? (
                          <span>Đang xử lý</span>
                        ) : (
                          <span>Chờ xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{" "}
              {totalPages > 1 && (
                <MyPagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={onPageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Report;
