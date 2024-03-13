const jwt = require('jsonwebtoken');
const User = require("../models/users");

async function authenticateToken(req, res, next) {
  // ACCESS TOKEN FROM HEADER, REFRESH TOKEN FROM COOKIE
  const token = req.headers.token;
  if (token) {
    const accessToken = token.split(" ")[1];
    try {
      const user = await jwt.verify(accessToken, process.env.JWT);
      const resultUser = await User.findOne({ _id: user?.data });
      req.user = resultUser;
      next();
    } catch (err) {
      res.status(403).json("Token is not valid!");
    }
  } else {
    res.status(401).json("You're not authenticated");
  }
};
function generateAccessToken(id){
    return jwt.sign({data: id}, process.env.JWT,{
        expiresIn: "24h"
    });
}

function generateRefreshToken(id){
  return jwt.sign({data: id}, process.env.JWT,{
      expiresIn: "24h"
  });
}
// const verifyTokenAndAdmin = (req, res, next) => {
//   const {user} = req;
//   if(!user.role) return sendError(res, "unauthorized access!");
//   next();
// };

// const sendError = (res, error, statusCode = 401) => {
//   res.status(statusCode).json({ error });
// };

const verifyTokenAndAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role) {
      next();
    } else {
      return res.status(403).json("You're not allowed to do that!");
    }
  });
};

// function 



module.exports={
    authenticateToken,
    generateAccessToken,
    verifyTokenAndAdmin,
    generateRefreshToken
};