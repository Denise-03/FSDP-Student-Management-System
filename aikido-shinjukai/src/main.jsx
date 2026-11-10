// Kenneth S10275014
// This file just starts React and shows <App /> inside the #root div
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css"; // your same CSS file, nothing changed

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
