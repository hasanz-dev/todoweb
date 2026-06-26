import React, {createContext, useState, useContext} from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const loginUser = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('token', userToken);
    };

    const logoutUser = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const isAuthenticated = () => {
        return token !== null;
    };

    return (
        <AuthContext.Provider value={{user, token, loginUser, logoutUser, isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    return useContext(AuthContext);
};