import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signup from '../pages/Signup';
import SecurityDashboard from '../pages/Security/SecurityDashboard';

const SecurityRoutes = () => {
    return (
        <Routes>
            <Route path="/register" element={<Signup />} />
            <Route path="/security-dashboard" element={<SecurityDashboard />} />
        </Routes>
    );
};

export default SecurityRoutes;