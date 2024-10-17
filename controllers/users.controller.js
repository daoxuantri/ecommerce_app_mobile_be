const bcryptjs =require("bcryptjs");
const User = require("../models/users");
const Cart = require("../models/carts");
const Coupon = require("../models/coupons");
const auth = require("../middlewares/auth");




exports.register = async (req, res, next) => {
    try {
        const {username , email, password, contact } = req.body;

        const images = "https://res.cloudinary.com/dpczlxs5i/image/upload/v1727797764/kltn/nvhplrsb52daynbjfcnv.png";
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
            images: images
        });
        const saveUser = await newUser.save();
        if (!saveUser) {
            return res.status(201).send({
                success: false,
                message: "Đăng ký user mới không thành công!"
            });
        }
        //create cart
        const findUser = await User.findOne({email : email });
        const createNewCart = new Cart({user : findUser._id});
        const createCart = await createNewCart.save();

        //create coupon 
        const newCoupon =  new Coupon({user: findUser._id});
        const createCoupon = await newCoupon.save();
        return res.status(200).send({
            success: true,
            message: "Đăng ký user mới thành công", 
            data: {...newUser.toJSON()}});
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        
        const resultUser = await User.findOne({email});

        //kiem tra thong tin dang nhap
        if (!resultUser) {
            return res.status(201).send({
                success: false,
                message: "Thông tin đăng nhập không đúng!"
            });
        }
        //kiem tra co bi ban acc ko 
        if (!resultUser.status){
            return res.status(201).send({
                success: false,
                message: "Tài khoản của bạn bị khóa , vui lòng liên hệ với CSKH"
            })
        }
        //kiem tra mat khau
        const isCorrectPassword = bcryptjs.compareSync(req.body.password, resultUser.password);
        console.log(isCorrectPassword)
        if (!isCorrectPassword) return res.status(201).send({
            success: false,
            message: "Sai mật khẩu, vui lòng nhập lại"
        });

        if (isCorrectPassword && resultUser){
            const access_token = auth.generateAccessToken(resultUser._id); 
            return res.status(200).json({ 
                success: true, 
                message: "Đăng nhập thành công",
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




