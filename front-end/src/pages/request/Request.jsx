import styles from "./Request.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const Request = () => {
  const [requestList, setRequestList] = useState([]); // Danh sách yêu cầu
  const [roomsInfo, setRoomsInfo] = useState([]);
  const [filteredRequestList, setFilteredRequestList] = useState([]); // Danh sách yêu cầu đã lọc
  const [selectedRequestToView, setSelectedRequestToView] = useState(null); // Yêu cầu đang được xem
  const [newRequestTitle, setNewRequestTitle] = useState(""); // Tiêu đề yêu cầu mới
  const [newRequestContent, setNewRequestContent] = useState(""); // Nội dung yêu cầu mới
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái modal
  const [searchTitle, setSearchTitle] = useState(""); // Tiêu đề để lọc
  const [sortOrder, setSortOrder] = useState("desc"); // Trạng thái sắp xếp: desc là mới nhất, asc là cũ nhất
  const [currentPage, setCurrentPage] = useState(1);

  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7); // Điều chỉnh về UTC+7

  const token = JSON.parse(localStorage.getItem("token"));
  const user = verifyAccessToken(token); // Lấy thông tin người dùng từ token

  const requestsPerPage = 9;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;

  // Fetch danh sách yêu cầu khi component mount
  useEffect(() => {
    const fetchRequestList = async () => {
      try {
        const response = await axios.get("/requests");
        if (response.status !== 200) {
          throw new Error("Không thể lấy danh sách yêu cầu");
        }
        // Lọc yêu cầu theo user_id từ token
        setRoomsInfo(response.data.data.rooms);
        console.log(response.data.data.requests);
        const userRequests = response.data.data.requests.filter(
          (request) => request.user_id === user.id
        );
        setRequestList(userRequests);
        setFilteredRequestList(userRequests); // Đặt danh sách đã lọc ban đầu là danh sách yêu cầu của người dùng
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu:", error);
      }
    };
    fetchRequestList();
  }, [user.id]);

  const filterRequests = () => {
    let filtered = requestList.filter((request) =>
      request.title.toLowerCase().includes(searchTitle.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
      if (sortOrder === "desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

    setFilteredRequestList(filtered);
  };

  useEffect(() => {
    filterRequests(); // Gọi hàm lọc khi tiêu đề tìm kiếm hoặc thứ tự sắp xếp thay đổi
  }, [searchTitle, requestList, sortOrder]);

  const currentFilteredRequests = filteredRequestList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequestList.length / requestsPerPage);

  // Xem chi tiết yêu cầu
  const viewDetail = (request) => {
    setSelectedRequestToView(request);
  };

  // Quay lại danh sách yêu cầu
  const goBack = () => setSelectedRequestToView(null);

  // Tạo yêu cầu mới
  const addRequest = async (requestList) => {
    const now = new Date();

    // Lọc yêu cầu trong ngày
    const requestsToday = requestList.filter((request) => {
      const createdAt = new Date(request.created_at);
      createdAt.setHours(createdAt.getHours() - 7);
      return createdAt.toDateString() == now.toDateString();
    });

    // Lấy request.created_at cuối cùng và gán cho lastRequestTime
    const lastRequestTime = requestsToday.reduce((latest, request) => {
      const createdAt = new Date(request.created_at);
      createdAt.setHours(createdAt.getHours() - 7);
      return createdAt > latest ? createdAt : latest;
    }, new Date(0)); // Khởi tạo với thời gian "không" (epoch time)

    // Tính toán thời gian chênh lệch
    const diffInMinutes = lastRequestTime
      ? Math.floor((now - lastRequestTime) / 60000) // Thời gian tính bằng phút
      : 0;

    // Cập nhật số lần yêu cầu
    const requestCount = requestsToday.length;

    if (requestCount >= 5) {
      toast.error("Bạn đã đạt giới hạn 5 yêu cầu trong ngày.");
      return;
    }

    if (requestCount === 2 && diffInMinutes < 5) {
      toast.error("Vui lòng chờ 5 phút trước khi tạo yêu cầu tiếp theo.");
      return;
    }

    if (requestCount === 3 && diffInMinutes < 15) {
      toast.error("Vui lòng chờ 15 phút trước khi tạo yêu cầu tiếp theo.");
      return;
    }

    if (requestCount === 4 && diffInMinutes < 30) {
      toast.error("Vui lòng chờ 30 phút trước khi tạo yêu cầu tiếp theo.");
      return;
    }

    if (!newRequestTitle || !newRequestContent) {
      toast.error("Vui lòng điền tất cả các trường!");
      return;
    }

    try {
      const response = await axios.post("/requests", {
        title: newRequestTitle,
        content: newRequestContent,
        user_id: user.id,
        room_id: roomsInfo.find((room) => room.name === user.room)?.id || null,
        created_at: currentDate,
        updated_at: currentDate,
      });

      if (response.status === 200) {
        toast.success("Yêu cầu đã được tạo thành công!");
        const newRequest = {
          id: response.data.data.requestId,
          title: newRequestTitle,
          content: newRequestContent,
          user_id: user.id,
          created_at: currentDate,
          updated_at: currentDate,
        };
        setRequestList([...requestList, newRequest]);
      }

      resetForm(); // Đặt lại form
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.log(user);
      console.error("Lỗi khi tạo yêu cầu:", error);
      toast.error("Lỗi khi tạo yêu cầu");
    }
  };

  // Đặt lại form sau khi tạo/chỉnh sửa yêu cầu
  const resetForm = () => {
    setNewRequestTitle("");
    setNewRequestContent("");
    setIsModalOpen(false);
  };

  return (
    <div className={styles["request-manager-section"]}>
      {selectedRequestToView ? (
        <div className={styles["detail-view"]}>
          <h1>{selectedRequestToView.title}</h1>
          <button className={styles["back-button"]} onClick={goBack}>
            Quay lại danh sách yêu cầu
          </button>
          <p>{selectedRequestToView.content}</p>
        </div>
      ) : (
        <>
          <h2 className={styles["title"]}>Yêu cầu</h2>
          <div className={styles["filter-section"]}>
            <div className={styles["inputGroup"]}>
              <button onClick={() => setIsModalOpen(true)}>Tạo yêu cầu</button>
            </div>
            <div className={styles["inputGroup"]}>
              <select value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)}>
                <option value="">Chọn tiêu đề</option>
                <option value="Yêu cầu gia hạn phòng">Yêu cầu gia hạn phòng</option>
                <option value="Yêu cầu sửa chữa phòng">Yêu cầu sửa chữa phòng</option>
                <option value="Yêu cầu hủy phòng">Yêu cầu hủy phòng</option>
                <option value="Yêu cầu khác">Yêu cầu khác</option>
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>

          {isModalOpen && (
            <>
              <div className={styles.overlay} onClick={resetForm} />
              <div className={styles["add-request-modal"]}>
                <button className={styles["close-button"]} onClick={resetForm}>
                  Đóng
                </button>
                <select
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                  className={styles["select"]}
                >
                  <option value="" disabled>
                    Chọn tiêu đề
                  </option>
                  <option value="Yêu cầu gia hạn phòng">Yêu cầu gia hạn phòng</option>
                  <option value="Yêu cầu sửa chữa phòng">Yêu cầu sửa chữa phòng</option>
                  <option value="Yêu cầu hủy phòng">Yêu cầu hủy phòng</option>
                  <option value="Yêu cầu khác">Yêu cầu khác</option>
                </select>
                <textarea
                  placeholder="Nội dung"
                  value={newRequestContent}
                  onChange={(e) => setNewRequestContent(e.target.value)}
                />
                <button onClick={() => addRequest(requestList)}>Tạo yêu cầu</button>
              </div>
            </>
          )}

          {currentFilteredRequests.length === 0 ? (
            <p>Hiện tại bạn đang không có yêu cầu nào</p>
          ) : (
            <>
              <table className={styles["request-table"]}>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Ngày tạo</th>
                    <th>Ngày cập nhật</th>
                    <th>Chức năng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFilteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td>{request.title}</td>
                      <td>
                        {new Date(request.created_at)
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
                        {new Date(request.updated_at)
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
                      <td className={styles["view-table"]}>
                        <button onClick={() => viewDetail(request)}>Xem</button>
                      </td>
                      <td className={styles["status-table"]}>
                        {request.status == 3 ? (
                          <span>Từ chối</span>
                        ) : request.status == 2 ? (
                          <span>Đồng ý</span>
                        ) : request.status == 1 ? (
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

export default Request;
