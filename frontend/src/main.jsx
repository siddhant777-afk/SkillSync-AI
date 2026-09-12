import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { SidebarProvider } from "./context/SidebarContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <SidebarProvider>
            <App />
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={10}
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#111827",
                },
              }}
            />
          </SidebarProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);


