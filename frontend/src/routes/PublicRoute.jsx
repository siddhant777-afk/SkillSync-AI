import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const PublicRoute = ({ children }) => {
  return children;
};

export default PublicRoute;