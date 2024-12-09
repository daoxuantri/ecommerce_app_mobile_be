const Order = require("../models/orders"); 
const Bill = require("../models/bills"); 


exports.setStatusOrder = async (req, res, next) => {
    const { orderId, status } = req.body;

    try {
        // Kiểm tra thông tin đầu vào
        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: "Thiếu thông tin orderId hoặc status"
            });
        }

        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn hàng"
            });
        }

        // Kiểm tra nếu trạng thái đã là COMPLETED mà đã có bill thì không xử lý tiếp
        if (status === "COMPLETED") {
            const existingBill = await Bill.findOne({ order: orderId });
            if (existingBill) {
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng này đã được lập hóa đơn trước đó",
                    bill: existingBill
                });
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.orderStatus = status;
        await order.save();

        // Nếu trạng thái là COMPLETED, tạo bill
        if (status === "COMPLETED") {
            const paymentMethod = order.paid ? "VNPAY" : "COD";

            // Tạo mã hóa đơn (billCode)
            const billCode = `BILL-${Date.now()}`;

            const newBill = new Bill({
                order: order._id,
                billCode: billCode,
                total: order.total,
                paymentMethod: paymentMethod,
            });

            // Lưu bill vào database
            await newBill.save();

            return res.status(200).json({
                success: true,
                message: "Cập nhật trạng thái đơn hàng và tạo bill thành công",
                order,
                bill: newBill,
            });
        }

        // Phản hồi khi chỉ cập nhật trạng thái
        return res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái đơn hàng thành công",
            order,
        });
    } catch (error) {
        next(error);
    }
};