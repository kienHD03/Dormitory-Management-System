// CurrentResidence.jsx
import React, { useEffect, useState } from 'react';
import currentResidenceData from './mockCurrentResidenceApi'; // Giả lập API dữ liệu hiện tại
import styles from './Current_Residence.module.css';

const CurrentResidence = () => {
  const [currentResidence, setCurrentResidence] = useState(null);

  useEffect(() => {
    // Giả lập việc gọi API để lấy dữ liệu cư trú hiện tại
    setCurrentResidence(currentResidenceData);
  }, []);

  if (!currentResidence) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.currentResidenceContainer}>
      <h1>Thông Tin Cư Trú Hiện Tại</h1>
      <div className={styles.residenceDetails}>
        <p><strong>Tòa nhà:</strong> {currentResidence.building}</p>
        <p><strong>Phòng:</strong> {currentResidence.room}</p>
        <p><strong>Ngày Bắt Đầu:</strong> {new Date(currentResidence.startDate).toLocaleDateString()}</p>
        <p><strong>Trạng Thái:</strong> {currentResidence.status}</p>
      </div>
    </div>
  );
};

export default CurrentResidence;
