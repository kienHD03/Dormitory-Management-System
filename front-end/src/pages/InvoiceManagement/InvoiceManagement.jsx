import { useState, useEffect } from "react";
import axios from "../../utils/axios";
import InvoiceDetail from "./InvoiceDetail";
import CreateInvoice from "./CreateInvoice";
import MyPagination from "../../components/Pagination/MyPagination";

const InvoiceManagement = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [fullInvoices, setFullInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const InvoicePerPage = 6;
  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLast = currentPage * InvoicePerPage;
  const indexOfFirst = indexOfLast - InvoicePerPage;
  const currentFilteredInvoices = invoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(invoices.length / InvoicePerPage);

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const getInvoice = async () => {
    try {
      const response = await axios.get("/invoice");
      if (response.status === 200) {
        setFullInvoices(response.data.data);
        setInvoices(response.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyFilters = () => {
    const filtered = fullInvoices.filter((invoice) => {
      const emailMatch = invoice.email && invoice.email.includes(emailFilter);
      const roomMatch =
        roomFilter.trim() === "" ||
        (invoice.room_name &&
          invoice.room_name.toLowerCase().includes(roomFilter.toLowerCase().trim()));
      const statusMatch = statusFilter ? invoice.status === statusFilter : true;
      const typeMatch = typeFilter ? invoice.type === typeFilter : true;

      return emailMatch && roomMatch && statusMatch && typeMatch;
    });

    setInvoices(filtered);
    setCurrentPage(1);
  };

  const handleCreateInvoice = (newInvoice) => {
    setFullInvoices([...newInvoice, ...fullInvoices]);
    setInvoices([...newInvoice, ...invoices]);
  };

  useEffect(() => {
    applyFilters();
  }, [emailFilter, roomFilter, statusFilter, typeFilter]);

  useEffect(() => {
    getInvoice();
  }, []);

  return (
    <div className="invoice">
      <h1>Quản lý hóa đơn</h1>
      <nav className="invoice-nav">
        <input
          type="text"
          placeholder="Tìm theo email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Tìm theo phòng"
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          className="filter-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-input form-control"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
          <option value="Chưa thanh toán">Chưa thanh toán</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-input form-control"
        >
          <option value="">Loại hóa đơn</option>
          <option value="Phí điện nước">Phí điện nước</option>
          <option value="Phí phụ trội">Phí phụ trội</option>
          <option value="Đặt phòng">Đặt phòng</option>
        </select>
        <button className="btn btn-primary create-btn" onClick={() => setIsCreating(true)}>
          Tạo hóa đơn
        </button>
      </nav>

      <table className="invoice-table table table-striped table-hover">
        <thead>
          <tr>
            <th>Email</th>
            <th>Phòng</th>
            <th>Loại Hóa Đơn</th>
            <th>Trạng Thái</th>
            <th>Số Tiền</th>
            <th>Ngày Tạo</th>
            <th>Ngày Thanh Toán</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentFilteredInvoices.length !== 0 ? (
            currentFilteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.email}</td>
                <td>{invoice.room_name}</td>
                <td>{invoice.type}</td>
                <td>{invoice.status}</td>
                <td>{invoice.amount}</td>
                <td>{invoice.created_at && toLocaleData(invoice.created_at)}</td>
                <td>{invoice.updated_at && toLocaleData(invoice.updated_at)}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => setSelectedInvoice(invoice)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedInvoice && (
        <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
      {isCreating && (
        <CreateInvoice
          onClose={() => {
            setIsCreating(false);
          }}
          onCreateInvoice={handleCreateInvoice}
        />
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

export default InvoiceManagement;
