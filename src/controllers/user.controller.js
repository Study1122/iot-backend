import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

//create a metod for genrating access and rerresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

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
  //generate Access And RefreshTokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

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
  .json(new ApiResponse(200, "User logged In",
  { accessToken, user }
  ))
})

const userProfile = asyncHandler(async (req, res)=>{
  const user = req.user
  
  return res
  .status(200)
  .json(new ApiResponse(200, "User profile fetched successfully", user))
})

//refresh accessToken
const refreshAccessToken = asyncHandler(async (req, res) =>{
  let incomingRefreshedToken;
  try {
    incomingRefreshedToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshedToken) {
      throw new ApiError(401, "Refresh Token missing!!!");
    }
  } catch (err) {
    throw new ApiError(401, "User not found or token expired!!, login again", {
      err,
    });
  }

  let decodedRefreshedToken;
  try {
    decodedRefreshedToken = await jwt.verify(
      incomingRefreshedToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh tokens!!!", { error });
  }

  //fetch data from db using decodedRefreshedToken
  const user = await User.findById(decodedRefreshedToken?._id).select("+refreshToken");
  //check refresh Tokens
  if (!user || !user.refreshToken.includes(incomingRefreshedToken)) {
    throw new ApiError(401, "Token reuse detected");
  }

  //generate new refresh Token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // add new refresh token
  user.refreshToken = user.refreshToken.filter(
    (token) => token !== incomingRefreshedToken
  );
  user.refreshToken.push(refreshToken);

  // save once
  await user.save({ validateBeforeSave: false });

  //cookies options
  const newCookiesOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, newCookiesOptions)
    .cookie("refreshToken", refreshToken, newCookiesOptions)
    .json(
      new ApiResponse(200, `Tokens refreshed successfully`, {
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res)=>{
  const existingToken = req.cookies?.refreshToken || req.body?.refreshToken
  if(!existingToken){
    throw new ApiError(401, "Token expired")
  }
  
  const user = await User.findOne({refreshToken: { $in: [existingToken]}}).select("+refreshToken")
  //wipe out current session only
  user.refreshToken = (user.refreshToken.filter(
    token => token !== existingToken
  ));
  await user.save({validateBeforeSave: false})
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, "Logged out successfully")
    );
  
})
export {registerUser, loginUser, userProfile, refreshAccessToken, logoutUser}