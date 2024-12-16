const Favourite = require("../models/favourites");
const Specifications = require("../models/specifications");
const VariantProduct = require("../models/variants");

exports.createfavourite = async (req, res, next) => {
  try {
    const { user } = req.body;
    const newFavourite = new Favourite({
      user: user,
    });
    const saveFavourite = await newFavourite.save();
    if (!saveFavourite) {
      return res.status(404).send({
        success: false,
        message: "Thêm mục không thành công!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Thêm mục thành công",
      data: saveFavourite,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProductId = async (req, res, next) => {
  try {
    const { userId, productId } = req.body; // Dữ liệu từ client

    // Tìm Favourite theo userId
    let favourite = await Favourite.findOne({ user: userId });

    if (!favourite) {
      // Nếu chưa có Favourite cho user này, tạo mới với productId
      favourite = new Favourite({ user: userId, productItem: [productId] });
    } else {
      // Kiểm tra nếu productId đã tồn tại trong productItem
      const productIndex = favourite.productItem.indexOf(productId);

      if (productIndex !== -1) {
        // Nếu productId tồn tại, loại bỏ nó khỏi productItem
        favourite.productItem.splice(productIndex, 1);
        // Lưu Favourite
        await favourite.save();
        return res.status(200).json({
          message: "Loại sản phẩm thành công",
        });
      } else {
        // Nếu productId không tồn tại, thêm nó vào productItem
        favourite.productItem.push(productId);
        // Lưu Favourite
        await favourite.save();
        return res.status(200).json({
          message: "Thêm sản phẩm thành công",
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating favourites",
      error: error.message,
    });
  }
};

exports.getFavouriteProducts = async (req, res, next) => {
  try {
    const { userId } = req.params; // Lấy userId từ URL params

    // Tìm Favourite theo userId và populate dữ liệu sản phẩm
    const favourite = await Favourite.findOne({ user: userId }).populate({
      path: "productItem",
      model: "Product",
      populate: [
        { path: "category", model: "Category" },
        { path: "brand", model: "Brand" },
      ],
    });

    if (!favourite) {
      return res
        .status(404)
        .json({ message: "No favourite list found for this user" });
    }

    // Xử lý thông tin chi tiết sản phẩm
    const productsDetails = await Promise.all(
      favourite.productItem.map(async (product) => {
         // Chuyển đổi sang đối tượng JSON thuần túy
         const productData = product.toObject();
        const [variants, specs] = await Promise.all([
          VariantProduct.find({ product: product._id }).lean(),
          Specifications.findOne({ productId: product._id })
            .select("specifications")
            .lean(),
        ]);

        // Dữ liệu cần lấy từ variants
        const formattedData = {
          memories: [...new Set(variants.map((v) => v.memory))],
          colors: [
            ...new Set(
              variants.flatMap((v) =>
                v.variants.map((variant) => variant.color)
              )
            ),
          ],
          initPrice: variants[0]?.variants[0]?.price.initial || null,
          discPrice: variants[0]?.variants[0]?.price.discount || null,
        };
        return {
          ...productData,
          specifications: specs,
          ...formattedData,
        };
      })
    );

    res.status(200).json({
      message: "Favourite products retrieved successfully",
      products: productsDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving favourite products",
      error: error.message,
    });
  }
};
