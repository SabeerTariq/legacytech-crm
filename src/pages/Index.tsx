
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  // Instead of using useEffect and navigate, use Navigate component for immediate redirection
  return <Navigate to="/" replace />;
};

export default Index;
