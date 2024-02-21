const bcryptjs =require("bcryptjs");
const User = require("../models/users");
const Brand = require("../models/brands");
const Cart = require("../models/carts");
const Category = require("../models/categories");
const Order = require("../models/orders");
const Product = require("../models/products");
const Review = require("../models/reviews");
const Sale = require("../models/sales");


const auth = require("../middlewares/auth");



exports.register = async (req, res, next) => {
    try {
        const {username , password, email } = req.body;

        const salt = bcryptjs.genSaltSync(10);

        req.body.password = bcryptjs.hashSync(password, salt);

        if(username ===  undefined || username === "" || email ===  undefined || email === "" ){
            return res.status(404).send({
                success: false,
                message:"Vui lòng nhập đầy đủ các thông tin"
            })
        };

        const user = await User.findOne({ username });

        if (user) {
            return res.status(201).send({
                success: false,
                message: "Username đã tồn tại vui lòng đăng kí mới"
            })
        };

        const emails = await User.findOne({ email });

        if (emails) {
            return res.status(201).send({
                success: false,
                message: "Email đã tồn tại vui lòng đăng kí mới"
            })
        };

        const newUser = new User({
            username: username,
            password: req.body.password,
            email: email,
        });
        const saveUser = await newUser.save();
        if (!saveUser) {
            return res.status(404).send({
                success: false,
                message: "Đăng Ký User Mới Không Thành Công!"
            });
        }
        // res.status(200).send({
        //     success: true,
        //     message: "Đăng Ký User Mới Thành Công!",
        //     data: newUser
        // });
        res.status(200).send({success: true, ...newUser.toJSON()});
    } catch (err) {
        next(err);
    }
};


exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (email === "" || password === ""){
            return res.status(201).send({
                success: false,
                message:" Vui lòng nhập đầy đủ các trường!"
            });
        }
        
        const resultUser = await User.findOne({email});
        if (!resultUser) {
            return res.status(201).send({
                success: false,
                message: "Người dùng không tồn tại!"
            });
        }

        const isCorrectPassword = bcryptjs.compareSync(req.body.password, resultUser.password);
        console.log(isCorrectPassword)
        if (!isCorrectPassword) return res.status(201).send({
            success: false,
            message: "Sai mật khẩu!"
        });

        if (isCorrectPassword && resultUser){
            const access_token = auth.generateAccessToken(resultUser._id); 
            // const { password, createdAt, updatedAt, _v , role , ...others} = resultUser._doc;
            return res.status(200).json({ success: true, ...resultUser.toJSON(), access_token });
            
        }

            
    } catch (err) {
        return next(err);
    }
};
