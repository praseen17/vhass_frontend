import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { CourseContextProvider } from "./context/CourseContext.jsx";
import { WorkshopContextProvider } from "./context/WorkshopContext.jsx";

export const server = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Log the server URL for debugging
console.log('Server URL:', server);

// Configure axios globally
axios.defaults.baseURL = server;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserContextProvider>
      <CourseContextProvider>
        <WorkshopContextProvider>
          <App />
        </WorkshopContextProvider>
      </CourseContextProvider>
    </UserContextProvider>
  </React.StrictMode>
);
