import { Outlet } from "react-router-dom";
import Header from "../shared/Header";
import Footer from "../shared/Footer";
import AnimatedBackground from "../shared/AnimatedBackground";

export default function App() {
  return (
    <div className="min-h-screen relative bg-[#060b22] text-slate-100">
      <AnimatedBackground />
      <Header />
      <main className="relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}