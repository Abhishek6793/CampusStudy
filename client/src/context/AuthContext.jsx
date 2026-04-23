import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';


const AuthContext = createContext(null);
// AutheContext  here is used to manage user authentication state across the app. It provides login, register, and logout functions, and stores the current user and loading state.
//  On mount, it tries to restore the session from localStorage.


// AuthProvider component wraps the app and provides the authentication context to its children. It manages the user state, loading state, and defines the login, register, and logout functions that interact with the backend API.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
    // The AuthContext.Provider wraps the children components and 
    // provides them with the authentication state and functions through the context value.
    //means that any component wrapped by AuthProvider can access the user, loading state,
    //  and authentication functions (login, register, logout) via the useAuth hook.
  );
};

// Custom hook for consuming auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  
  return ctx;
};

export { AuthContext };
