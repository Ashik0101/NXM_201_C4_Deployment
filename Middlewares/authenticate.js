const jwt = require("jsonwebtoken");
const { UserModel } = require("../Models/User.model");
require("dotenv").config();
const authenticate = async (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      let id = decoded.userID;
      console.log(decoded);
      if (decoded) {
        req.body.userID = id;
        console.log(req.body);
        next();
      } else {
        res.send({ msg: "Wrong Credentials !" });
      }
    } else {
      res.send({ msg: "Please Login first !" });
    }
  } catch (err) {
    res.send("Some Error from authenticate middleware ");
    console.log("some error from auth middleware :", err);
  }
};

module.exports = { authenticate };
