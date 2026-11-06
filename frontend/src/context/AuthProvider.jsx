import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// ✅ Hook correcto para usar el contexto
export const useAuthContext = () => useContext(AuthContext);
