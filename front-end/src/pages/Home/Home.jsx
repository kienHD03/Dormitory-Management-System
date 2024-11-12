import React from 'react';
import { Link } from 'react-router-dom'; // Nhập Link từ react-router-dom
import styles from './Home.module.css'; // Tệp CSS của bạn

const Home = () => {
  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Dormitory Management</h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li><Link to="/">Trang Chủ</Link></li>
            <li><Link to="/about">Giới Thiệu</Link></li>
            <li><Link to="/rooms">Phòng</Link></li>
            <li><Link to="/register">Đăng Ký</Link></li>
            <li><Link to="/contact">Liên Hệ</Link></li>
          </ul>
        </nav>
        <Link to="/login" className={styles.loginButton}>Đăng Nhập</Link>
      </header>

      <main className={styles['main-content']}>
        
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 Dormitory Management. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
};

export default Home;
