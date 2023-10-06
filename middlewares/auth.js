  const jwt = require("jsonwebtoken");
  require("dotenv").config();

  const User = require("../models/User");

  exports.auth = async(req, res, next) => {
      //console.log("abhi");
      try {
          console.log(req.body)
          const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
          console.log("bbk")
          if (!token) {

              return res.status(401).json({
                  sucess: false,
                  message: "Token is missing",
              });
          }

          try {
              //console.log("check")
              const decode = jwt.verify(token, process.env.JWT_SECRET);
              console.log(decode);
              req.user = decode;
          } catch (err) {
              //console.log("check+")
              return res.status(401).json({
                  sucess: false,
                  message: "token is invalid",
              });
          }
          next();
      } catch (err) {
          //console.log("ckeck+++")
          return res.status(401).json({
              sucess: false,
              message: "Something went wrong while validating token",
          });
      }
  }

  exports.isStudent = async(req, res, next) => {
      //console.log("xr");
      try {
          if (req.user.accountType !== "Student") {
              return res.status(401).json({
                  sucess: true,
                  message: "This is a protected route for students only",
              });
          }
          next();
      } catch (err) {
          return res.status(401).json({
              sucess: false,
              message: "User role cannot be verified please try again",
          });
      }
  }

  exports.isInstructor = async(req, res, next) => {
      try {
          if (req.user.accountType !== "Instructor") {
              return res.status(401).json({
                  sucess: true,
                  message: "This is a protected route for instructors only",
              });
          }
          next();
      } catch (err) {
          return res.status(401).json({
              sucess: false,
              message: "User role cannot be verified please try again",
          });
      }
  }

  exports.isAdmin = async(req, res, next) => {
      try {
          if (req.user.accountType !== "Admin") {
              return res.status(401).json({
                  sucess: false,
                  message: "This is a protected route for admin only",
              });
          }
          next();
      } catch (err) {
          return res.status(401).json({
              sucess: false,
              message: "User role cannot be verified please try again",
          });
      }
  }