import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async ()=>{
  try{
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(`BD_HOST: ${connectionInstance.connection.host}\nMongoDB connected successfully`);
  }catch(err){
    console.log("MongoDB connection failed!!!")
  }
}

export default connectDB;