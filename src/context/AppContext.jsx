import React, { createContext, useState, useEffect } from "react";

// Create the context
export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);           // Logged-in user
  const [cartCount, setCartCount] = useState(0);    // Number of items in cart
  const [notifications, setNotifications] = useState([]); // Notifications list

  // Load user from local storage (optional)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user data on login/update
  const updateUser = (newUser) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  // Update cart count from dashboard
  const updateCartCount = (count) => {
    setCartCount(count);
  };

  // Add a demo notification
  const addNotification = (msg) => {
    setNotifications((prev) => [...prev, { id: Date.now(), msg }]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        cartCount,
        updateCartCount,
        notifications,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
