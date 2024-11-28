const Category = require("../models/categories");
const Product = require("../models/products");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const VariantProduct = require("../models/variants");
const Specifications = require("../models/specifications");
const Filter = require("../models/filters");
const Brand = require("../models/brands");

//vua update & create
exports.createcategories = async (req, res, next) => {
  try {
    // Lấy link ảnh từ Cloudinary (đã upload trước đó)
    // req.body.images = req.files.map((file) => file.path);

    req.body.images = req.files[0].path;
    // Kiểm tra nếu danh mục đã tồn tại
    const existCategories = await Category.findOne({ name: req.body.name });
    if (existCategories) {
      const updatedCategories = await Category.findByIdAndUpdate(
        existCategories._id,
        {
          name: req.body.name,
          images: req.body.images,
        },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updatedCategories,
      });
    }

    const newCategories = new Category({
      name: req.body.name,
      images: req.body.images,
    });

    const saveCategories = await newCategories.save();

    return res.status(200).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: saveCategories,
    });
  } catch (err) {
    next(err);
  }
};

exports.getallcategories = async (req, res, next) => {
  try {
    const listCategories = await Category.find().select(
      "-__v -createdAt -updatedAt"
    );

    return res.status(200).send({
      success: true,
      message: "Thành công",
      data: listCategories,
    });
  } catch (err) {
    next(err);
  }
};

exports.getcatebyid = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const foundId = await Category.findById(_id);

    if (!foundId) {
      return res.status(404).send({
        success: false,
        message: "Không tìm thấy Category",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Thành công",
      data: foundId,
    });
  } catch (err) {
    return next(err);
  }
};

//delete category => delete product     (xem bo sung = > ko can thiet thi bo)
exports.deletecategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const categoryInfo = await Category.findById(categoryId);

    if (!categoryInfo) {
      return res.status(404).send({
        success: false,
        message: "Category không tồn tại!",
      });
    }
    //Update lại những sản phẩm có category = > set null ,
    await Product.updateMany(
      { category: categoryId },
      { $set: { category: null } }
    );
    // Sau khi cập nhật, tiến hành xóa category
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).send({
      success: true,
      message: "Xóa category thành công!",
    });
  } catch (err) {
    next(err);
  }
};

//lay sp theo danh muc
// exports.getallproduct = async (req, res, next) => {
//     try {
//         const categoryId = req.params.id;
//         const listProduct = await Product.find({category: categoryId, status : true});

//         if (!listProduct) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'Category không tồn tại!'});
//         }

//         return res.status(200).send({
//             success: true,
//             message: 'Danh sách sản phẩm',
//             data: listProduct
//         });

//     } catch (err) {
//         next(err);
//     }
// };

// exports.getallproduct = async (req, res, next) => {
//     try {
//         const categoryId = req.params.id;
//         const listProduct = await Product.find({category: categoryId, status : true});

//         if (!listProduct) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'Category không tồn tại!'});
//         }

//         const productsDetails = await Promise.all(
//             listProduct.map(async (product) => {
//                 const variants = await VariantProduct.find({ product: product._id });
//                 const specs = await Specifications.findOne({ productId: product._id });
//                 return {
//                     ...product.toObject(), // Chuyển đổi sản phẩm sang object để thêm properties
//                     specifications: specs ? specs.specifications : [], // Nếu không có specs, trả về mảng rỗng
//                     variants: variants ? variants : [] // Nếu không có variants, trả về mảng rỗng
//                 };
//             })
//         )
//         return res.status(200).send({
//             success: true,
//             message: 'Danh sách sản phẩm',
//             data: productsDetails
//         });

//     } catch (err) {
//         next(err);
//     }
// };
// exports.getallproduct = async (req, res, next) => {
//     try {
//         const categoryId = req.params.id;
//         const listProduct = await Product.find({category: categoryId, status : true});
//         const filtereds = await Filter.findOne({ categoryId: categoryId });
//         // Chọn trường `key` từ mỗi phần tử trong mảng `filters`
//         const keys = filtereds.filters.map(filter => filter.key);
//         if (!listProduct) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'Category không tồn tại!'});
//         }

//         const productsDetails = await Promise.all(
//             listProduct.map(async (product) => {
//                 const variants = await VariantProduct.find({ product: product._id });
//                 const specs = await Specifications.findOne({ productId: product._id }).select('specifications')
//                 const allDetails = specs.specifications.flatMap(spec => spec.details);
//                 const filteredSpecs = allDetails.filter(spec => keys.some(key => spec.key.includes(key)));
//                 console.log(filteredSpecs);

//                 return {
//                     ...product.toObject(), // Chuyển đổi sản phẩm sang object để thêm properties
//                     specifications: filteredSpecs ? filteredSpecs : [], // Nếu không có specs, trả về mảng rỗng
//                     variants: variants ? variants : [], // Nếu không có variants, trả về mảng rỗng
//                 };
//             })
//         )
//         return res.status(200).send({
//             success: true,
//             message: 'Danh sách sản phẩm',
//             data: productsDetails
//         });

