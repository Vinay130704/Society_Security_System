// src/router/ResidentRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ResidentLayout from "../components/ResidentSidebar";
import ResidentDashboard from "../pages/Resident/ResidentDashboard";
import ProfileEdit from "../pages/Resident/Profileedit";
import ResidentVisitor from "../pages/Resident/VisitorRegister";

const ResidentRoutes = () => {
  return (
    <Routes>
      <Route element={<ResidentLayout />}>
        <Route path="resident-dashboard" element={<ResidentDashboard />} />
        <Route path="resident-profile" element={<ProfileEdit />} />
        <Route path="resident-visitor" element={<ResidentVisitor />} />
      </Route>
    </Routes>
  );
};

export default ResidentRoutes;