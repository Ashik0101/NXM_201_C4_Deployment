const validator = (req, res, next) => {
  let city = req.query.city;
  let mySet = new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
  for (let i = 0; i < city.length; i++) {
    if (!mySet.has(city[i])) {
      return res.send("Please write correct city name !");
    }
  }
  next();
};

module.exports = { validator };
