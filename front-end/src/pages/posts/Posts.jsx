import styles from "./Posts.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const Posts = () => {
  const [newsList, setNewsList] = useState([]); // Dữ liệu danh sách bài viết
  const [filteredNewsList, setFilteredNewsList] = useState([]); // Dữ liệu danh sách bài viết đã lọc
  const [selectedNewsToView, setSelectedNewsToView] = useState(null); // Dữ liệu bài viết đang xem
  const [selectedNewsToEdit, setSelectedNewsToEdit] = useState(null); // Dữ liệu bài viết đang chỉnh sửa
  const [newNewsTitle, setNewNewsTitle] = useState(""); // Tiêu đề bài viết mới
  const [newNewsContent, setNewNewsContent] = useState(""); // Nội dung bài viết mới
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái mở modal
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa bài viết
  const [searchType, setSearchType] = useState("");
  const [searchTitle, setSearchTitle] = useState(""); // Tiêu đề để lọc
  const [sortOrder, setSortOrder] = useState("newest"); // Thứ tự sắp xếp theo ngày
  const [roomsInfo, setRoomsInfo] = useState([]);
  const [postType, setPostType] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State để lưu trữ lựa chọn của người dùng
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // State để lưu trữ lựa chọn của 'Thể loại' và kiểm tra disable
  const [selectedRoom, setSelectedRoom] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 7);

  const token = JSON.parse(localStorage.getItem("token"));
  const user = verifyAccessToken(token);

  const newsPerPage = 11;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLast = currentPage * newsPerPage;
  const indexOfFirst = indexOfLast - newsPerPage;

  // Lấy danh sách bài viết khi component được mount
  useEffect(() => {
    const fetchNewsList = async () => {
      try {
        const response = await axios.get("/posts");
        console.log(response);
        if (response.status !== 200) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        setNewsList(response.data.data.postsInfo);
        setFilteredNewsList(response.data.data.postsInfo);
        setRoomsInfo(response.data.data.rooms);
        setPostType(response.data.data.postType);
        setDepartmentInfo(response.data.data.departmentInfo);
        console.log("Dữ liệu nhận về:", response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchNewsList();
  }, []);

  // Hàm lọc và sắp xếp danh sách bài viết
  const filterAndSortNews = () => {
    let filtered = newsList.filter((news) => {
      // Filter by title
      const titleMatch = news.title.toLowerCase().includes(searchTitle.toLowerCase());

      // Filter by type if a type is selected
      const typeMatch = searchType ? news.type === searchType : true;

      return titleMatch && typeMatch; // Return true if both conditions match
    });

    // Sort by creation date
    if (sortOrder == "newest") {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredNewsList(filtered);
  };

  useEffect(() => {
    filterAndSortNews(); // Call the filtering and sorting function when criteria change
  }, [searchTitle, sortOrder, newsList, searchType]); // Add searchType to dependency array

  const currentFilteredNews = filteredNewsList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredNewsList.length / newsPerPage);

  // Chuyển đến chi tiết bài viết
  const viewDetail = (news) => {
    setSelectedNewsToView(news);
  };

  // Quay lại danh sách bài viết
  const goBack = () => setSelectedNewsToView(null);

  // Thêm bài viết mới
  const addNews = async () => {
    if (
      !selectedCategory &&
      !newNewsTitle &&
      !newNewsContent &&
      !selectedTime &&
      !selectedDepartment &&
      !selectedRoom &&
      !selectedFloor
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!selectedCategory) {
      toast.error("Vui lòng chọn thể loại!");
      return;
    }

    if (!selectedTime) {
      toast.error("Vui lòng chọn thời gian!");
      return;
    }

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    if (selectedTime <= formattedToday) {
      toast.error("Vui lòng chọn lại thời gian!");
      return;
    }

    if (!selectedDepartment && selectedFloor && !selectedRoom) {
      toast.error("Vui lòng chọn tòa!");
      return;
    }

    if (!newNewsTitle) {
      toast.error("Vui lòng điền tiêu đề bài viết!");
      return;
    }

    if (!newNewsContent) {
      toast.error("Vui lòng điền nội dung bài viết!");
      return;
    }

    try {
      const response = await axios.post("/posts", {
        type_id: selectedCategory,
        title: newNewsTitle,
        content: newNewsContent,
        user_id: user.id,
        department_id: selectedDepartment ? selectedDepartment : null,
        floor: selectedFloor ? selectedFloor : null,
        room_id: selectedRoom ? selectedRoom : null,
        expired_at: selectedTime ? selectedTime : null,
        created_at: currentDate,
        updated_at: currentDate,
      });

      if (response.status === 200) {
        toast.success("Thêm bài viết thành công!");

        const postTypeEntry = postType.find((type) => type.id == selectedCategory);
        const postTypeName = postTypeEntry ? postTypeEntry.type : null;

        const newPost = {
          type: postTypeName,
          post_type: selectedCategory,
          id: response.data.data.postId,
          title: newNewsTitle,
          content: newNewsContent,
          fullname: user.fullname,
          expired_at: selectedTime ? selectedTime : null,
          created_at: currentDate,
          updated_at: currentDate,
        };
        setNewsList([...newsList, newPost]);
      }
      resetForm(); // Làm mới form
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi thêm bài viết:", error);
      toast.error("Lỗi khi thêm bài viết");
    }
  };

  // Cập nhật bài viết hiện tại
  const updateNews = async () => {
    if (!selectedNewsToEdit) {
      toast.error("Bài viết không tồn tại!");
      return;
    }

    if (!selectedCategory) {
      toast.error("Vui lòng chọn thể loại!");
      return;
    }

    if (!selectedTime) {
      toast.error("Vui lòng chọn thời gian!");
      return;
    }

    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];

    if (selectedTime <= formattedToday) {
      toast.error("Vui lòng chọn lại thời gian!");
      return;
    }

    if (!selectedDepartment && selectedFloor && !selectedRoom) {
      toast.error("Vui lòng chọn tòa!");
      return;
    }

    if (!newNewsTitle && !newNewsContent) {
      toast.error("Cập nhật thất bại, vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!newNewsTitle) {
      toast.error("Cập nhật thất bại, vui lòng điền tiêu đề bài viết!");
      return;
    }

    if (!newNewsContent) {
      toast.error("Cập nhật thất bại, vui lòng điền nội dung bài viết!");
      return;
    }

    const newsId = selectedNewsToEdit.id; // Lấy ID từ selectedNewsToEdit
    const currentCreatedAt = selectedNewsToEdit.created_at;

    try {
      const response = await axios.put(`/posts/${newsId}`, {
        type_id: selectedCategory,
        title: newNewsTitle,
        content: newNewsContent,
        user_id: user.id,
        department_id: selectedDepartment ? selectedDepartment : null,
        floor: selectedFloor ? selectedFloor : null,
        room_id: selectedRoom ? selectedRoom : null,
        expired_at: selectedTime ? selectedTime : null,
      });

      if (response.status == 200) {
        toast.success("Cập nhật bài viết thành công!");

        const postTypeEntry = postType.find((type) => type.id == selectedCategory);
        const postTypeName = postTypeEntry ? postTypeEntry.type : null;

        const updatedPost = {
          type: postTypeName,
          post_type: selectedCategory,
          id: newsId,
          title: newNewsTitle,
          content: newNewsContent,
          fullname: user.fullname,
          department_id: selectedDepartment ? selectedDepartment : null,
          floor: selectedFloor ? selectedFloor : null,
          room_id: selectedRoom ? selectedRoom : null,
          expired_at: selectedTime ? selectedTime : null,
          created_at: currentCreatedAt,
          updated_at: currentDate,
        };
        setNewsList((prevNewsList) => [
          ...prevNewsList.filter((post) => post.id !== newsId),
          updatedPost,
        ]);
      }

      resetForm(); // Làm mới form
      setIsModalOpen(false); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      toast.error("Lỗi khi cập nhật bài viết");
    }
  };

  // Xóa bài viết
  const deleteNews = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        const response = await axios.delete(`/posts/${id}`);
        if (response.status == 200) {
          toast.success("Xóa bài viết thành công!");
          setNewsList((prevList) => prevList.filter((news) => news.id !== id));
        }
      } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        toast.error("Lỗi khi xóa bài viết");
      }
    }
  };

  const disabledCategories = [
    "",
    "1",
    "3",
    "4",
    "5",
    "6",
    "7",
    "Thông báo chung",
    "Thông báo về quy định, nội quy",
    "Thông báo thanh toán",
    "Thông báo đăng ký phòng",
    "Thông báo sự kiện",
    "Thông báo khẩn cấp",
  ];

  // Kiểm tra nếu 'Thể loại' được chọn nằm trong danh sách disabledCategories
  const isDisabled = disabledCategories.includes(selectedCategory);

  // Xử lý sự kiện thay đổi 'Thể loại'
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    // Clear selections if the selected category is in disabledCategories
    if (disabledCategories.includes(category)) {
      setSelectedTime("");
      setSelectedDepartment("");
      setSelectedFloor("");
      setSelectedRoom("");
    }
  };

  const uniqueType = [...new Set(postType.map((type) => type.type))];

  const uniqueDepartments = [...new Set(departmentInfo.map((department) => department.department))];

  // Lấy danh sách các tầng dựa trên lựa chọn của Tòa
  const floorsInDepartment = [
    ...new Set(
      roomsInfo
        .filter((room) => selectedDepartment == "" || room.department_id == selectedDepartment)
        .map((room) => room.name[1]) // lấy tầng từ `room.name`, ví dụ "A1" -> tầng "1"
    ),
  ];

  // Lấy danh sách các phòng dựa trên lựa chọn của Tòa và Tầng
  const roomsInFloor = roomsInfo.filter(
    (room) =>
      (selectedDepartment == "" || room.department_id == selectedDepartment) &&
      (selectedFloor == "" || room.name[1] == selectedFloor)
  );

  // Hàm xử lý khi chọn thời hạn
  const handleTimeChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedTime(selectedDate); // Cập nhật giá trị ngày đã chọn
  };

  // Hàm xử lý khi chọn Tòa
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    setSelectedFloor(""); // Reset tầng khi thay đổi tòa
  };

  // Hàm xử lý khi chọn Tầng
  const handleFloorChange = (e) => {
    setSelectedFloor(e.target.value);
  };

  // Hàm xử lý khi chọn Phòng
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  // Reset form sau khi thêm/sửa bài viết
  const resetForm = () => {
    setNewNewsTitle("");
    setNewNewsContent("");
    setIsEditing(false);
    setSelectedNewsToEdit(null); // Reset selectedNewsToEdit
    setIsModalOpen(false);
    setSelectedCategory("");
    setSelectedTime("");
    setSelectedDepartment("");
    setSelectedFloor("");
    setSelectedRoom("");
  };

  // Bắt đầu chỉnh sửa bài viết
  const editNews = (news) => {
    setSelectedCategory(news.post_type.toString());
    setNewNewsTitle(news.title);
    setNewNewsContent(news.content);
    setSelectedDepartment(news.department_id);
    setSelectedFloor(news.floor);
    setSelectedRoom(news.room_id);
    const date = new Date(news.expired_at);
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedTime(formattedDate);
    setSelectedNewsToEdit(news); // Sử dụng selectedNewsToEdit
    setIsEditing(true);
    console.log("Sửa bài viết ID:", news);
    setIsModalOpen(true);
  };

  return (
    <div className={styles["news-manager-section"]}>
      {selectedNewsToView ? (
        <div className={styles["detail-view"]}>
          <h1>{selectedNewsToView.title}</h1>
          <div className={styles["info-news"]}>
            <button className={styles["back-button"]} onClick={goBack}>
              Trở về danh sách tin tức
            </button>
            <p>Thể loại: {selectedNewsToView.type}</p>
            <p>Người đăng: {selectedNewsToView.fullname}</p>
            {selectedNewsToView.department && <p>Tòa : {selectedNewsToView.department}</p>}
            {selectedNewsToView.floor && <p>Tầng : {selectedNewsToView.floor}</p>}
            {selectedNewsToView.room && <p>Phòng : {selectedNewsToView.room}</p>}
          </div>
          <p>{selectedNewsToView.content}</p>
        </div>
      ) : (
        <>
          <h2 className={styles["title"]}>Quản lý Tin tức</h2>
          <div className={styles["filter-section"]}>
            <div className={styles["inputGroup"]}>
              <button onClick={() => setIsModalOpen(true)}>Thêm bài viết</button>
            </div>
            <div className={styles["inputGroup"]}>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="">Chọn thể loại</option>
                {uniqueType.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles["inputGroup"]}>
              <input
                type="text"
                placeholder="Tìm theo tiêu đề"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
            <div className={styles["inputGroup"]}>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          {isModalOpen && (
            <>
              <div className={styles.overlay} onClick={resetForm} />
              <div className={styles["add-news-modal"]}>
                <button className={styles["close-button"]} onClick={resetForm}>
                  Đóng
                </button>
                <h2 onClick={isEditing ? updateNews : addNews} style={{ cursor: "pointer" }}>
                  {isEditing ? "Cập nhật bài viết" : "Thêm bài viết"}
                </h2>
                <div className={styles["selected-input"]}>
                  <select value={selectedCategory} onChange={handleCategoryChange}>
                    <option value="">Chọn thể loại</option>
                    {postType.map(({ id, type }) => (
                      <option key={id} value={id}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input type="date" value={selectedTime} onChange={handleTimeChange} />
                  <select
                    disabled={isDisabled}
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                  >
                    <option value="">Chọn tòa</option>
                    {departmentInfo.map(({ id, department }) => (
                      <option key={id} value={id}>
                        {department}
                      </option>
                    ))}
                  </select>
                  <select disabled={isDisabled} value={selectedFloor} onChange={handleFloorChange}>
                    <option value="">Chọn tầng</option>
                    {floorsInDepartment.map((floor, index) => (
                      <option key={index} value={floor}>
                        Tầng {floor}
                      </option>
                    ))}
                  </select>
                  <select disabled={isDisabled} value={selectedRoom} onChange={handleRoomChange}>
                    <option value="">Chọn phòng</option>
                    {roomsInFloor.map((room, index) => (
                      <option key={index} value={room.room_id}>
                        Phòng {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={newNewsTitle}
                  onChange={(e) => setNewNewsTitle(e.target.value)}
                />
                <textarea
                  placeholder="Nội dung"
                  value={newNewsContent}
                  onChange={(e) => setNewNewsContent(e.target.value)}
                />
                <button onClick={isEditing ? updateNews : addNews}>
                  {isEditing ? "Cập nhật bài viết" : "Thêm bài viết"}
                </button>
              </div>
            </>
          )}

          {currentFilteredNews.length === 0 ? (
            <div className={styles["no-news-message"]}>Hiện tại đang không có yêu cầu nào</div>
          ) : (
            <>
              <table className={styles["news-table"]}>
                <thead>
                  <tr>
                    <th>Loại</th>
                    <th>Tiêu đề</th>
                    <th>Người tạo</th>
                    <th>Ngày tạo</th>
                    <th>Ngày sửa</th>
                    <th>Chức năng</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFilteredNews.map((news) => (
                    <tr key={news.id}>
                      <td>{news.type}</td>
                      <td className={styles["title-column"]}>{news.title.toUpperCase()}</td>
                      <td className={styles["name-column"]}>{news.fullname}</td>
                      <td className={styles["created-column"]}>
                        {new Date(news.created_at)
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
                      <td className={styles["updated-column"]}>
                        {new Date(news.updated_at)
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
                      <td className={styles["option-column"]}>
                        <button className={styles["button-view"]} onClick={() => viewDetail(news)}>
                          Xem
                        </button>
                        <button className={styles["button-edit"]} onClick={() => editNews(news)}>
                          Sửa
                        </button>
                        <button
                          className={styles["button-delete"]}
                          onClick={() => deleteNews(news.id)}
                        >
                          Xóa
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Posts;
