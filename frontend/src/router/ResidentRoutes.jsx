import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ResidentRegister from '../pages/Resident/ResidentRegister';

const ResidentRoutes = () => {
    return (
        <Routes>
            <Route path="/register" element={<ResidentRegister />} />
        </Routes>
    );
};

export default ResidentRoutes;