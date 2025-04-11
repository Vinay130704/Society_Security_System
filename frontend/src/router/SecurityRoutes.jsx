// src/router/SecurityRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SecurityLayout from "../components/SecuritySidebar";
import SecurityDashboard from "../pages/Security/SecurityDashboard";
import SecurityVisitorScan  from "../pages/Security/ScanVisitor";

const SecurityRoutes = () => {
  return (
    <Routes>
      {/* Use SecurityLayout as parent if you have one */}
      <Route element={<SecurityLayout />}>
        <Route path="security-dashboard" element={<SecurityDashboard />} />
        <Route path="scan-visitor" element={<SecurityVisitorScan  />} />

      </Route>
    </Routes>
  );
};

export default SecurityRoutes;