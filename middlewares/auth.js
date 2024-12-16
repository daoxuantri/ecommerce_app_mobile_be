const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Employee = require("../models/employees");
async function authenticateToken(req, res, next) {
  // ACCESS TOKEN FROM HEADER, REFRESH TOKEN FROM COOKIE
  const token = req.headers['authorization'];
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

async function authenticateTokenAdmin(req, res, next) {
  // ACCESS TOKEN FROM HEADER, REFRESH TOKEN FROM COOKIE
  const token = req.headers['authorization'];
  if (token) {
    const accessToken = token.split(" ")[1];
    try {
      const user = await jwt.verify(accessToken, process.env.JWT);
      const resultUser = await Employee.findOne({ _id: user?.data });
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

async function authenticateLoginToken(accessToken) {
  try {
    const user = await jwt.verify(accessToken, process.env.JWT);
    const resultUser = await User.findOne({ _id: user?.data });
    if (!resultUser) {
      return false; 
    } 
    return {authenticated : true , user: resultUser};
  } catch (err) {
    return false;
  }
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
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({
      success: false,
      message: 'Token không được cung cấp',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.role !== 'admin' && decoded.role !== 'employee' && decoded.role !== 'manager') {
      return res.status(403).send({
        success: false,
        message: 'Bạn không có quyền truy cập',
      });
    }

    next(); // Cho phép tiếp tục xử lý nếu hợp lệ
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
};



module.exports={
    authenticateToken,
    generateAccessToken,
    verifyTokenAndAdmin,
    generateRefreshToken,
    authenticateLoginToken,
    authenticateTokenAdmin
};