//     } catch (err) {
//         next(err);
//     }
// };
exports.getallproduct = async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const { brand, minPrice, maxPrice, sort, page = 1, limit = 10, ...filters } = req.query;
  
      // Chuyển đổi `page` và `limit` sang kiểu số
      const currentPage = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;
  
      // Tìm thông tin thương hiệu
      const brandDoc = brand ? await Brand.findOne({ name: brand }).lean() : null;
  
      // Tìm thông tin các key filter của danh mục
      const filterData = await Filter.findOne({ categoryId }).select("filters").lean();
      if (!filterData) {
        return res.status(404).send({
          success: false,
          message: "Filter không tồn tại!",
        });
      }
      const filterKeys = filterData.filters.map((filter) => filter.key);
  
      // Lấy danh sách sản phẩm
      const listProduct = await Product.find({
        category: categoryId,
        brand: brandDoc ? brandDoc._id : { $exists: true },
        status: true,
      }).lean();
  
      if (!listProduct.length) {
        return res.status(404).send({
          success: false,
          message: "Không có sản phẩm nào trong danh mục!",
        });
      }
  
      // Hàm kiểm tra sản phẩm có khớp với filter hay không
      const matchFilter = (specs, filters) =>
        specs?.some((spec) => {
          const filterValue = filters[spec.key];
          if (!filterValue) return false;
          return Array.isArray(filterValue)
            ? filterValue.some((val) => spec.value.includes(val))
            : spec.value.includes(filterValue);
        });
  
      // Xử lý thông tin chi tiết sản phẩm
      const productsDetails = await Promise.all(
        listProduct.map(async (product) => {
          const [variants, specs] = await Promise.all([
            VariantProduct.find({ product: product._id }).lean(),
            Specifications.findOne({ productId: product._id }).select("specifications").lean(),
          ]);
  
          // Dữ liệu cần lấy từ variants
          const formattedData = {
            memories: [...new Set(variants.map((v) => v.memory))],
            colors: [...new Set(variants.flatMap((v) => v.variants.map((variant) => variant.color)))],
            initPrice: variants[0]?.variants[0]?.price.initial || null,
            discPrice: variants[0]?.variants[0]?.price.discount || null,
          };
  
          // Lọc thông số specifications theo key
          const filteredSpecs =
            specs?.specifications
              ?.flatMap((spec) => spec.details)
              ?.filter((detail) => filterKeys.includes(detail.key)) || [];
  
          if (Object.keys(filters).length && !matchFilter(filteredSpecs, filters)) {
            return null; // Không khớp filter
          }
  
          return {
            ...product,
            specifications: filteredSpecs,
            ...formattedData,
          };
        })
      );
  
      // Loại bỏ sản phẩm null không hợp lệ
      const validProducts = productsDetails.filter(Boolean);
  
      // Lọc theo giá (nếu có)
      const filteredByPrice = validProducts.filter((product) => {
        if (!minPrice && !maxPrice) return true;
        const price = product.discPrice || product.initPrice;
        return (
          (!minPrice || price >= parseFloat(minPrice)) &&
          (!maxPrice || price <= parseFloat(maxPrice))
        );
      });
  
      // Sắp xếp sản phẩm theo giá nếu có tham số sort
      if (sort) {
        const [sortBy, order] = sort.split('_');
        if (sortBy === 'price') {
          filteredByPrice.sort((a, b) => {
            const priceA = a.discPrice || a.initPrice;
            const priceB = b.discPrice || b.initPrice;
            return order === 'asc' ? priceA - priceB : priceB - priceA;
          });
        }
      }
  
      // Pagination - phân trang
      const totalProducts = filteredByPrice.length;
      const totalPages = Math.ceil(totalProducts / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedProducts = filteredByPrice.slice(startIndex, startIndex + pageSize);
  
      return res.status(200).send({
        success: true,
        message: "Danh sách sản phẩm",
        data: paginatedProducts,
        pagination: {
          currentPage,
          totalPages,
          totalProducts,
          pageSize,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  

exports.getAllBrand = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const listBrandId = await Product.find({
      category: categoryId,
      status: true,
    }).distinct("brand");

    if (!listBrandId) {
      return res.status(404).send({
        success: false,
        message: "Category không tồn tại!",
      });
    }

    const listBrand = await Promise.all(
      listBrandId.map(async (id) => {
        const brand = await Brand.findById(id).select("name images _id");
        return brand ? brand : null; // Trả về tên thương hiệu hoặc null
      })
    );

    return res.status(200).send({
      success: true,
      message: "Danh sách sản phẩm",
      data: listBrand,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFilterOptions = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const filterOptions = await Filter.findOne({ categoryId: categoryId });

    return res.status(200).send({
      success: true,
      message: "Filter Options",
      data: filterOptions,
    });
  } catch (err) {
    next(err);
  }
};
