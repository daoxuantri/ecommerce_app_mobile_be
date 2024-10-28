const Product = require("../models/products");
const Brand = require("../models/brands");
const Category = require("../models/categories");



const allSort = async ({findProduct, brand, sort })=>{ 
    let semiFinal = findProduct || [];

    // Lọc theo nhãn hiệu nếu có
    if (brand) {
        const brandObj = await Brand.findOne({ name: { $regex: brand, $options: 'i' } }).select('_id');
        if (brandObj) {
            semiFinal = semiFinal.filter(item => item.brand && item.brand.toString() === brandObj._id.toString());
        } else {
            // Nếu không tìm thấy brand thì trả về mảng rỗng
            semiFinal = [];
        }
    }
    // Sắp xếp theo tiêu chí sort
    if (sort === 'pASC') semiFinal.sort((a, b) => a.price - b.price);      // Sắp xếp giá tăng dần
    if (sort === 'pDESC') semiFinal.sort((a, b) => b.price - a.price);     // Sắp xếp giá giảm dần
    if (sort === 'rASC') semiFinal.sort((a, b) => a.rating - b.rating);    // Sắp xếp đánh giá tăng dần
    if (sort === 'rDESC') semiFinal.sort((a, b) => b.rating - a.rating);   // Sắp xếp đánh giá giảm dần

    console.log("Sản phẩm sau sắp xếp:", semiFinal);
    return semiFinal;
};

const fillInfoListProducts = async (semiFinals) => {
    const result = [];
    for (const product of semiFinals) {
        const found = await Product.findById(product._id).select("name price rating brand category images");
        const productWithImage = {
            _id: found._id,
            name: found.name,
            price: found.price,
            rating: found.rating,
            brand: found.brand,
            category: found.category,
            image: found.images[0],
        };
        
        
        
        result.push(productWithImage);  
    }

    return result;
};
 
module.exports = {  allSort, fillInfoListProducts };