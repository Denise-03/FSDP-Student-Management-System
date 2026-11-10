import React from "react";
import { createRoot } from "react-dom/client";
import MyTrainingSchedule from "./pages/MyTrainingSchedule.jsx";

createRoot(document.getElementById("training-schedule-root")).render(
    <React.StrictMode>
        <MyTrainingSchedule />
    </React.StrictMode>
);
