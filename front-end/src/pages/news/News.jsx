import styles from "./News.module.css";
import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { verifyAccessToken } from "../../utils/jwt";
import MyPagination from "../../components/Pagination/MyPagination";

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [postType, setPostType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' or 'oldest'

  const token = JSON.parse(localStorage.getItem("token"));
  const user = verifyAccessToken(token);

  const newsPerPage = 5;

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const uniqueType = [...new Set(postType.map((type) => type.type))];

  const indexOfLast = currentPage * newsPerPage;
  const indexOfFirst = indexOfLast - newsPerPage;

  useEffect(() => {
    const getNewsList = async () => {
      try {
        const response = await axios.get("/posts");
        if (response.status !== 200) {
          throw new Error("Lỗi khi lấy dữ liệu");
        }
        setPostType(response.data.data.postType);
        setNewsList(response.data.data.postsInfo);
        console.log(response.data.data.postType);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Lỗi khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    getNewsList();
  }, []);

  const filteredNewsList = newsList
    .filter((news) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const limit = new Date(news.expired_at);
      limit.setHours(0, 0, 0, 0);

      return today <= limit; // Lọc các tin tức có thời gian chưa đến hôm nay
    })
    .filter((news) => {
      // Lọc theo loại tin tức (searchType)
      if (searchType && news.type !== searchType) {
        return false;
      }

      if (
        [
          "Thông báo chung",
          "Thông báo về quy định, nội quy",
          "Thông báo đăng ký phòng",
          "Thông báo sự kiện",
          "Thông báo khẩn cấp",
        ].includes(news.type)
      ) {
        return true;
      } else if (
        ["Thông báo sự cố", "Thông báo bảo trì và sửa chữa"].includes(news.type)
      ) {
        return (
          (news.department == user.department && !news.room && !news.floor) ||
          (news.department == user.department &&
            news.floor == user.room[1] &&
            !news.room) ||
          (news.department == user.department &&
            news.room == user.room &&
            news.floor == user.room[1])
        );
      } else if (["Thông báo thanh toán"].includes(news.type)) {
        const currentDate = new Date();
        const expiredDate = new Date(user.expired_at);
        expiredDate.setHours(expiredDate.getHours() - 7);
        const timeDiffInDays =
          (expiredDate - currentDate) / (1000 * 60 * 60 * 24);
        return timeDiffInDays <= 5;
      }
      return false; // Không hiển thị tin tức khác
    })
    .filter((news) => {
      const lowerCaseTerm = searchTerm.toLowerCase();
      return (
        news.title.toLowerCase().includes(lowerCaseTerm) ||
        news.content.toLowerCase().includes(lowerCaseTerm)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

  const totalPages = Math.ceil(filteredNewsList.length / newsPerPage);
  const currentNews = filteredNewsList.slice(indexOfFirst, indexOfLast);

  const viewDetail = (news) => setSelectedNews(news);

  const formatDate = (dateString) => {
    const options = {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString)
      .toLocaleString("vi-VN", options)
      .replace("lúc ", "");
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  return (
    <div className={styles["news-section"]}>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : selectedNews ? (
        <div className={styles["detail-view"]}>
          <h1>{selectedNews.title.toUpperCase()}</h1>
          <div className={styles["news-content-header"]}>
            <button
              className={styles["back-button"]}
              onClick={() => setSelectedNews(null)}
            >
              Trở về trang tin tức
            </button>
            <h3>{formatDate(selectedNews.created_at)}</h3>
          </div>
          <p>{selectedNews.content}</p>
        </div>
      ) : (
        <>
          <h2 className={styles["title"]}>Tin tức mới nhất</h2>
          <div className={styles["filter-controls"]}>
            <div className={styles["filterGroup"]}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="">Chọn thể loại</option>
                {uniqueType.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              </div>
              <div className={styles["filterGroup"]}>
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles["filterGroup"]}>
              <select value={sortOrder} onChange={handleSortChange}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
          <div className={styles["news-content"]}>
            {currentNews.length > 0 ? (
              currentNews.map((news) => (
                <div
                  className={styles["news-item"]}
                  key={news.id}
                  onClick={() => viewDetail(news)}
                >
                  <div className={styles["news-content-header"]}>
                    <h3>{news.type}</h3>
                    <h3>{formatDate(news.created_at)}</h3>
                  </div>
                  <p>{news.title.toUpperCase()}</p>
                </div>
              ))
            ) : (
              <p>Không có tin tức nào</p>
            )}
          </div>
        </>
      )}
      {!selectedNews && totalPages > 1 && (
        <MyPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default News;
