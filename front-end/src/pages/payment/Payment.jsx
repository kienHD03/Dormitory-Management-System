import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePayOS } from "payos-checkout";
import CryptoJS from "crypto-js";
import "./Payment.css";
import Spinner from "../../components/Spinner/Spinner";
import toast from "react-hot-toast";

const Payment = ({ handleSuccess, handleCancel, data }) => {
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Để mở giao diện nhúng
  const hasCalledPayment = useRef(false); // Sử dụng useRef để giữ trạng thái giữa các lần render
  const clientId = import.meta.env.VITE_PAYOS_CLIENT_ID;
  const apiKey = import.meta.env.VITE_PAYOS_API_KEY;
  // console.log(data);
  const checkSumKey = import.meta.env.VITE_PAYOS_CHECKSUM_KEY;

  const price = data.price;

  const createSignature = (params, secretKey) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
    return CryptoJS.HmacSHA256(sortedParams, secretKey).toString(CryptoJS.enc.Hex);
  };

  // Cấu hình cho payOS
  const [payOSConfig, setPayOSConfig] = useState({
    RETURN_URL: window.location.origin, // required
    ELEMENT_ID: "embedded-payment-container", // required
    CHECKOUT_URL: null, // required
    embedded: true, // Dùng giao diện nhúng
    onSuccess: (event) => {
      if (event) {
        handleSuccess(data);
        setIsOpen(false);
      }
    },
  });

  const { open, exit } = usePayOS(payOSConfig);

  const handlePayment = async () => {
    if (hasCalledPayment.current) return;
    hasCalledPayment.current = true;

    setLoading(true);

    try {
      const apiUrl = "https://api-merchant.payos.vn/v2/payment-requests";

      const payload = {
        orderCode: Number(String(Date.now()).slice(-10)),
        amount: 10000,
        description: "",
        returnUrl: "http://localhost:5173",
        cancelUrl: "http://localhost:5173",
      };

      const signature = createSignature(payload, checkSumKey);

      const response = axios.post(
        apiUrl,
        { ...payload, signature },
        {
          headers: {
            "x-client-id": clientId,
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response;
      if (data.data.data?.checkoutUrl) {
        setPayOSConfig((oldConfig) => ({
          ...oldConfig,
          CHECKOUT_URL: data?.data?.data?.checkoutUrl,
        }));
        setIsOpen(true);
      } else {
        throw new Error("Payment link not found");
      }
    } catch (err) {
      // setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động mở giao diện nhúng khi đã có URL
  useEffect(() => {
    if (payOSConfig.CHECKOUT_URL != null) {
      open();
    }
  }, [payOSConfig, open]);

  // Chỉ gọi handlePayment một lần khi component mount
  useEffect(() => {
    handlePayment();
  }, []);

  if (loading) {
    return (
      <>
        <div className="overlay"></div>
        <Spinner />
      </>
    );
  }

  return (
    <div className="payment">
      <div className="payment-container">
        <div
          id="embedded-payment-container"
          style={{
            height: "350px",
          }}
        ></div>
        {isOpen && (
          <button
            className="cancel-button"
            onClick={() => {
              handleCancel();
              exit();
              setIsOpen(false);
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      {isOpen && <div className="overlay"></div>}
    </div>
  );
};

export default Payment;
