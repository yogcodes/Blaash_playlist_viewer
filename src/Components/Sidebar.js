import React from 'react';
import './Sidebar.css';
import { FaShoppingCart, FaRegPlayCircle, FaUser, FaRegCalendarAlt, FaCogs } from 'react-icons/fa';

const Sidebar = () => (
  <div className="sidebar">
    <div className="logo">
      <h1 className='Bleash-heading'>Bleash</h1>
    </div>
    <ul>
      <li>
        <FaShoppingCart />
        <span>Revenue</span>
      </li>
      <li>
        <FaRegPlayCircle />
        <span>Shoppable Video</span>
      </li>
      <li>
        <FaUser />
        <span>Story</span>
      </li>
      <li>
        <FaUser />
        <span>Live Commerce</span>
      </li>
      <li>
        <FaUser />
        <span>Playlist Manager</span>
      </li>
      <li>
        <FaRegCalendarAlt />
        <span>Calendar</span>
      </li>
      <li>
        <FaCogs />
        <span>Hire Influencer</span>
      </li>
    </ul>
  </div>
);

export default Sidebar;
