const Review = require("../models/reviews"); 
const Product = require("../models/products"); 

exports.createreview = async (req, res, next) => {
  try {
    const { userId, productId, content, rating } = req.body;

    // Tạo mới review
    const newReview = new Review({
      owner: userId,
      parentProduct: productId,
      content,
      rating,
    });

    // Lưu review vào CSDL
    await newReview.save();

    // Tìm tất cả các đánh giá của sản phẩm
    const reviews = await Review.find({ parentProduct: productId });

    // Tính trung bình cộng của rating
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Cập nhật rating của sản phẩm
    const product = await Product.findById(productId);
    if (product) {
      product.rating = averageRating;
      await product.save();
    }

    return res.status(200).json({
      success: true,
      message: "Đã thêm bình luận thành công.",
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
};


exports.getallreview = async (req, res, next) => {
  try {
    const { productId } = req.body;

    // Tìm tất cả các đánh giá liên quan đến sản phẩm
    const reviews = await Review.find({ parentProduct: productId })
      .populate("owner", "email") // Populate thông tin email từ User
      .select("owner parentProduct content rating"); // Chỉ chọn các trường cần thiết

    // Trả về kết quả
    return res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        email: review.owner.email,
        rating: review.rating,
        content: review.content,
        productId: review.parentProduct,
      })),
    });
  } catch (error) {
    next(error);
  }
};


exports.deletereview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    // Tìm và xóa review
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    // Kiểm tra nếu review không tồn tại
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Bình luận không tồn tại.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa bình luận thành công.",
      deletedReview,
    });
  } catch (error) {
    next(error);
  }
};