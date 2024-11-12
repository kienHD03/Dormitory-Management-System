import { Group, Pagination } from "@mantine/core";
import "./MyPagination.css";

const MyPagination = ({ totalPages, currentPage, onPageChange }) => {
  // Them vao trang hien tai

  // const usersPerPage = 5; // Số lượng người dùng trên mỗi trang

  // Tính tổng số trang dựa trên số lượng người dùng
  // const totalPages = Math.ceil(users.length / usersPerPage);

  // const indexOfLastUser = currentPage * usersPerPage;
  // const indexOfFirstUser = indexOfLastUser - usersPerPage;
  // const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  //Đặt trang hiện tại
  // const onPageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };
  return (
    <Pagination.Root
      total={totalPages}
      value={currentPage}
      onChange={onPageChange}
      className="pagination"
    >
      <Group gap={5} justify="center">
        <Pagination.First />
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
        <Pagination.Last />
      </Group>
    </Pagination.Root>
  );
};

export default MyPagination;
