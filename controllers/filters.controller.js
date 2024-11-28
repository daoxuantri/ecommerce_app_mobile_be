const Filter = require("../models/filters");

exports.createFilter = async (req, res, next) => {
    try {
        const { categoryId, filters } = req.body;

        // Kiểm tra dữ liệu hợp lệ
        if (!categoryId || !filters || filters.length === 0) {
            return res.status(400).json({ message: "Category and filters are required." });
        }

         // Kiểm tra nếu categoryId đã tồn tại
         const existingFilter = await Filter.findOne({ categoryId });
         if (existingFilter) {
             return res.status(400).json({
                 message: "Danh sách này đã có Filter, vui lòng xóa Filter đã có để thêm mới."
             });
         }

        // Tạo filter mới
        const newFilter = new Filter({ categoryId, filters });
        await newFilter.save();

        res.status(201).json(newFilter);
    } catch (error) {
        next(error);
    }
};

exports.updateFilterById = async (req, res, next) => {
    try {
        const updatedFilter = await Filter.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedFilter) return res.status(404).json({ message: "Filter not found" });
        res.status(200).json(updatedFilter);
    } catch (err) {
        next(err);
    }
};

exports.deleteFilterById = async (req, res, next) => {
    try {
        const deletedFilter = await Filter.findByIdAndDelete(req.params.id);
        if (!deletedFilter) return res.status(404).json({ message: "Filter not found" });
        res.status(200).json({ message: "Filter deleted successfully" });
    } catch (err) {
        next(err);
    }
};