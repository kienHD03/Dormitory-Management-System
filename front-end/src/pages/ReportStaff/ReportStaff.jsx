import styles from "./ReportStaff.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const ReportStaff = () => {
  const [reportList, setReportList] = useState([]); // Danh sách yêu cầu
  const [filteredReportList, setFilteredReportList] = useState([]); // Danh sách yêu cầu đã lọc
  const [selectedReportToView, setSelectedReportToView] = useState(null); // Yêu cầu đang xem
  const [searchContent, setSearchContent] = useState(""); // Tìm kiếm theo nội dung
  const [sortOrder, setSortOrder] = useState("newest"); // Thứ tự sắp xếp theo ngày
  const [statusFilter, setStatusFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [reply, setReply] = useState(""); // Reply cho yêu cầu
  const [currentPage, setCurrentPage] = useState(1);
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);

  const token = JSON.parse(localStorage.getItem("token"));
  const user = verifyAccessToken(token); // Lấy thông tin người dùng từ token

  const reportsPerPage = 9;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;

  // Lấy danh sách yêu cầu khi component được mount
  useEffect(() => {
    const fetchReportList = async () => {
      try {
        const response = await axios.get("/reports");
        if (response.status !== 200) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }

          const staffReports = response.data.data.reportsInfo.filter(
          (report) => report.staff_id === user.id
        );

        setReportList(staffReports);
        setFilteredReportList(staffReports); // Đặt danh sách đã lọc ban đầu bằng danh sách đầy đủ
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchReportList();
  }, []);

  // Hàm lọc và sắp xếp danh sách yêu cầu
  const filterAndSortReports = () => {
    let filtered = reportList.filter((report) => {
      // Lọc theo nội dung tìm kiếm
      return (
        report.title.toLowerCase().includes(searchContent.toLowerCase()) ||
        report.content.toLowerCase().includes(searchContent.toLowerCase())
      );
    });

    // Lọc theo tiêu đề
    if (titleFilter) {
      filtered = filtered.filter((report) =>
        report.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (statusFilter) {
      filtered = filtered.filter((report) => {
        // Nếu chọn "Hoàn thành", bao gồm cả trạng thái 2 và 3
        if (statusFilter === "completed") {
          return report.status == 2 || report.status == 3;
        }
        // Kiểm tra trạng thái cụ thể
        return report.status.toString() == statusFilter;
      });
    }

    // Sắp xếp theo ngày tạo
    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredReportList(filtered);
  };

  useEffect(() => {
    filterAndSortReports(); // Gọi hàm lọc và sắp xếp khi tiêu chí lọc hoặc danh sách yêu cầu thay đổi
  }, [searchContent, titleFilter, sortOrder, statusFilter, reportList]);

  const currentFilteredReports = filteredReportList.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(filteredReportList.length / reportsPerPage);

  // Chuyển đến chi tiết yêu cầu và cập nhật trạng thái
  const viewDetail = async (report) => {
    if (report.status == 0) {
      try {
        const reportId = report.id;

        const response = await axios.put(`/reports/${reportId}`, {
          status: 1,
          reply: "",
        });
        if (response.status == 200) {
          toast.success("Cập nhật trạng thái thành công!");
          const updateReport = {
            id: report.id,
            user_fullname: report.user_fullname,
            title: report.title,
            content: report.content,
            reply: "",
            status: 1,
            created_at: report.created_at,
            updated_at: currentDate,
          };
          setReportList((prevList) => [
            ...prevList.filter((report) => report.id !== reportId),
            updateReport,
          ]);
        }
        console.log("Report", report);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        toast.error("Lỗi khi cập nhật trạng thái");
      }
    }

    setSelectedReportToView(report);
    setReply("");
  };

  // Quay lại danh sách yêu cầu
  const goBack = () => {
    setSelectedReportToView(null);
    setReply(""); // Reset reply when going back
  };

  // Đồng ý yêu cầu
  const approveReport = async () => {
    if (!selectedReportToView) {
      toast.error("Yêu cầu không tồn tại!");
      return;
    }

    // Kiểm tra phản hồi không trống
    if (reply.trim() === "") {
      toast.error("Phản hồi không được để trống.");
      return;
    }

    const reportId = selectedReportToView.id; // Lấy ID yêu cầu
    const currentCreatedAt = selectedReportToView.created_at; // Lấy thời gian tạo yêu cầu

    try {
      const response = await axios.put(`/reports/${reportId}`, {
        status: 2, // Cập nhật trạng thái đã xử lý
        reply: reply, // Gửi reply
      });
      if (response.status == 200) {
        toast.success("Cập nhật trạng thái thành công!");
        const updateReport = {
          id: selectedReportToView.id,
          user_fullname: selectedReportToView.user_fullname,
          title: selectedReportToView.title,
          content: selectedReportToView.content,
          reply: reply,
          staff_fullname: user.fullname,
          status: 2, // Trạng thái đã xử lý
          created_at: currentCreatedAt,
          updated_at: currentDate,
        };
        setReportList((prevList) => [
          ...prevList.filter((report) => report.id !== reportId),
          updateReport,
        ]);
        console.log(selectedReportToView);
        setReply("");
        setSelectedReportToView(null);
        goBack();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      toast.error("Lỗi khi cập nhật yêu cầu");
    }
  };

  // Từ chối yêu cầu
  const rejectReport = async () => {
    if (!selectedReportToView) {
      toast.error("Yêu cầu không tồn tại!");
      return;
    }

    // Kiểm tra phản hồi không trống
    if (reply.trim() === "") {
      toast.error("Phản hồi không được để trống.");
      return;
    }

    const reportId = selectedReportToView.id; // Lấy ID yêu cầu
    const currentCreatedAt = selectedReportToView.created_at; // Lấy thời gian tạo yêu cầu

    try {
      const response = await axios.put(`/reports/${reportId}`, {
        status: 3, // Cập nhật trạng thái đã xử lý
        reply: reply, // Gửi reply
      });

      if (response.status == 200) {
        toast.success("Cập nhật trạng thái thành công!");
        const updateReport = {
          id: selectedReportToView.id,
          user_fullname: selectedReportToView.user_fullname,
          title: selectedReportToView.title,
          content: selectedReportToView.content,
          reply: reply,
          staff_fullname: user.fullname,
          status: 3, // Trạng thái đã xử lý
          created_at: currentCreatedAt,
          updated_at: currentDate,
        };
        setReportList((prevList) => [
          ...prevList.filter((report) => report.id !== reportId),
          updateReport,
        ]);

        setReply("");
        setSelectedReportToView(null);
        goBack();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật yêu cầu:", error);
      toast.error("Lỗi khi cập nhật yêu cầu");
    }
  };

  return (
    <div className={styles["report-manager-section"]}>
      {selectedReportToView ? (
        <div className={styles["detail-view"]}>
          <h1>Chi tiết yêu cầu</h1>
          <button className={styles["back-button"]} onClick={goBack}>
            Trở về danh sách yêu cầu
          </button>
          <p>{selectedReportToView.content}</p>
          {selectedReportToView.reply && (
            <p>Phản hồi: {selectedReportToView.reply}</p>
          )}
          {selectedReportToView.staff_fullname && (
            <p>Người xử lý: {selectedReportToView.staff_fullname}</p>
          )}
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
                selectedReportToView.status == 2 ? styles["active"] : ""
              }`}
              onClick={() => approveReport(selectedReportToView.id)}
            >
              Đồng ý
            </button>
            <button
              className={`${styles["button-reject"]} ${
                selectedReportToView.status == 3 ? styles["active"] : ""
              }`}
              onClick={() => rejectReport(selectedReportToView.id)}
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
              <select
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="">Tất cả yêu cầu</option>
                <option value="Yêu cầu kiểm tra phòng">
                  Yêu cầu kiểm tra phòng
                </option>
                <option value="Yêu cầu dọn phòng">Yêu cầu dọn phòng</option>
                <option value="Yêu cầu khác">Yêu cầu khác</option>
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="0">Chưa xử lý</option>
                <option value="1">Đang xử lý</option>
                <option value="2">Đồng ý</option>
                <option value="3">Từ chối</option>
              </select>
            </div>
            <div className={styles["inputGroup"]}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {currentFilteredReports.length > 0 ? (
            <table className={styles["report-table"]}>
              <thead>
                <tr>
                  <th>Người gửi</th>
                  <th>Ngày gửi</th>
                  <th>Tiêu đề</th>
                  <th>Chức năng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentFilteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className={styles["name-column"]}>
                      {report.user_fullname}
                    </td>
                    <td className={styles["created-column"]}>
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
                    <td className={styles["content-column"]}>{report.title}</td>

                    <td className={styles["option-column"]}>
                      <button
                        className={styles["button-detail"]}
                        onClick={() => viewDetail(report)}
                      >
                        Xem
                      </button>
                    </td>
                    <td>
                      {report.status == 3 ? (
                        <span>Từ chối</span>
                      ) : report.status == 2 ? (
                        <span>Đồng ý</span>
                      ) : report.status == 1 ? (
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

export default ReportStaff;
