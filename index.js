const express = require("express");
require("dotenv").config();
const { connection } = require("./config/db");
// const { UserModel } = require("./Models/User.model");
const { userRouter } = require("./Routes/User.routes");
const { authenticate } = require("./Middlewares/authenticate");
const { validator } = require("./Middlewares/validator");
const { CityModel } = require("./Models/City.model");
const { client } = require("./config/redisdb");
const { logger } = require("./Logger/logger");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//connectin to redis
try {
  client.connect();
  console.log("Connected to redis DB !");
} catch (err) {
  console.log("Some error in connecting to redis DB !");
}

const app = express();
app.use(express.json());
app.use("/user", userRouter);

//weather fetching part is here
app.get("/weather", authenticate, validator, async (req, res) => {
  const { city } = req.query;
  const userID = req.body.userID;
  try {
    const user_city = new CityModel({ city, userID });
    user_city.save();
    console.log(city);
    const cityDataPresent = await client.get(`${city}`);
    if (cityDataPresent) {
      res.send(JSON.parse(cityDataPresent));
      console.log("Haan bhai main hoon", cityDataPresent);
    } else {
      const data = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${city},JH,IN&limit=10&appid=b328c5f12a029c6dd87fa43bc616971b`
      ).then((res) => res.json());
      console.log(data);
      const weather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${data[0].lat}&lon=${data[0].lon}&appid=b328c5f12a029c6dd87fa43bc616971b`
      ).then((res) => res.json());
      await client.setEx(`${city}`, 1800, `${JSON.stringify(weather)}`);
      res.send(weather);
    }
  } catch (err) {
    res.send({ msg: "Error in fetching weather data " });
    console.log("error in fetching the weather data :", err);
    logger.log("info", `${err.message} , ${req.method},${req.url}`);
  }
});

{
  /* <><><><><><><><><><><><><><><> */
}
//server is listening here
app.listen(process.env.port, async () => {
  try {
    console.log(`Server is running on port ${process.env.port}`);
    await connection;
    console.log("Connected to mongoDB !!");
  } catch (err) {
    console.log("Error connecting to mongoDB !");
  }
});
