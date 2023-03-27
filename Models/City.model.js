const mongoose = require("mongoose");

const citySchema = mongoose.Schema({
  userID: { type: String, required: true },
  city: { type: String, required: true },
});

const CityModel = mongoose.model("city", citySchema);

module.exports = { CityModel };
