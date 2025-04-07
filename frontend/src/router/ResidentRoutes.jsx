// src/router/ResidentRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ResidentLayout from "../components/ResidentSidebar";
import ResidentDashboard from "../pages/Resident/ResidentDashboard";

const ResidentRoutes = () => {
  return (
    <Routes>
      <Route element={<ResidentLayout />}>
        <Route path="resident-dashboard" element={<ResidentDashboard />} />
      </Route>
    </Routes>
  );
};

export default ResidentRoutes;