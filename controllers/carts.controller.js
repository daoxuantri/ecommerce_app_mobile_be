const Cart = require("../models/carts"); 
const User = require("../models/users"); 
const Product = require("../models/products"); 
const VariantProduct = require("../models/variants"); 


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


// exports.addproduct = async (req, res, next) => {
//     const { user, product, quantity, memory, color } = req.body;

//     try {
//         // B1: Tìm giỏ hàng của người dùng
//         const findCart = await Cart.findOne({ user: user }).select("-__v -updatedAt -createdAt");
//         if (!findCart) {
//             return res.status(404).json({ success: false, message: "Không tìm thấy giỏ hàng người dùng" });
//         }

//         // B2: Tìm sản phẩm gốc
//         const findProduct = await Product.findById(product).select("-__v -updatedAt -createdAt");
//         if (!findProduct) {
//             return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
//         }

//         // B3: Tìm thông tin variant
//         const findVariant = await VariantProduct.findOne({ product: product, memory: memory }).select("-__v -updatedAt -createdAt");
//         if (!findVariant) {
//             return res.status(404).json({ success: false, message: "Không tìm thấy variant phù hợp" });
//         }

//         const selectedVariant = findVariant.variants.find(v => v.color === color);
//         if (!selectedVariant) {
//             return res.status(404).json({ success: false, message: "Không tìm thấy màu sắc phù hợp" });
//         }

//         const { price } = selectedVariant;

//         // Tạo đối tượng sản phẩm để thêm vào giỏ hàng
//         const itemInCart = {
//             product: product,
//             name: findProduct.name,
//             quantity: quantity,
//             images: findProduct.images[0], // Lấy hình ảnh đầu tiên
//             price: price,
//             memory: memory,
//             color: color
//         };

//         // B4: Kiểm tra sản phẩm đã có trong giỏ hàng chưa
//         // const existingItemIndex = findCart.productItem.findIndex(
//         //     item => item.product.equals(product) && item.memory === memory && item.color === color
//         // );

//         const existingItemIndex = findCart.productItem.findIndex(item => 
//             item.product.equals(product) &&
//             (item.memory === memory || (!item.memory && !memory)) &&
//             (item.color === color || (!item.color && !color))
//         );

//         if (existingItemIndex === -1) {
//             // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm mới
//             findCart.productItem.push(itemInCart);
//         } else {
//             // Nếu sản phẩm đã có, cập nhật số lượng
//             findCart.productItem[existingItemIndex].quantity += quantity;
//         }

//         // B5: Tính lại tổng tiền
//         findCart.total = findCart.productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

//         // Lưu giỏ hàng sau khi cập nhật
//         await findCart.save();

//         return res.status(200).json({
//             success: true,
//             message: "Thêm sản phẩm thành công",
//             cart: findCart
//         });
//     } catch (error) {
//         next(error);
//     }
// };

exports.addproduct = async (req, res, next) => {
    const { user, product, quantity, memory, color } = req.body;

    try {
        // Bước 1: Xác minh sản phẩm tồn tại
        const findProduct = await Product.findById(product).select("name images isStock");
        if (!findProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
        if (!findProduct.isStock) {
            return res.status(400).json({ success: false, message: "Sản phẩm đã hết hàng" });
        }

        // Bước 2: Tìm variant dựa trên product, memory và color
        const findVariant = await VariantProduct.findOne({ product, memory }).select("variants");
        if (!findVariant) {
            return res.status(404).json({ success: false, message: "Không tìm thấy variant phù hợp" });
        }

        const selectedVariant = findVariant.variants.find(v => v.color === color);
        if (!selectedVariant) {
            return res.status(404).json({ success: false, message: "Không tìm thấy màu sắc phù hợp" });
        }

        // Bước 3: Xác định giá tiền
        const price = selectedVariant.price.discount !== null
            ? selectedVariant.price.discount
            : selectedVariant.price.initial;

        // Bước 4: Tìm giỏ hàng của người dùng
        let findCart = await Cart.findOne({ user });
        if (!findCart) {
            // Nếu giỏ hàng chưa tồn tại, tạo mới
            findCart = new Cart({ user, productItem: [], total: 0 });
        }

        // Bước 5: Kiểm tra sản phẩm trong giỏ hàng
        const existingItemIndex = findCart.productItem.findIndex(item =>
            item.product.equals(product) &&
            item.memory === memory &&
            item.color === color
        );

        if (existingItemIndex === -1) {
            // Thêm sản phẩm mới vào giỏ hàng
            findCart.productItem.push({
                product,
                name: findProduct.name,
                quantity,
                images: findProduct.images[0],
                price,
                memory,
                color,
            });
        } else {
            // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
            findCart.productItem[existingItemIndex].quantity += quantity;

            // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
            if (findCart.productItem[existingItemIndex].quantity <= 0) {
                findCart.productItem.splice(existingItemIndex, 1);
            }
        }

        // Bước 6: Tính lại tổng tiền
        findCart.total = findCart.productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

        // Bước 7: Lưu lại giỏ hàng
        await findCart.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật giỏ hàng thành công",
            cart: {
                total: findCart.total,
                productItem: findCart.productItem.map(({ product, name, quantity, images, price, memory, color ,  _id}) => ({
                    product,
                    name,
                    quantity,
                    images,
                    price,
                    memory,
                    color,
                    _id
                })),
            },
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
        "productItem._id": product,
    })
    if (!isItemExist) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm trong giỏ hàng của user" });
    //B2: 
        const result = await Cart.findOneAndUpdate(
            { user: user },
            {
                $pull: { productItem: { _id: product } }
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


exports.getcartbyuser = async (req, res, next) => {
    const userId = req.params.id;

    try {
        // Tìm giỏ hàng của user
        const findCart = await Cart.findOne({ user: userId }).lean(); // Sử dụng lean để lấy plain object
        if (!findCart) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy sản phẩm trong giỏ hàng của user" 
            });
        }

        // Loại bỏ các trường không cần thiết
        const { total, productItem } = findCart; // Lấy các trường cần giữ lại

        // Trả kết quả đã lọc
        return res.status(200).json({
            success: true,
            message: "Giỏ hàng của user",
            data: {
                total,
                productItem,
            },
        });
    } catch (error) {
        next(error);
    }
};


//xoa tat ca sp trong cart cua user
exports.removeallproduct = async (req, res, next) => {
    const { user } = req.body; 
    try {
        const isCartExist = await Cart.findOne({ user: user });
        if (!isCartExist) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giỏ hàng của người dùng",
            });
        }

        isCartExist.productItem = []; 
        isCartExist.total = 0; 
        await isCartExist.save();

        return res.status(200).json({
            success: true,
            message: "Đã xóa tất cả sản phẩm",
        });
    } catch (error) {
        next(error); 
    }
};










