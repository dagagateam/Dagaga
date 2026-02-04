import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useUserStore();

    if (!isLoggedIn) {
        return <Navigate to="/Login" replace />;
    }

    return children;
};

export default ProtectedRoute;
