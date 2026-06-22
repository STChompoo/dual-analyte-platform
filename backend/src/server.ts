import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import measurementRoutes from "./routes/measurement";
import { connectDB } from "./database";
dotenv.config();
connectDB();

const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  "/api/measurements",
  measurementRoutes
);


// Test API
app.get("/", (req, res) => {
  res.send("Dual-Analyte API is running");
});


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});