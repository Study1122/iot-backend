
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: process.env.USE_LIMIT,
  })
);

app.use(
  express.urlencoded(
    {
      extended: true,
      limit: process.env.USE_LIMIT,
    },
    { extended: true }
  )
);
app.use(cookieParser());
app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";
import deviceRouter from "./routes/device.routes.js";
import telemetryRouter from "./routes/telemetry.routes.js";

app.get("/", (req,res)=>{
  res.send("server is online!!!");
})

app.use("/api/v1", userRouter)
app.use("/api/v1", deviceRouter);
app.use("/api/v1", telemetryRouter);

export {app}