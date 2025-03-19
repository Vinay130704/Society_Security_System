import React from "react";
import { Routes, Route } from "react-router-dom";
import ResidentDashboard from "../pages/Resident/ResidentDashboard";

const ResidentRoutes = () => {
  return (
    <Routes>
      <Route path="/resident-dashboard" element={<ResidentDashboard />} />
    </Routes>
  );
};

export default ResidentRoutes;
