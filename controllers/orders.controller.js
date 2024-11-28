const Order = require("../models/orders"); 
const Cart = require("../models/carts"); 


exports.createorder = async (req, res, next) => {
    const { user, productItem, address} = req.body;

    try {
        // Tính tổng tiền của đơn hàng
        const totalOrder = productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

        // Đảm bảo tất cả sản phẩm đều có đầy đủ thông tin `color` và `memory`
        const validatedProductItems = productItem.map((item) => {
            if (!item.color || !item.memory) {
                throw new Error(`Product item must include 'color' and 'memory': ${item.product}`);
            }
            return item;
        });

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: user,
            productItem: validatedProductItems,
            total: totalOrder,
            address: address,
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Tìm giỏ hàng của người dùng
        const findCart = await Cart.findOne({ user: user });
        if (!findCart) {
            throw new Error("Cart not found for the user");
        }

        // Cập nhật giỏ hàng: Loại bỏ sản phẩm trong giỏ dựa trên `product`, `color`, và `memory`
        const productIdsWithDetails = validatedProductItems.map((item) => ({
            product: item.product,
            color: item.color,
            memory: item.memory,
        }));

        const updatedCart = await Cart.findOneAndUpdate(
            { user: user },
            {
                $pull: {
                    productItem: {
                        $or: productIdsWithDetails.map((item) => ({
                            product: item.product,
                            color: item.color,
                            memory: item.memory,
                        })),
                    },
                },
            },
            { new: true }
        );

        if (updatedCart) {
            // Tính tổng mới cho giỏ hàng sau khi xóa các sản phẩm đã đặt hàng
            const newTotal = updatedCart.productItem.reduce(
                (acc, cur) => acc + cur.price * cur.quantity,
                0
            );
            updatedCart.total = newTotal;
            await updatedCart.save();
        }

        // Phản hồi thành công
        return res.status(201).json({
            success: true,
            message: "Order created and cart updated successfully",
            order: newOrder,
        });
    } catch (error) {
        next(error);
    }
};



exports.getallorder = async (req, res, next) => {
    try {
        const iduser = req.params.iduser;
        const findAllOrder = await Order.find({user: iduser}).select('-createdAt -updatedAt -__v ');

        return res.status(201).json({
            success: true,
            message: "Tất cả các đơn hàng",
            order: findAllOrder,
        });
    } catch (error) {
        next(error);
    }
};



exports.getorderonstatus = async (req, res, next) => {
    const { user, productItem, address} = req.body;

    try {
        // Tính tổng tiền của đơn hàng
        const totalOrder = productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

        // Đảm bảo tất cả sản phẩm đều có đầy đủ thông tin `color` và `memory`
        const validatedProductItems = productItem.map((item) => {
            if (!item.color || !item.memory) {
                throw new Error(`Product item must include 'color' and 'memory': ${item.product}`);
            }
            return item;
        });

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: user,
            productItem: validatedProductItems,
            total: totalOrder,
            address: address,
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Tìm giỏ hàng của người dùng
        const findCart = await Cart.findOne({ user: user });
        if (!findCart) {
            throw new Error("Cart not found for the user");
        }

        // Cập nhật giỏ hàng: Loại bỏ sản phẩm trong giỏ dựa trên `product`, `color`, và `memory`
        const productIdsWithDetails = validatedProductItems.map((item) => ({
            product: item.product,
            color: item.color,
            memory: item.memory,
        }));

        const updatedCart = await Cart.findOneAndUpdate(
            { user: user },
            {
                $pull: {
                    productItem: {
                        $or: productIdsWithDetails.map((item) => ({
                            product: item.product,
                            color: item.color,
                            memory: item.memory,
                        })),
                    },
                },
            },
            { new: true }
        );

        if (updatedCart) {
            // Tính tổng mới cho giỏ hàng sau khi xóa các sản phẩm đã đặt hàng
            const newTotal = updatedCart.productItem.reduce(
                (acc, cur) => acc + cur.price * cur.quantity,
                0
            );
            updatedCart.total = newTotal;
            await updatedCart.save();
        }

        // Phản hồi thành công
        return res.status(201).json({
            success: true,
            message: "Order created and cart updated successfully",
            order: newOrder,
        });
    } catch (error) {
        next(error);
    }
};


exports.deleteorder = async (req, res, next) => {
    const { user, productItem, address} = req.body;

    try {
        // Tính tổng tiền của đơn hàng
        const totalOrder = productItem.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);

        // Đảm bảo tất cả sản phẩm đều có đầy đủ thông tin `color` và `memory`
        const validatedProductItems = productItem.map((item) => {
            if (!item.color || !item.memory) {
                throw new Error(`Product item must include 'color' and 'memory': ${item.product}`);
            }
            return item;
        });

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: user,
            productItem: validatedProductItems,
            total: totalOrder,
            address: address,
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Tìm giỏ hàng của người dùng
        const findCart = await Cart.findOne({ user: user });
        if (!findCart) {
            throw new Error("Cart not found for the user");
        }

        // Cập nhật giỏ hàng: Loại bỏ sản phẩm trong giỏ dựa trên `product`, `color`, và `memory`
        const productIdsWithDetails = validatedProductItems.map((item) => ({
            product: item.product,
            color: item.color,
            memory: item.memory,
        }));

        const updatedCart = await Cart.findOneAndUpdate(
            { user: user },
            {
                $pull: {
                    productItem: {
                        $or: productIdsWithDetails.map((item) => ({
                            product: item.product,
                            color: item.color,
                            memory: item.memory,
                        })),
                    },
                },
            },
            { new: true }
        );

        if (updatedCart) {
            // Tính tổng mới cho giỏ hàng sau khi xóa các sản phẩm đã đặt hàng
            const newTotal = updatedCart.productItem.reduce(
                (acc, cur) => acc + cur.price * cur.quantity,
                0
            );
            updatedCart.total = newTotal;
            await updatedCart.save();
        }

        // Phản hồi thành công
        return res.status(201).json({
            success: true,
            message: "Order created and cart updated successfully",
            order: newOrder,
        });
    } catch (error) {
        next(error);
    }
};

