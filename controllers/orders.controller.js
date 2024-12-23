const Order = require("../models/orders");
const Cart = require("../models/carts");
const Bill = require("../models/bills");

exports.createorder = async (req, res, next) => {
  const { productItem, informationUser, paid, billCode } = req.body;
  const user = req.user._id;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!user || !productItem || !informationUser) {
      return res.status(400).json({
        success: false,
        message: "Kiểm tra lại đầy đủ thông tin",
      });
    }

    // Tính tổng tiền của đơn hàng
    const totalOrder = productItem.reduce(
      (acc, cur) => acc + cur.price * cur.quantity,
      0
    );

    // Đảm bảo tất cả sản phẩm đều có đầy đủ thông tin `color` và `memory`
    const validatedProductItems = productItem.map((item) => {
      if (!item.color || !item.memory) {
        throw new Error(
          `Product item must include 'color' and 'memory': ${item.product}`
        );
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
      paid: paid,
      billCode: billCode || null,
    });

    // Lưu đơn hàng vào database
    await newOrder.save();

    // Nếu `billCode` không phải `'COD'` và `paid` là `true`, tạo `Bill`
    if (billCode !== "COD" && paid === true) {
      const newBill = new Bill({
        order: newOrder._id,
        billCode: billCode, // Gán billCode từ request
        total: totalOrder,
        paymentMethod: "VNPAY", // Dựa trên paid: true
      });

      await newBill.save();
    }

    // Tìm giỏ hàng của người dùng
    const findCart = await Cart.findOne({ user: user });
    if (!findCart) {
      throw new Error("Cart not found for the user");
    }

    // Cập nhật giỏ hàng: Loại bỏ sản phẩm đã đặt
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
      // Tính lại tổng tiền trong giỏ hàng sau khi xóa sản phẩm đã đặt
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
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

exports.getallorder = async (req, res, next) => {
  try {
    const iduser = req.user._id;
    const { status } = req.query; // Lấy trạng thái từ query parameters

    // Tạo điều kiện lọc
    const filter = { user: iduser };
    if (status) {
      filter.orderStatus = status; // Thêm điều kiện nếu có trạng thái
    }

    // Tìm tất cả các đơn hàng theo điều kiện
    const findAllOrder = await Order.find(filter).select(
      "-createdAt -updatedAt -__v"
    );

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
  try {
    const iduser = req.user._id;
    const { status } = req.query; // Lấy trạng thái từ query parameters

    // Tạo điều kiện lọc
    const filter = { user: iduser };
    if (status) {
      filter.orderStatus = status; // Thêm điều kiện nếu có trạng thái
    }

    // Tìm tất cả các đơn hàng theo điều kiện
    const findAllOrder = await Order.find(filter).select(
      "-createdAt -updatedAt -__v"
    );

    return res.status(200).json({
      success: true,
      message: "Danh sách đơn hàng",
      order: findAllOrder,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Xóa đơn hàng
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found!" });
    }

    return res.status(200).json({ message: "Order deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.updateOrder = async (req, res, next) => {
  const { orderId } = req.params; // Lấy _id từ URL
  const updates = req.body; // Dữ liệu cần cập nhật từ request body
  console.log(`Update order`, JSON.stringify(updates));
  try {
    // Tìm order theo _id và cập nhật
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, // ID của order cần cập nhật
      { $set: updates }, // Dữ liệu cập nhật
      { new: true, runValidators: true } // Tùy chọn để trả về document mới và validate dữ liệu
    );

    // Nếu không tìm thấy order
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Trả về kết quả sau khi cập nhật
    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({
      message: "Error updating order",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId)
      .populate("user", "username email") // Nếu cần thêm thông tin từ bảng User
      .populate("productItem.product", "name price") // Nếu cần thêm thông tin sản phẩm
      .select("-__v ");
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params; // Lấy ID đơn hàng từ URL
    const { status } = req.body; // Lấy trạng thái và ID người dùng từ request body
    const idUser = req.user._id;
    // Kiểm tra trạng thái mới có phải "CANCELED" không
    if (status !== "CANCELED") {
      return res.status(400).json({
        success: false,
        message:
          "Trạng thái không hợp lệ. Chỉ có thể hủy đơn hàng với trạng thái CANCELED.",
      });
    }

    // Tìm đơn hàng theo ID và ID người dùng
    const order = await Order.findOne({ _id: orderId, user: idUser });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy đơn hàng hoặc người dùng không có quyền hủy đơn hàng này.",
      });
    }

    // Kiểm tra trạng thái hiện tại của đơn hàng
    if (order.orderStatus !== "PROGRESS") {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy đơn hàng. Trạng thái hiện tại là ${order.orderStatus}.`,
      });
    }

    // Cập nhật trạng thái đơn hàng thành "CANCELED"
    order.orderStatus = "CANCELED";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Đơn hàng đã được hủy thành công.",
      data: order,
    });
  } catch (err) {
    next(err); // Xử lý lỗi
  }
};

exports.statisticProduct = async (req, res, next) => {
  try {
    const orderStatuses = ["PROGRESS", "COMPLETED", "CANCELED"];

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
          orderStatus: "$_id",
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

    const completedOrders = await Order.find({ orderStatus: "COMPLETED" });

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

exports.getStatisticsDetails = async (req, res, next) => {
  try {
    const { year } = req.query; // Lấy năm từ query params
    const filterYear = year || new Date().getFullYear(); // Mặc định là năm hiện tại

    // Lấy các đơn hàng trong năm được yêu cầu
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${filterYear}-01-01`),
            $lt: new Date(`${parseInt(filterYear) + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
            year: { $year: "$createdAt" },
          },
          // Doanh thu chỉ tính cho trạng thái COMPLETED
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "COMPLETED"] }, "$total", 0],
            },
          },
          // Đếm số lượng đơn hàng theo từng trạng thái
          totalOrders: { $sum: 1 },
          progressCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "PROGRESS"] }, 1, 0] },
          },
          deliveryCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "DELIVERY"] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "COMPLETED"] }, 1, 0] },
          },
          canceledCount: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "CANCELED"] }, 1, 0] },
          },
        },
      },
    ]);

    // Định dạng dữ liệu đầu ra
    const monthlyStats = [];
    const quarterlyStats = [];
    const yearlyStats = {
      year: filterYear,
      totalRevenue: 0,
      totalOrders: 0,
      statusCounts: {
        PROGRESS: 0,
        DELIVERY: 0,
        COMPLETED: 0,
        CANCELED: 0,
      },
    };

    orders.forEach((order) => {
      if (order._id.year === parseInt(filterYear)) {
        // Tổng hợp số liệu cho năm
        yearlyStats.totalRevenue += order.totalRevenue;
        yearlyStats.totalOrders += order.totalOrders;
        yearlyStats.statusCounts.PROGRESS += order.progressCount;
        yearlyStats.statusCounts.DELIVERY += order.deliveryCount;
        yearlyStats.statusCounts.COMPLETED += order.completedCount;
        yearlyStats.statusCounts.CANCELED += order.canceledCount;

        // Tổng hợp số liệu cho tháng
        monthlyStats.push({
          month: order._id.month,
          totalRevenue: order.totalRevenue,
          totalOrders: order.totalOrders,
          statusCounts: {
            PROGRESS: order.progressCount,
            DELIVERY: order.deliveryCount,
            COMPLETED: order.completedCount,
            CANCELED: order.canceledCount,
          },
        });

        // Tổng hợp số liệu cho quý
        const quarterIndex = quarterlyStats.findIndex(
          (q) => q.quarter === order._id.quarter
        );
        if (quarterIndex >= 0) {
          quarterlyStats[quarterIndex].totalRevenue += order.totalRevenue;
          quarterlyStats[quarterIndex].totalOrders += order.totalOrders;
          quarterlyStats[quarterIndex].statusCounts.PROGRESS +=
            order.progressCount;
          quarterlyStats[quarterIndex].statusCounts.DELIVERY +=
            order.deliveryCount;
          quarterlyStats[quarterIndex].statusCounts.COMPLETED +=
            order.completedCount;
          quarterlyStats[quarterIndex].statusCounts.CANCELED +=
            order.canceledCount;
        } else {
          quarterlyStats.push({
            quarter: order._id.quarter,
            totalRevenue: order.totalRevenue,
            totalOrders: order.totalOrders,
            statusCounts: {
              PROGRESS: order.progressCount,
              DELIVERY: order.deliveryCount,
              COMPLETED: order.completedCount,
              CANCELED: order.canceledCount,
            },
          });
        }
      }
    });

    res.status(200).json({
      year: filterYear,
      monthlyStats,
      quarterlyStats,
      yearlyStats,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error calculating revenue statistics", error });
  }
};

