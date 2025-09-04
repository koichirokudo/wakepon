// src/Layout.tsx
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Drawer from "./components/ui/Drawer";
import { useAuth } from "./contexts/AuthContext";
import '@fontsource-variable/m-plus-1';

export default function Layout() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate('/signin');
  }

  return user && (
    <div className={`main ${isDrawerOpen ? "shift" : ""}`}>
      <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}