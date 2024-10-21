const Cart = require("../models/carts"); 
const User = require("../models/users"); 
const Product = require("../models/products"); 


//tao gio hang cho users

//tạo tạm thời (add trong lúc tạo login)
exports.createcart = async (req, res, next) => {
    const userId = req.body.id;
    try {
        const existingCart = await Cart.findOne({ user: userId });
        if (existingCart) {
            return res.status(201).json({
                success: true,
                message: "Lỗi!"
            });
        }
        const newCart = new Cart({
            user: userId
        });
        const createCart = await newCart.save();
        return res.status(201).json({
            success: true,
            message: "Tạo giỏ hàng cho người dùng thành công"
        });
    } catch (error) {
        next(error);
    }
};

//lay tat ca san pham gio hang cho users
exports.getcartbyuser = async (req, res, next) => {
    const userId = req.params.id;
    try {
        const existingCart = await Cart.findOne({ user: userId }).select("-__v -updatedAt -createdAt");
        return res.status(200).json({
            success: true,
            data: existingCart
        });
    } catch (error) {
        next(error);
    }
};


//lay tat ca san pham gio hang cho users
exports.addproduct = async (req, res, next) => {
    const { user, product, quantity } = req.body;
    try {
        // B1: Tìm giỏ hàng của người dùng
        const findCart = await Cart.findOne({ user: user }).select("-__v -updatedAt -createdAt");
         
        if (!findCart) {
            return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng người dùng" });
        }

        // B2: Tìm sản phẩm cần thêm vào giỏ hàng
        const findProduct = await Product.findById(product).select("-__v -updatedAt -createdAt");
        if (!findProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        // Tạo đối tượng sản phẩm để thêm vào giỏ hàng
        const itemInCart = {
            product: product,
            name: findProduct.name,
            quantity: quantity,
            images: findProduct.images,
            price: findProduct.price
        };

        // B3: Kiểm tra số lượng sản phẩm còn trong kho nếu cần (có thể thêm logic kiểm tra kho)
        //(bỏ qua)
        // B4: Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = findCart.productItem.findIndex(item => item.product.equals(product));

        if (existingItemIndex === -1) {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
            findCart.productItem.push(itemInCart);
        } else {
            // Nếu sản phẩm đã có, cập nhật số lượng
            findCart.productItem[existingItemIndex].quantity += quantity;
        }

        // B5: Tính lại tổng tiền
        findCart.total = findCart.productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

        // Lưu giỏ hàng sau khi cập nhật
        await findCart.save();

        return res.status(200).json({
            success: true,
            message: "Thêm sản phẩm thành công",
            cart: findCart
        });
    } catch (error) {
        next(error);
    }
};


//xoa sp trong cart cua user
exports.removeproduct = async (req, res, next) => {
    const { user, product } = req.body;
    try {
    //B1:
    const isItemExist = await Cart.findOne({
        user: user,
        "productItem.product": product,
    })
    if (!isItemExist) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng của user" });
    //B2: 
        const result = await Cart.findOneAndUpdate(
            { user: user },
            {
                $pull: { productItem: { product: product } }
            },
            { new: true }
        );
    //B3: Cap nhat total gio hang
    const findCart = await Cart.findOne({user : user});
    findCart.total = findCart.productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

    // Lưu giỏ hàng sau khi cập nhật
    await findCart.save(); 
    
    return res.status(200).json({
            success: true,
            message: "Cập nhật thành công",
        });
    } catch (error) {
        next(error);
    }
};












