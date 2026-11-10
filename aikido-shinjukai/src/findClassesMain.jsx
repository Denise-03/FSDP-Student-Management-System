import React from "react";
import { createRoot } from "react-dom/client";
import FindClasses from "./pages/FindClasses.jsx";

createRoot(document.getElementById("find-classes-root")).render(
    <React.StrictMode>
        <FindClasses />
    </React.StrictMode>
);
