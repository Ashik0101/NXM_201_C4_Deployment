const express = require("express");
require("dotenv").config();
const { UserModel } = require("../Models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cli } = require("winston/lib/winston/config");
const { client } = require("../config/redisdb");
const userRouter = express.Router();
userRouter.use(express.json());

//register route is here
userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const isUserPresent = await UserModel.find({ email });
    if (isUserPresent.length) {
      return res.send("User Already Registered Login now...");
    }
    bcrypt.hash(password, 5, (err, encrypted) => {
      if (err) {
        return res.send("some error while hasing the password !");
      } else {
        const user = new UserModel({ name, password: encrypted, email });
        user.save();
        res.send({ msg: "User registered successfully !" });
      }
    });
  } catch (err) {
    res.send("Some error while registering ");
    console.log("some error while regisering :", err);
  }
});

//login route is here
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const isUserPresent = await UserModel.find({ email });
    if (!isUserPresent) {
      return res.send("Please register first !");
    }

    //generating jwt token
    const token = jwt.sign(
      { userID: isUserPresent[0]._id },
      process.env.SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );
    res.send({ token });
  } catch (err) {
    res.send("some error from catch block while login ");
    console.log("some error while login:", err);
  }
});

//logout route is here
userRouter.post("/logout", async (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  console.log(token);
  try {
    await client.rPush("black_tokens", token);
    res.send("User logout successfulll");
  } catch (err) {
    res.send("some error while logout");
    console.log("some error while logout :", err);
  }
});
module.exports = { msg: "login successful", userRouter };
