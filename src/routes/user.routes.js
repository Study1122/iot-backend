import { Router } from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js"
const router = Router()

router.post("/", (req,res)=>{
  console.log("hey prabhu!!!")
  res.send("User root Post working");
});
  
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;