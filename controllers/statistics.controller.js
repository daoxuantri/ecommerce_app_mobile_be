const Order = require("../models/orders"); 

const getQuarterDates = (year, quarter) => {
    const quarterMap = {
        1: { start: new Date(year, 0, 1), end: new Date(year, 2, 31) },
        2: { start: new Date(year, 3, 1), end: new Date(year, 5, 30) },
        3: { start: new Date(year, 6, 1), end: new Date(year, 8, 30) },
        4: { start: new Date(year, 9, 1), end: new Date(year, 11, 31) }
    };
    return quarterMap[quarter];
};
exports.getStatistics = async(req, res, next) => {
    try {
        const { year, quarter } = req.query;

        // Kiểm tra đầu vào
        if (!year || !quarter) {
            return res.status(400).json({ 
                message: 'Year and quarter are required' 
            });
        }
        const { start, end } = getQuarterDates(parseInt(year), parseInt(quarter));

        // Tổng hợp cho doanh thu và doanh số bán hàng theo danh mục
        const categoryStats = await Order.aggregate([
            // Match orders within the specified quarter
            {
                $match: {
                    createdAt: { 
                        $gte: start, 
                        $lte: end 
                    },
                    orderStatus: 'COMPLETED'
                }
            },
            
            // Unwind product items
            { $unwind: '$productItem' },

            // Tra cứu chi tiết sản phẩm để lấy danh mục
            {
                $lookup: {
                    from: 'products',
                    localField: 'productItem.product',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },

            // Unwind product details
            { $unwind: '$productDetails' },

            // Tra cứu chi tiết danh mục
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },

            // Unwind category details
            { $unwind: '$categoryDetails' },

            // Group by category and calculate statistics
            {
                $group: {
                    _id: '$categoryDetails._id',
                    categoryName: { $first: '$categoryDetails.name' },
                    totalRevenue: { 
                        $sum: { 
                            $multiply: ['$productItem.quantity', '$productItem.price'] 
                        } 
                    },
                    totalItemsSold: { 
                        $sum: '$productItem.quantity' 
                    },
                    uniqueProducts: { $addToSet: '$productItem.product' }
                }
            },

            // Project to format the result
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    totalRevenue: { $round: ['$totalRevenue', 2] },
                    totalItemsSold: 1,
                    uniqueProductCount: { $size: '$uniqueProducts' }
                }
            },

            // Sort by total revenue in descending order
            { $sort: { totalRevenue: -1 } }
        ]);

        res.json({
            year,
            quarter,
            categories: categoryStats
        });

    } catch (error) {
        next(error);
    }
}