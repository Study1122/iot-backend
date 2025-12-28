import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username:{
      type: String,
      required: true,
      lowercase:true,
      unique:true,
      trim:true,
    },
    email:{
      type: String,
      required: true,
      lowercase:true,
      unique:true,
      trim:true,
    },
    password:{
      type: String,
      required: true,
      select: false
    },
    accessToken: { 
      type: String, 
      select: false 
    },
    refreshToken: [{ 
      type: String, 
      select: false 
    }],
  },{timestamps: true}
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;

  this.password = await bcrypt.hash(this.password, 10);
  next;
});

//hide sensitive data from json response
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

//🧠 password validating during login

userSchema.methods.isPasswordCorrect = async function(password){
  const comparedPass = await bcrypt.compare(
  password,
  this.password)
  return comparedPass
};

export const User = mongoose.model("User", userSchema);