import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace state={{ message: "Please login first" }} />;
  }

  try {
    const decoded = jwtDecode(token);

    // If allowedRoles is defined and user role not included
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return (
        <Navigate
          to="/home"
          replace
          state={{ message: "You are not authorized to access this page" }}
        />
      );
    }

    return children;
  } catch (error) {
    localStorage.removeItem("token");
    return (
      <Navigate to="/" replace state={{ message: "Invalid or expired token" }} />
    );
  }
}

export default ProtectedRoute;
