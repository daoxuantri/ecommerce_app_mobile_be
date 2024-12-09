const Order = require("../models/orders"); 
const Cart = require("../models/carts"); 


exports.createorder = async (req, res, next) => {
    const { user, productItem, informationUser} = req.body;

    try {
        // Kiểm tra dữ liệu đầu vào
        if (!user || !productItem || !informationUser) {
            return res.status(404).json({
                success: false, 
                message: "Kiểm tra lại đầy đủ thông tin"
            })
        }
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
            infomationUser: {
                address: informationUser.address,
                phone: informationUser.phone,
                name: informationUser.name,
            },
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
        const { status } = req.query; // Lấy trạng thái từ query parameters

        // Tạo điều kiện lọc
        const filter = { user: iduser };
        if (status) {
            filter.orderStatus = status; // Thêm điều kiện nếu có trạng thái
        }

        // Tìm tất cả các đơn hàng theo điều kiện
        const findAllOrder = await Order.find(filter).select('-createdAt -updatedAt -__v');

        return res.status(200).json({
            success: true,
            message: "Danh sách đơn hàng",
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


exports.statisticProduct = async (req, res, next) => {
    try {
        const orderStatuses = ['PROGRESS', 'COMPLETED', 'CANCELED'];

        const orderStatistics = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$total" },
                },
            },
            {
                $addFields: {
                    orderStatus: "$_id"
                },
            },
            {
                $project: {
                    _id: 0,
                    orderStatus: 1,
                    count: 1,
                    totalAmount: 1,
                },
            },
        ]);

        const completeStatistics = orderStatuses.map((status) => {
            const stat = orderStatistics.find((s) => s.orderStatus === status);
            return {
                orderStatus: status,
                count: stat ? stat.count : 0,
                totalAmount: stat ? stat.totalAmount : 0,
            };
        });

        const completedOrders = await Order.find({ orderStatus: 'COMPLETED' });

        const productSales = {};

        completedOrders.forEach((order) => {
            order.productItem.forEach((item) => {
                const productId = item.product.toString();
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: item.name,
                        quantity: 0,
                        productId: productId,
                        images: item.images,
                    };
                }
                productSales[productId].quantity += item.quantity;
            });
        });

        const sortedProducts = Object.values(productSales).sort(
            (a, b) => b.quantity - a.quantity
        );

        const top10Products = sortedProducts.slice(0, 10);

        const topUsers = await Order.aggregate([
            {
                $group: {
                    _id: "$user",
                    totalSpent: { $sum: "$total" },
                },
            },
            {
                $sort: { totalSpent: -1 },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    email: "$userDetails.email",
                    username: "$userDetails.username",
                    totalSpent: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            message: "Thống kê sản phẩm, trạng thái đơn hàng và người dùng",
            data: {
                topProducts: top10Products,
                orderStatistics: completeStatistics,
                topUsers: topUsers,
            },
        });
    } catch (error) {
        next(error);
    }
};



