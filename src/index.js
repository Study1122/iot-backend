//require('dotenv').config({path: './env'});
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./db/index.db.js";
import { app } from "./app.js"; // import app from app.js

connectDB().then(()=>{
  const PORT = process.env.PORT || 8000
  app.listen(PORT, "0.0.0.0", ()=>{
    console.log(`Server is running at port ${process.env.PORT}`)
  })
}).catch((err) => {
    console.log("ERROR: MongoDB connection failed!!!", err);
});
