const { OpenAI } = require("openai");
const Review = require("../models/reviews");
const Product = require("../models/products");
const openai = new OpenAI({
  apiKey: process.env.API_KEY_OPENAI, // Thay bằng API Key của bạn hoặc dùng biến môi trường
});

exports.createreview = async (req, res, next) => {
  try {
    const { userId, productId, content, rating } = req.body;

    // Gọi OpenAI API để kiểm tra nội dung bình luận
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Is the following review appropriate? Review: "${content}"`,
        },
      ],
      temperature: 0.5,
    });

    // Phân tích phản hồi từ OpenAI
    const gptResponse = await response.choices[0].message.content.toLowerCase();

    if (
      gptResponse.includes("inappropriate") ||
      gptResponse.includes("offensive")
    ) {
      return res.status(400).json({
        success: false,
        message: "Bình luận có nội dung không phù hợp",
      });
    }

    // Nếu nội dung hợp lệ, lưu bình luận mới vào cơ sở dữ liệu
    const newReview = new Review({
      owner: userId,
      parentProduct: productId,
      content,
      rating,
    });
    await newReview.save();

    // Tính toán rating trung bình của sản phẩm
    const reviews = await Review.find({ parentProduct: productId });
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    // Cập nhật rating sản phẩm
    const product = await Product.findById(productId);
    if (product) {
      product.rating = averageRating;
      await product.save();
    }

    // Trả về phản hồi
    return res.status(200).json({
      success: true,
      message: "Đã thêm bình luận thành công",
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
};
// exports.createreview = async (req, res, next) => {
//   try {
//     const { userId, productId, content, rating } = req.body;

//     // Tạo mới review
//     const newReview = new Review({
//       owner: userId,
//       parentProduct: productId,
//       content,
//       rating,
//     });

//     // Lưu review vào CSDL
//     await newReview.save();

//     // Tìm tất cả các đánh giá của sản phẩm
//     const reviews = await Review.find({ parentProduct: productId });

//     // Tính trung bình cộng của rating
//     const averageRating =
//       reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

//     // Cập nhật rating của sản phẩm
//     const product = await Product.findById(productId);
//     if (product) {
//       product.rating = averageRating;
//       await product.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Đã thêm bình luận thành công.",
//       review: newReview,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.getallreview = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Tìm tất cả các đánh giá liên quan đến sản phẩm
    const reviews = await Review.find({ parentProduct: productId })
      .populate("owner", "email") // Populate thông tin email từ User
      .select("owner parentProduct content rating createdAt"); // Chỉ chọn các trường cần thiết

    // Trả về kết quả
    return res.status(200).json({
      success: true,
      data: reviews.map((review) => ({
        email: review.owner?.email || null,
        rating: review.rating,
        content: review.content,
        productId: review.parentProduct,
        createdAt: review.createdAt,
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

exports.getAllReview = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Calculate skip and limit
    const skip = (page - 1) * pageSize;

    // Get search keyword (if any)
    const search = req.query.search || "";

    // Create search pipeline for more comprehensive searching
    const searchStages = [
      {
        $lookup: {
          from: "users",  // Assuming the collection name for users
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails"
        }
      },
      {
        $lookup: {
          from: "products",  // Assuming the collection name for products
          localField: "parentProduct",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $match: {
          $or: [
            { content: { $regex: search, $options: "i" } },
            { "ownerDetails.username": { $regex: search, $options: "i" } },
            { "productDetails.name": { $regex: search, $options: "i" } }
          ]
        }
      }
    ];

    // Fetch reviews with search and pagination
    const reviews = await Review.aggregate([
      ...searchStages,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          content: 1,
          rating: 1,
          createdAt: 1,
          owner: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$ownerDetails",
                  as: "user",
                  in: {
                    _id: "$$user._id",
                    username: "$$user.username",
                    email: "$$user.email"
                  }
                }
              },
              0
            ]
          },
          parentProduct: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$productDetails",
                  as: "product",
                  in: {
                    _id: "$$product._id",
                    name: "$$product.name",
                    images: "$$product.images"
                  }
                }
              },
              0
            ]
          }
        }
      }
    ]);

    // Count total matching reviews
    const totalCountPipeline = [
      ...searchStages,
      { $count: "totalReviews" }
    ];

    const countResult = await Review.aggregate(totalCountPipeline);
    const totalReviews = countResult[0]?.totalReviews || 0;

    // Return results
    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
