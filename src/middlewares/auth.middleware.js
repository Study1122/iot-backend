//verify logged in user middleware
import dotenv from "dotenv";
dotenv.config();

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const authMiddleware = asyncHandler(async (req, res, next) => {
  //get token from cookies
  const authHeader = req.headers.authorization;

  const token =
    req.cookies?.accessToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);
  if (!token) {
    throw new ApiError(401, "You are not logged in!!!");
  }
  //verify token
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decoded || !decoded._id) {
    throw new ApiError(401, "Invalid Token. Please login again!!!");
  }
  //get user id from decoded token
  const userId = decoded._id;

  //check user exists
  const existingUser = await User.findById(userId).select(
    "-password -refreshTokens"
  );
  if (!existingUser) {
    //TODO: logout user from client side
    throw new ApiError(404, "This user does not exist!!!");
  }

  //attach user to req object
  req.user = existingUser;
  next();
});

export { authMiddleware };
