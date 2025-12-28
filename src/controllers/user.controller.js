import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res)=>{
  const {username, email, password} = req.body || {}
  
  if(!username || !email || !password){
    throw new ApiError(300, "All fields required!!")
  }
  
  //check user already exists
  const existingUser = await User.findOne(
    {
      $or:[{email}, {username}]
    }
  );
  
  if(existingUser){
    throw new ApiError(300, "User already exist!!")
  }
  //save user in database
  const user = await User.create({
    username,
    email,
    password
  })
  
  res
  .status(200)
  .json(new ApiResponse(200, "User Registered successfully", {user}))
  
});

const loginUser = asyncHandler(async (req, res)=>{
  let {username, password} = req.body || {}
  
  username = req.body.username?.trim();
  password = req.body.password?.trim();
  if(!username|| !password){
    throw new ApiError(300, "All fields required!!")
  }
  
  const user = await User.findOne({username}).select("+password +refreshToken")
  
  if(!user){
    throw new ApiError(404, "user not found!!!")
  }
  
  const isMatch = await user.isPasswordCorrect(password)
  if(!isMatch){
    throw new ApiError(400, "Invalid  credentials!!!");
  }
  
  const accessToken = await jwt.sign(
    {userId: user?._id},
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRES_IN}
  );
  
  const refreshToken = await jwt.sign(
    {userId: user?._id},
    process.env.JWT_REFRESH_SECRET,
    {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN}
  );
  
  user.refreshToken = refreshToken
  await user.save()
  
  const cookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  
  
  return res
  .status(200)
  .cookie("refreshToken", refreshToken, cookiesOptions)
  .cookie("accessToken", accessToken, cookiesOptions)
  .json(new ApiResponse(200, "User logged In", {user}))
  
})

export {registerUser, loginUser}