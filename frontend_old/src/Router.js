import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Router = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <div>Login Page</div> : <Navigate to="/chat" />}
                />
                <Route
                    path="/register"
                    element={!isAuthenticated ? <div>Register Page</div> : <Navigate to="/chat" />}
                />
                <Route
                    path="/chat"
                    element={isAuthenticated ? <div>Chat Page</div> : <Navigate to="/login" />}
                />
                <Route
                    path="/"
                    element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;
