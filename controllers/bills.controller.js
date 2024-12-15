const Order = require("../models/orders"); 
const Bill = require("../models/bills"); 
const Product = require("../models/products"); 


exports.setStatusOrder = async (req, res, next) => {
  const { orderId, status } = req.body;

  try {
      if (!orderId || !status) {
          return res.status(400).json({
              success: false,
              message: "Thiếu thông tin orderId hoặc status",
          });
      }

      // Tìm đơn hàng theo ID
      const order = await Order.findById(orderId).populate("productItem.product");
      if (!order) {
          return res.status(404).json({
              success: false,
              message: "Không tìm thấy đơn hàng",
          });
      }

      // Lấy trạng thái trước đó
      const previousStatus = order.orderStatus;

      // Xử lý khi chuyển từ COMPLETED sang trạng thái khác
      if (previousStatus === "COMPLETED" && status !== "COMPLETED") {
          // Tìm hóa đơn liên quan
          const existingBill = await Bill.findOne({ order: orderId });

          if (existingBill) {
              // Chỉ xóa hóa đơn nếu phương thức thanh toán là COD
              if (existingBill.paymentMethod === "COD") {
                  await Bill.deleteOne({ _id: existingBill._id }); // Xóa hóa đơn COD
              }
          }

          // Giảm số lượng bán được của sản phẩm
          for (const item of order.productItem) {
              const product = await Product.findById(item.product._id);
              if (product) {
                  product.sold -= item.quantity;
                  await product.save();
              }
          }
      }

      // Xử lý khi chuyển trạng thái thành COMPLETED
      if (status === "COMPLETED") {
          // Kiểm tra nếu đã có hóa đơn thì không tạo mới
          const existingBill = await Bill.findOne({ order: orderId });
          if (!existingBill) {
              // Tạo mã hóa đơn
              const billCode = `BILL-${Date.now()}`;
              const paymentMethod = order.paid ? "VNPAY" : "COD";

              const newBill = new Bill({
                  order: order._id,
                  billCode: billCode,
                  total: order.total,
                  paymentMethod: paymentMethod,
              });

              // Lưu hóa đơn vào database
              await newBill.save();
          }

          // Tăng số lượng bán được của sản phẩm
          for (const item of order.productItem) {
              const product = await Product.findById(item.product._id);
              if (product) {
                  product.sold += item.quantity;
                  await product.save();
              }
          }
      }

      // Cập nhật trạng thái đơn hàng
      order.orderStatus = status;
      await order.save();

      return res.status(200).json({
          success: true,
          message: "Cập nhật trạng thái đơn hàng thành công",
          order,
      });
  } catch (error) {
      next(error);
  }
};



exports.getBills = async (req, res) => {
    try {
      const {
        billCode,
        paymentMethod,
        minTotal,
        maxTotal,
        page = 1, // Mặc định trang đầu tiên
        limit = 10, // Mặc định số lượng hóa đơn trên mỗi trang
      } = req.query;
  
      // Tạo điều kiện tìm kiếm
      const filters = {};
  
      // Lọc theo mã bill (billCode)
      if (billCode) {
        filters.billCode = { $regex: billCode, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
      }
  
      // Lọc theo phương thức thanh toán
      if (paymentMethod) {
        filters.paymentMethod = paymentMethod; // Lọc theo phương thức thanh toán (VNPAY, COD)
      }
  
      // Lọc theo tổng tiền (total)
      if (minTotal || maxTotal) {
        filters.total = {};
        if (minTotal) filters.total.$gte = parseFloat(minTotal); // Tổng tiền lớn hơn hoặc bằng minTotal
        if (maxTotal) filters.total.$lte = parseFloat(maxTotal); // Tổng tiền nhỏ hơn hoặc bằng maxTotal
      }
  
      // Tính toán phân trang
      const skip = (Number(page) - 1) * Number(limit);
  
      // Lấy danh sách hóa đơn với các điều kiện
      const bills = await Bill.find(filters)
        .populate({
          path: "order", // Populates order object from Bill
          select: "_id orderStatus infomationUser total createdAt", // Lấy thông tin đơn hàng cần thiết
          populate: {
            path: "productItem.product", // Populates product item details in order
            select: "_id name price images", // Lấy thông tin sản phẩm trong đơn hàng
          },
          populate: {
            path: "productItem", // Populates user object from order
            select: "quantity memory color", // Lấy thông tin người dùng cần thiết
          }
        })
        .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo, mới nhất trước
        .skip(skip) // Bỏ qua số hóa đơn tương ứng
        .limit(Number(limit)); // Giới hạn số lượng hóa đơn trả về
  
      // Tổng số hóa đơn
      const totalBills = await Bill.countDocuments(filters);
  
      res.status(200).json({
        success: true,
        data: {
          bills,
          totalBills,
          totalPages: Math.ceil(totalBills / limit), // Tổng số trang
          currentPage: Number(page),
        },
      });
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  exports.getBillsByUser = async (req, res, next) => {
    try {
      const userId = req.params.userId;
  
      // Lấy danh sách orders liên quan đến user
      const orders = await Order.find({ user: userId }).select("_id").lean();
      if (!orders.length) {
        return res.status(404).send({
          success: false,
          message: "Người dùng không có hóa đơn nào!",
        });
      }
  
      const orderIds = orders.map((order) => order._id);
  
      // Lấy bills theo danh sách orderIds
      const bills = await Bill.find({ order: { $in: orderIds } })
        .populate("order") // Populate thông tin order
        .lean();
  
      if (!bills.length) {
        return res.status(404).send({
          success: false,
          message: "Người dùng không có hóa đơn nào!",
        });
      }
  
      return res.status(200).send({
        success: true,
        message: "Danh sách hóa đơn của người dùng",
        data: bills,
      });
    } catch (err) {
      next(err);
    }
  };
  