import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} DatingMatcher. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
