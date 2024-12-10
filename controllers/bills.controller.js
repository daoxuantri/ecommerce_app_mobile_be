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
