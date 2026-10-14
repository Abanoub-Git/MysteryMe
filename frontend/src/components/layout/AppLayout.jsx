import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

export function AppLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
