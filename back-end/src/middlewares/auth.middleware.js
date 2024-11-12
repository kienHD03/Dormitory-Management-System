const { getUser } = require("../services/user.service");
const { verifyAccessToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/response");
const redis = require("../utils/redis");

module.exports = async (req, res, next) => {
  try {
    const accessToken = req.get("Authorization").split(" ").slice(-1).join();
    const { userId } = verifyAccessToken(accessToken);
    const user = await getUser(userId);
    req.user = user;
    req.accessToken = accessToken;
    next();
  } catch (error) {
    return errorResponse({
      res,
      status: 401,
      message: "Unauthorized",
      errors: error.message,
    });
  }
};
