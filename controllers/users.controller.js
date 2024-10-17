const bcryptjs =require("bcryptjs");
const User = require("../models/users");
const Cart = require("../models/carts");

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
                message: "Đăng Ký User Mới Không Thành Công!"
            });
        }

        //create cart
        const findUser = await User.findOne({email : email });
        const createNewCart = new Cart({user : findUser._id});
        const createCart = await newCart.save();

        //create coupon 
        const newCoupoon = new Coupon({user: findUser._id});
        const createCoupon = await newCoupon.save();
        



        return res.status(200).send({success: true, data: {...newUser.toJSON()}});
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




