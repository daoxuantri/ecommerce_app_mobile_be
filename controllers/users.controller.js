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
        const {username , email, password, contact } = req.body;

        const salt = bcryptjs.genSaltSync(10);

        req.body.password = bcryptjs.hashSync(password, salt);

        
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
            contact: contact,
        });
        const saveUser = await newUser.save();
        if (!saveUser) {
            return res.status(201).send({
                success: false,
                message: "Đăng Ký User Mới Không Thành Công!"
            });
        }
        return res.status(200).send({success: true, ...newUser.toJSON()});
    } catch (err) {
        next(err);
    }
};


exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        
        const resultUser = await User.findOne({email});
        if (!resultUser) {
            return res.status(201).send({
                success: false,
                message: "Thông tin đăng nhập không đúng"
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
            return res.status(200).json({ 
                success: true, 
                data: {
                    ...resultUser.toJSON(),
                    access_token: access_token,
                },

            });
            
        }

            
    } catch (err) {
        return next(err);
    }
};


exports.resetpass = async (req, res, next) => {
    try {
        const {email, password} = req.body;


        //hashSync
        const salt = bcryptjs.genSaltSync(10);
        req.body.password = bcryptjs.hashSync(password, salt);

        const saveUser = await User.findOneAndUpdate(
            {email: email},
            {password: req.body.password},
            { new: true }
        )
        return res.status(200).json({
            success : true,
            message: "Cập nhật mật khẩu thành công."
        })

            
    } catch (err) {
        return next(err);
    }
};


