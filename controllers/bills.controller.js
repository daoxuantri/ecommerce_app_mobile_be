const Order = require("../models/orders"); 
const Bill = require("../models/bills"); 


exports.setStatusOrder = async (req, res, next) => {
    const { orderId, status } = req.body;

    try {
        // Kiểm tra thông tin đầu vào
        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin orderId hoặc status",
            });
        }

        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng",
            });
        }

        // Kiểm tra nếu trạng thái là "COMPLETED"
        if (status === "COMPLETED") {
            // Nếu đơn hàng đã thanh toán VNPay, chỉ cập nhật trạng thái
            if (order.paid) {
                order.orderStatus = status;
                await order.save();

                return res.status(200).json({
                    success: true,
                    message: "Cập nhật trạng thái đơn hàng thành công (VNPay)",
                    order,
                });
            }

            // Nếu chưa thanh toán hoặc chưa có hóa đơn, kiểm tra và tạo hóa đơn
            const existingBill = await Bill.findOne({ order: orderId });
            if (existingBill) {
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng này đã được lập hóa đơn trước đó",
                    bill: existingBill,
                });
            }

            // Tạo mã hóa đơn (billCode)
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

            // Cập nhật trạng thái đơn hàng
            order.orderStatus = status;
            await order.save();

            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái đơn hàng và tạo hóa đơn thành công",
                order,
                bill: newBill,
            });
        }

        // Cập nhật trạng thái khác ngoài "COMPLETED"
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
