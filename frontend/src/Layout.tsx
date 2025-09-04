// src/Layout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Drawer from "./components/ui/Drawer";
import '@fontsource-variable/m-plus-1';

export default function Layout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
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