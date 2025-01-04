import React from 'react';
import './Header.css';
import { LuBellDot } from "react-icons/lu";

const Header = () => (
  <header className="app-header">
    <h1 className='header-heading'>Design Studio</h1>
    <div className="header-buttons">
      <button className="header-btn">Support Request</button>
      <button className="header-btn">Product Tour</button>
      <input type="text" placeholder="Search Project ..." className="search-input" />
      <LuBellDot className="bell-icon" />
      <div className="user-avatar">
        <img src="https://via.placeholder.com/40" alt="User" className="avatar-img" />
        <span>Leonardo C</span>
      </div>
    </div>
  </header>
);

export default Header;
