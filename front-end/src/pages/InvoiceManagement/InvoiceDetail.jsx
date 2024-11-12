const InvoiceDetail = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const toLocaleData = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  return (
    <div className="invoice-detail-modal">
      <div className="invoice-detail-content">
        <button className="invoice-detail close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Chi Tiết Hóa Đơn</h2>
        <div className="invoice-detail-info">
          <p>
            <strong>Email:</strong> {invoice.email}
          </p>
          <p>
            <strong>Phòng:</strong> {invoice.room_name}
          </p>
          <p>
            <strong>Loại Hóa Đơn:</strong> {invoice.type}
          </p>
          <p>
            <strong>Số Tiền:</strong> {invoice.amount}
          </p>
          <p>
            <strong>Trạng Thái:</strong> {invoice.status}
          </p>
          <p>
            <strong>Ngày Tạo:</strong> {toLocaleData(invoice.created_at)}
          </p>
          <p>
            <strong>Ngày Cập Nhật:</strong> {toLocaleData(invoice.updated_at)}
          </p>
          <p>
            <strong>Mô tả:</strong> {invoice.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
