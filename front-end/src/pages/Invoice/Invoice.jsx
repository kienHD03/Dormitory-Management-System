import { useEffect, useState } from "react";
import "./Invoice.css";
import axios from "../../utils/axios";
import MyPagination from "../../components/Pagination/MyPagination";
import InvoiceDetail from "./InvoiceDetail";
import Payment from "../payment/Payment";
import { verifyAccessToken } from "../../utils/jwt";
import toast from "react-hot-toast";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;

  const onPageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLast = currentPage * itemPerPage;
  const indexOfFirst = indexOfLast - itemPerPage;
  const currentFilteredInvoices = invoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(invoices.length / itemPerPage);

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const getInvoices = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (token) {
      try {
        const user = verifyAccessToken(token);
        const response = await axios.get(`/invoice/${user.id}`);
        if (response.status === 200) {
          setInvoices(response.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const createResidentHistory = async () => {
    const token = JSON.parse(localStorage.getItem("token"));
    const user = verifyAccessToken(token);
    try {
      const response = await axios.post("/users/resident-history", {
        userId: user.id,
        roomId: user.roomId,
        bedId: user.bedId,
        description: "Đặt phòng",
        expiredAt: 1,
      });
      if (response.status !== 200) {
        toast.error("Đã có lỗi xảy ra khi tạo lịch sử cư trú");
        return;
      }
      console.log(response);
      const token = response.data.data;
      localStorage.setItem("token", JSON.stringify(token));
    } catch (error) {
      console.log(error);
    }
  };

  const updateInvoiceStatus = async ({ id, type }) => {
    try {
      const response = await axios.patch(`/invoice/${id}`, { status: "Đã thanh toán" });
      if (response.status === 200) {
        if (type === "Yêu cầu gia hạn phòng") {
          createResidentHistory();
        }
        toast.success("Thanh toán thành công");
        getInvoices();
        setShowQRCode(false);
      }
    } catch (e) {
      console.error(e);
      setShowQRCode(false);
      toast.error("Thanh toán thất bại");
    }
  };

  const handleSuccess = (data) => {
    updateInvoiceStatus(data);
    setShowQRCode(false);
  };

  const handleCancel = () => {
    setShowQRCode(false);
  };

  useEffect(() => {
    getInvoices();
  }, []);

  return (
    <div className="invoice">
      <h1>Hóa đơn</h1>
      <table className="invoice-table table table-striped table-hover">
        <thead>
          <tr>
            <th>Loại Hóa Đơn</th>
            <th>Trạng Thái</th>
            <th>Số Tiền</th>
            <th>Ngày tạo</th>
            <th>Ngày thanh toán</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentFilteredInvoices.length !== 0 ? (
            currentFilteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.type}</td>
                <td>{invoice.status}</td>
                <td>{invoice.amount.toLocaleString()}đ</td>
                <td>{invoice.created_at && toLocaleData(invoice.created_at)}</td>
                <td>{invoice.updated_at && toLocaleData(invoice.updated_at)}</td>
                <td className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      console.log(invoice);
                      setSelectedInvoice(invoice);
                    }}
                  >
                    Xem chi tiết
                  </button>
                  {invoice.status === "Chưa thanh toán" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        // setShowQRCode(true);
                        // setInvoiceData({ ...invoice, price: invoice.amount });
                        updateInvoiceStatus(invoice);
                      }}
                    >
                      Thanh toán
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedInvoice && (
        <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
      {showQRCode && (
        <Payment handleSuccess={handleSuccess} handleCancel={handleCancel} data={invoiceData} />
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

export default Invoice;
