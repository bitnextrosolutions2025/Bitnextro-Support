// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../lib/firebase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const googleSignIn = async() =>{
    const result = await signInWithPopup(auth, provider);
    return  result
   
}
  const logout = () => signOut(auth);

  return (
    <AuthCtx.Provider value={{ user, loading, googleSignIn, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
