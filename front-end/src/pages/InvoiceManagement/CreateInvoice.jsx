import { useForm } from "react-hook-form";
import axios from "../../utils/axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./CreateInvoice.css";

const CreateInvoice = ({ onClose, onCreateInvoice }) => {
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const emailInput = watch("email");
  const typeInput = watch("type");
  const electricityUsage = watch("electricityUsage") || 0;
  const waterUsage = watch("waterUsage") || 0;

  useEffect(() => {
    if (typeInput === "Phí điện nước") {
      const calculatedAmount = electricityUsage * 3000 + waterUsage * 10000;
      setValue("amount", calculatedAmount);
      setValue("description", `Số điện: ${electricityUsage}, Số nước: ${waterUsage}`);
    }
  }, [electricityUsage, waterUsage, typeInput, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/invoice", {
        amount: data.amount,
        type: data.type,
        description: `Số điện: ${data.electricityUsage}, Số nước: ${data.waterUsage}`,
        email: typeInput === "Phí điện nước" ? null : data.email,
        room: typeInput === "Phí điện nước" ? data.roomNumber : null,
        electricity: typeInput === "Phí điện nước" ? data.electricityUsage : null,
        water: typeInput === "Phí điện nước" ? data.waterUsage : null,
      });
      console.log(response);
      if (response.status === 201) {
        toast.success("Tạo hóa đơn thành công");
        onCreateInvoice(response.data.data);
        onClose();
        reset();
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        if (error.response.data.errors === "User not found with this email") {
          toast.error(`Không tìm thấy người dùng với email ${data.email}`);
        }
        if (error.response.data.errors === "User not found with this room number") {
          toast.error(`Không tìm thấy người dùng với số phòng ${data.roomNumber}`);
        }
        if (error.response.data.errors === "Data is required") {
          toast.error("Điền thiếu dữ liệu");
        }
        if (error.response.data.errors === "Create invoice failed") {
          toast.error("Đã có lỗi xảy ra trong quá trình tạo hóa đơn");
        }
      }
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get("/users");
      if (response.status === 200) {
        setUsers(response.data.data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (emailInput) {
      const filteredSuggestions = users
        .filter(
          (user) =>
            user.role === "Student" && user.email.toLowerCase().includes(emailInput.toLowerCase())
        )
        .map((user) => user.email);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [emailInput, users]);

  return (
    <div className="create-invoice-modal-overlay">
      <div className="create-invoice-modal">
        <h2>Tạo hóa đơn mới</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Loại hóa đơn</label>
            <select
              {...register("type", { required: "Loại hóa đơn là bắt buộc" })}
              className="form-control"
            >
              <option value="">Chọn loại hóa đơn</option>
              <option value="Phí điện nước">Phí điện nước</option>
              <option value="Phí phụ trội">Phí phụ trội</option>
            </select>
            {errors.type && <p className="error-text">{errors.type.message}</p>}
          </div>

          {/* Conditional email input (only for "Phí phụ trội") */}
          {typeInput === "Phí phụ trội" && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                {...register("email", {
                  required: typeInput === "Phí phụ trội" ? "Email là bắt buộc" : false,
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                    message: "Email không hợp lệ",
                  },
                })}
                className="form-control"
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}

              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        reset({ email: suggestion });
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {typeInput === "Phí điện nước" && (
            <>
              <div className="form-group">
                <label>Số phòng</label>
                <input
                  type="text"
                  {...register("roomNumber", { required: "Số phòng là bắt buộc" })}
                  className="form-control"
                />
                {errors.roomNumber && <p className="error-text">{errors.roomNumber.message}</p>}
              </div>

              <div className="form-group">
                <label>Số điện</label>
                <input
                  type="number"
                  {...register("electricityUsage", { min: 0 })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Số nước</label>
                <input
                  type="number"
                  {...register("waterUsage", { min: 0 })}
                  className="form-control"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Số tiền</label>
            <input
              type="number"
              {...register("amount", {
                required: "Số tiền là bắt buộc",
                min: {
                  value: 1,
                  message: "Số tiền phải lớn hơn 0",
                },
              })}
              className="form-control"
              readOnly={typeInput === "Phí điện nước"}
            />
            {errors.amount && <p className="error-text">{errors.amount.message}</p>}
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "Mô tả không được vượt quá 200 ký tự",
                },
              })}
              className="form-control"
              readOnly={typeInput === "Phí điện nước"}
            />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Tạo
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
