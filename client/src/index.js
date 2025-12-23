import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SocketProvider } from "./context/SocketProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);
