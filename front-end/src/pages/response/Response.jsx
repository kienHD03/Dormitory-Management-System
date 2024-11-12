import styles from "./Response.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const Response = () => {
  const [requestList, setRequestList] = useState([]); // Danh sách yêu cầu
  const [filteredRequestList, setFilteredRequestList] = useState([]); // Danh sách yêu cầu đã lọc
  const [selectedRequestToView, setSelectedRequestToView] = useState(null); // Yêu cầu đang được xem
  const [newRequestTitle, setNewRequestTitle] = useState(""); // Tiêu đề yêu cầu mới
  const [newRequestContent, setNewRequestContent] = useState(""); // Nội dung yêu cầu mới
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái modal
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
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

  // Lọc và sắp xếp danh sách yêu cầu theo tiêu đề và thứ tự thời gian
  const filterRequests = () => {
    let filtered = requestList
      .filter((request) =>
        request.title.toLowerCase().includes(searchTitle.toLowerCase())
      )
      .filter((request) => request.status != 0 && request.status != 1);

    // Sắp xếp theo created_at
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

  const currentFilteredRequests = filteredRequestList.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredRequestList.length / requestsPerPage);

  // Xem chi tiết yêu cầu
  const viewDetail = (request) => {
    setSelectedRequestToView(request);
  };

  // Quay lại danh sách yêu cầu
  const goBack = () => setSelectedRequestToView(null);

  // Tạo yêu cầu mới
  const addRequest = async () => {
    if (!newRequestTitle || !newRequestContent) {
      toast.error("Vui lòng điền tất cả các trường!");
      return;
    }
    try {
      const response = await axios.post("/requests", {
        title: newRequestTitle,
        content: newRequestContent,
        user_id: user.id,
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
      console.error("Lỗi khi tạo yêu cầu:", error);
      toast.error("Lỗi khi tạo yêu cầu");
    }
  };

  // Đặt lại form sau khi tạo/chỉnh sửa yêu cầu
  const resetForm = () => {
    setNewRequestTitle("");
    setNewRequestContent("");
    setIsEditing(false);
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
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
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
              <div className={styles["add-request-modal"]}>
                <button className={styles["close-button"]} onClick={resetForm}>
                  Đóng
                </button>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                />
                <textarea
                  placeholder="Nội dung"
                  value={newRequestContent}
                  onChange={(e) => setNewRequestContent(e.target.value)}
                />
                <button onClick={addRequest}>
                  {isEditing ? "Cập nhật yêu cầu" : "Tạo yêu cầu"}
                </button>
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
                    <th>Phản hồi</th>
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
                      <td>
                        <button onClick={() => viewDetail(request)}>Xem</button>
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
                      <td>{request.reply}</td>
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Response;
