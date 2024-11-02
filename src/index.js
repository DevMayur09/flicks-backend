import { configDotenv } from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

configDotenv({ path: "./env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Application error: ", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, (req, res) => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection failed: ", err);
  });
