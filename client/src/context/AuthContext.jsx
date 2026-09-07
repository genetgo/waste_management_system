import { createContext, useContext, useEffect, useState } from "react";
import socket from "../services/socket";
export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  const [role, setRole] = useState(
    localStorage.getItem("role") || ""
  );

  const [loading, setLoading] = useState(true);


  // Restore Session
  useEffect(() => {

    const storedUser = localStorage.getItem("user");


    if (storedUser) {

      const parsedUser = JSON.parse(storedUser);


      setUser({
        ...parsedUser,
        id:
          parsedUser.id ||
          parsedUser.admin_id ||
          parsedUser.user_id
      });


      setRole(parsedUser.role);

    }


    setLoading(false);


  }, []);


//login
  const login = ({ userData, jwtToken }) => {


 setUser(userData);
 setToken(jwtToken);
 setRole(userData.role);


 localStorage.setItem(
   "user",
   JSON.stringify(userData)
 );


 localStorage.setItem(
   "token",
   jwtToken
 );


 localStorage.setItem(
   "role",
   userData.role
 );


};
  // Logout
  const logout = () => {


    setUser(null);

    setToken("");

    setRole("");


    localStorage.removeItem("user");

    localStorage.removeItem("token");

    localStorage.removeItem("role");


  };



  return (

    <AuthContext.Provider

      value={{

        user,

        token,

        role,

        loading,

        login,

        logout,

        isAuthenticated: !!token,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

};



export const useAuth = () =>
  useContext(AuthContext);