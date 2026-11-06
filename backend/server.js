const express = require("express");
require("dotenv").config();

const { connectDB } = require("./config/db");
const membershipRoutes = require("./routes/membershipRoutes");
const classRoutes = require("./routes/classRoutes");

const app = express();

app.use(express.json());

app.use("/api/memberships", membershipRoutes);
app.use("/api/classes", classRoutes);
app.get("/", (req, res) => {
    res.send("Aikido Shinjukai API is running!");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
}

startServer();