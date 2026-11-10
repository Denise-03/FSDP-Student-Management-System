
import React from "react";
import { createRoot } from "react-dom/client";
import GradingApplications from "./pages/GradingApplications.jsx";

createRoot(document.getElementById("grading-applications-root")).render(
    <React.StrictMode>
        <GradingApplications />
    </React.StrictMode>
);
