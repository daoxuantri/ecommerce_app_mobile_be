const bcryptjs =require("bcryptjs");
const Employee = require("../models/employees");  



//(role admin tạo tk employee)
exports.register = async (req, res, next) => {
    try {
        const {username , email, password, contact } = req.body;
        
        //tạo trước 1 ảnh của nhân viên ( chưa update ảnh nhân viên)
        const images = "https://res.cloudinary.com/dpczlxs5i/image/upload/v1727797764/kltn/nvhplrsb52daynbjfcnv.png";
        const salt = bcryptjs.genSaltSync(10);

        req.body.password = bcryptjs.hashSync(password, salt);
        
        const emails = await Employee.findOne({ email });

        if (emails) {
            return res.status(201).send({
                success: false,
                message: "Email đã tồn tại vui lòng đăng kí mới"
            })
        };

        const newEmployee = new Employee({
            username: username,
            password: req.body.password,
            email: email,
            contact: contact,
            images: images
        });
        const saveUser = await newEmployee.save();
        if (!saveUser) {
            return res.status(201).send({
                success: false,
                message: "Đăng ký Employee mới không thành công!"
            });
        } 
        return res.status(200).send({
            success: true,
            message: "Đăng ký employee mới thành công", 
            data: {...newUser.toJSON()}});
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        
        const resultEmployee = await Employee.findOne({email});

        //kiem tra thong tin dang nhap
        if (!resultEmployee) {
            return res.status(201).send({
                success: false,
                message: "Thông tin đăng nhập không đúng!"
            });
        } 
        //kiem tra mat khau
        const isCorrectPassword = bcryptjs.compareSync(req.body.password, resultEmployee.password);
        console.log(isCorrectPassword)
        if (!isCorrectPassword) return res.status(201).send({
            success: false,
            message: "Sai mật khẩu, vui lòng nhập lại"
        });

        if (isCorrectPassword && resultEmployee){
            const access_token = auth.generateAccessToken(resultEmployee._id); 
            return res.status(200).json({ 
                success: true, 
                message: "Đăng nhập thành công",
                data: {
                    ...resultEmployee.toJSON(),
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

        const saveUser = await Employee.findOneAndUpdate(
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



