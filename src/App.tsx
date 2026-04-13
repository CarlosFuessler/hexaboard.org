import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MatrixBackground from "../app/components/MatrixBackground";
import FlashPage from "../app/flash/page";
import HomePage from "../app/page";
import "../app/globals.css";

export default function App() {
  return (
    <BrowserRouter>
      <MatrixBackground />
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flash" element={<FlashPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
