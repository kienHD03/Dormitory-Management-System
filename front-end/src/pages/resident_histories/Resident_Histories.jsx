import React, { useEffect, useState } from "react";
import styles from "./Resident_Histories.module.css";
import axios from "../../utils/axios";
import { verifyAccessToken } from "../../utils/jwt";

const ResidentHistories = () => {
  const [histories, setHistories] = useState([]);

  const getResidentHistories = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      const user = verifyAccessToken(token);
      const response = await axios.get(`/users/resident-history/${user.id}`);
      console.log(response);
      if (response.status === 200) {
        setHistories(response.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getResidentHistories();
  }, []);

  return (
    <div className={styles.historiesContainer}>
      <h1>Lịch Sử Cư Trú</h1>
      <table className={`${styles.historiesTable} table table-striped table-hover`}>
        <thead>
          <tr>
            <th>Email</th>
            <th width="10%">Phòng</th>
            <th width="10%">Giường</th>
            <th>Ngày vào phòng</th>
            <th>Ngày kết thúc</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{history.email}</td>
              <td>{history.room}</td>
              <td>{history.bed}</td>
              <td>{new Date(history.created_at).toLocaleDateString()}</td>
              <td>{new Date(history.expired_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResidentHistories;
