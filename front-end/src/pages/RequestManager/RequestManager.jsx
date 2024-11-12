import styles from "./RequestManager.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import MyPagination from "../../components/Pagination/MyPagination";

const RequestManager = () => {
  const [user, setUser] = useState({}); // Thông tin người dùng
  const [requestList, setRequestList] = useState([]); // Danh sách yêu cầu
  const [roomsInfo, setRoomsInfo] = useState([]);
  const [filteredRequestList, setFilteredRequestList] = useState([]); // Danh sách yêu cầu đã lọc
  const [selectedRequestToView, setSelectedRequestToView] = useState(null); // Yêu cầu đang xem
  const [searchContent, setSearchContent] = useState(""); // Tìm kiếm theo nội dung
  const [sortOrder, setSortOrder] = useState("newest"); // Thứ tự sắp xếp theo ngày
  const [statusFilter, setStatusFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [reply, setReply] = useState(""); // Reply cho yêu cầu
  const [currentPage, setCurrentPage] = useState(1);
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);

  const requestsPerPage = 9;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  console.log(user);

  const indexOfLast = currentPage * requestsPerPage;
  const indexOfFirst = indexOfLast - requestsPerPage;

  // Lấy danh sách yêu cầu khi component được mount
  useEffect(() => {
    const fetchRequestList = async () => {
      try {
        const response = await axios.get("/requests");
        if (response.status !== 200) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        setRoomsInfo(response.data.data.rooms);
        setRequestList(response.data.data.requests);
        setFilteredRequestList(response.data.data.requests); // Đặt danh sách đã lọc ban đầu bằng danh sách đầy đủ
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchRequestList();
  }, []);

  // Hàm lọc và sắp xếp danh sách yêu cầu
  const filterAndSortRequests = () => {
    let filtered = requestList.filter((request) => {
      // Lọc theo nội dung tìm kiếm
      return (
        request.title.toLowerCase().includes(searchContent.toLowerCase()) ||
        request.content.toLowerCase().includes(searchContent.toLowerCase()) ||
        request.fullname.toLowerCase().includes(searchContent.toLowerCase())
      );
    });

    // Lọc theo tiêu đề
    if (titleFilter) {
      filtered = filtered.filter((request) =>
        request.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (statusFilter) {
      filtered = filtered.filter((request) => {
        // Nếu chọn "Hoàn thành", bao gồm cả trạng thái 2 và 3
        if (statusFilter === "completed") {
          return request.status == 2 || request.status == 3;
        }
        // Kiểm tra trạng thái cụ thể
        return request.status.toString() == statusFilter;
      });
    }

    // Sắp xếp theo ngày tạo
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredRequestList(filtered);
  };

  useEffect(() => {
    filterAndSortRequests(); // Gọi hàm lọc và sắp xếp khi tiêu chí lọc hoặc danh sách yêu cầu thay đổi
  }, [searchContent, titleFilter, sortOrder, statusFilter, requestList]);

  const currentFilteredRequests = filteredRequestList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequestList.length / requestsPerPage);

  const getUserById = async (id) => {
    try {
      const response = await axios.get(`/users/${id}`);
      if (response.status === 200) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const createInvoice = async () => {
    try {
      const response = await axios.post("/invoice", {
        amount: user.room_price * 4,
        type: "Yêu cầu gia hạn phòng",
        description: "Gia hạn phòng",
        email: user.email,
        status: "Chưa thanh toán",
      });
      console.log(response);
      if (!response.status === 201) {
        console.log("Lỗi khi tạo hóa đơn");
      }
    } catch (error) {
      console.error("Lỗi khi tạo hóa đơn:", error);
    }
  };

  const deleteBooking = async () => {
    try {
      const response = await axios.delete(`/rooms/booking/${user.id}`);
      console.log(response);
      if (response.status === 200) {
        console.log("Hủy phòng thành công");
      }
    } catch (error) {
      console.error("Lỗi khi hủy phòng:", error);
      toast.error("Lỗi khi hủy phòng");
    }
  };
  // Chuyển đến chi tiết yêu cầu và cập nhật trạng thái

  const viewDetail = async (request) => {
    if (request.status == 0) {
      try {
        const requestId = request.id;

        const response = await axios.put(`/requests/${requestId}`, {
          status: 1,
          reply: "",
        });
        console.log(response);
        console.log("loi o day: ");
        if (response.status == 200) {
          toast.success("Cập nhật trạng thái thành công!");
          const updateRequest = {
            id: request.id,
            email: request.email,
            title: request.title,
            content: request.content,
            reply: "",
            status: 1,
            created_at: request.created_at,
            updated_at: currentDate,
          };
          setRequestList((prevList) => [
            ...prevList.filter((request) => request.id !== requestId),
            updateRequest,
          ]);
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    }
    getUserById(request.user_id);
    setSelectedRequestToView(request);
    setReply("");
  };

  // Quay lại danh sách yêu cầu
  const goBack = () => {
    setSelectedRequestToView(null);
    setReply(""); // Reset reply when going back
  };

  // Đồng ý yêu cầu
  const approveRequest = async () => {
    console.log(selectedRequestToView);
    if (!selectedRequestToView) {
      toast.error("Yêu cầu không tồn tại!");
      return;
    }

    // Kiểm tra phản hồi không trống
    if (reply.trim() === "") {
      toast.error("Phản hồi không được để trống.");
      return;
    }

    const requestId = selectedRequestToView.id; // Lấy ID yêu cầu
    const currentCreatedAt = selectedRequestToView.created_at; // Lấy thời gian tạo yêu cầu

    try {
      const response = await axios.put(`/requests/${requestId}`, {
        status: 2, // Cập nhật trạng thái đã xử lý
        reply: reply, // Gửi reply
      });
      if (response.status == 200) {
        toast.success("Cập nhật trạng thái thành công!");
        const updateRequest = {
          id: selectedRequestToView.id,
          email: selectedRequestToView.email,
          title: selectedRequestToView.title,
          content: selectedRequestToView.content,
          reply: reply,
          status: 2, // Trạng thái đã xử lý
          created_at: currentCreatedAt,
          updated_at: currentDate,
        };
        setRequestList((prevList) => [
          ...prevList.filter((request) => request.id !== requestId),
          updateRequest,
        ]);
        if (selectedRequestToView.title === "Yêu cầu gia hạn phòng") {
          createInvoice();
        }
        if (selectedRequestToView.title === "Yêu cầu hủy phòng") {
          deleteBooking();
        }
        setReply("");
        setSelectedRequestToView(null);
        goBack();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      toast.error("Lỗi khi cập nhật yêu cầu");
    }
  };

  // Từ chối yêu cầu
  const rejectRequest = async () => {
    if (!selectedRequestToView) {
      toast.error("Yêu cầu không tồn tại!");
      return;
    }

    // Kiểm tra phản hồi không trống
    if (reply.trim() === "") {
      toast.error("Phản hồi không được để trống.");
      return;
    }

    const requestId = selectedRequestToView.id; // Lấy ID yêu cầu
    const currentCreatedAt = selectedRequestToView.created_at; // Lấy thời gian tạo yêu cầu

    try {
      const response = await axios.put(`/requests/${requestId}`, {
        status: 3, // Cập nhật trạng thái đã xử lý
        reply: reply, // Gửi reply
      });

      if (response.status == 200) {
        toast.success("Cập nhật trạng thái thành công!");
        const updateRequest = {
          id: selectedRequestToView.id,
          fullname: selectedRequestToView.fullname,
          title: selectedRequestToView.title,
          content: selectedRequestToView.content,
          reply: reply,
          status: 3, // Trạng thái đã xử lý
          created_at: currentCreatedAt,
          updated_at: currentDate,
        };
        setRequestList((prevList) => [
          ...prevList.filter((request) => request.id !== requestId),
          updateRequest,
        ]);

        setReply("");
        setSelectedRequestToView(null);
        goBack();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      toast.error("Lỗi khi cập nhật yêu cầu");
    }
  };

  return (
    <div className={styles["request-manager-section"]}>
      {selectedRequestToView ? (
        <div className={styles["detail-view"]}>
          <h1>Chi tiết yêu cầu</h1>
          <button className={styles["back-button"]} onClick={goBack}>
            Trở về danh sách yêu cầu
          </button>

          <table className={styles["detail-table"]}>
            <thead>
              <tr>
                <th>Nội dung</th>
                {selectedRequestToView.reply && selectedRequestToView.reply.trim() !== "" && (
                  <th>Phản hồi</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  style={{
                    width:
                      !selectedRequestToView.reply || selectedRequestToView.reply.trim() === ""
                        ? "100%"
                        : "50%",
                    verticalAlign: "top",
                  }}
                >
                  {selectedRequestToView.content}
                </td>
                {selectedRequestToView.reply && selectedRequestToView.reply.trim() !== "" && (
                  <td style={{ width: "50%", verticalAlign: "top" }}>
                    {selectedRequestToView.reply}
                  </td>
                )}
              </tr>
            </tbody>
          </table>

          {/* Reply input */}
          <div className={styles["reply-section"]}>
            <textarea
              placeholder="Nhập phản hồi tại đây..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows="4"
            />
          </div>
          <div className={styles["action-buttons"]}>
            <button
              className={`${styles["button-approve"]} ${
                selectedRequestToView.status == 2 ? styles["active"] : ""
              }`}
              onClick={() => approveRequest(selectedRequestToView.id)}
            >
              Đồng ý
            </button>
            <button
              className={`${styles["button-reject"]} ${
                selectedRequestToView.status == 3 ? styles["active"] : ""
              }`}
              onClick={() => rejectRequest(selectedRequestToView.id)}
            >
              Từ chối
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className={styles["title"]}>Quản lý Yêu cầu</h2>
          <div className={styles["filter-section"]}>
            <div className={styles["inputGroup"]}>
              <input
                type="text"
                placeholder="Tìm kiếm theo nội dung"
                value={searchContent}
                onChange={(e) => setSearchContent(e.target.value)}
              />
            </div>
            <div className={styles["inputGroup"]}>
              <select value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}>
                <option value="">Tất cả yêu cầu</option>
                <option value="Yêu cầu gia hạn phòng">Yêu cầu gia hạn phòng</option>
                <option value="Yêu cầu sửa chữa phòng">Yêu cầu sửa chữa phòng</option>
                <option value="Yêu cầu đổi phòng">Yêu cầu đổi phòng</option>
                <option value="Yêu cầu khác">Yêu cầu khác</option>
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="0">Chưa xử lý</option>
                <option value="1">Đang xử lý</option>
                <option value="2">Đồng ý</option>
                <option value="3">Từ chối</option>
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {currentFilteredRequests.length > 0 ? (
            <table className={styles["request-table"]}>
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Ngày gửi</th>
                  <th>Loại yêu cầu</th>
                  <th>Chức năng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentFilteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className={styles["name-column"]}>{request.email}</td>
                    <td className={styles["created-column"]}>
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
                    <td className={styles["content-column"]}>{request.title}</td>

                    <td className={styles["option-column"]}>
                      <button
                        className={styles["button-detail"]}
                        onClick={() => viewDetail(request)}
                      >
                        Xem
                      </button>
                    </td>
                    <td>
                      {request.status == 3 ? (
                        <span>Từ chối</span>
                      ) : request.status == 2 ? (
                        <span>Đồng ý</span>
                      ) : request.status == 1 ? (
                        <span>Đang xử lý</span>
                      ) : (
                        <span>Chưa xử lý</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Không có yêu cầu nào để hiển thị</p>
          )}
          {totalPages > 1 && (
            <MyPagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default RequestManager;
