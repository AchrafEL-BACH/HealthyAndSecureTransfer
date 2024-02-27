import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// @ts-ignore
const withAuth = (Component) => {
    // @ts-ignore
    const AuthComponent = (props) => {
        if (sessionStorage.getItem('isAuthenticated') === 'true') {
            return <Component {...props} />;
        }

        return <Navigate to="/login" />;
    };

    return AuthComponent;
};

export default withAuth;