import { Router } from "express";
import { registerUser, loginUser, userProfile, refreshAccessToken, logoutUser } from "../controllers/user.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js";
const router = Router()

router.post("/", (req,res)=>{
  console.log("hey prabhu!!!")
  res.send("User root Post working");
});
  
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/users/profile", authMiddleware, userProfile);
router.post("/users/refresh_token", refreshAccessToken);
router.post("/users/logout", logoutUser);

export default router;