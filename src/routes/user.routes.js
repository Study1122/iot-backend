import { Router } from "express";
import { registerUser, loginUser, userProfile, refreshAccessToken, logoutUser } from "../controllers/user.controller.js"
import {authMiddleware} from "../middlewares/auth.middleware.js";
const router = Router()

router.post("/", (req,res)=>{
  console.log("hey prabhu!!!")
  res.send("User root Post working");
});
  
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, userProfile);
router.post("/refresh_token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;