const mongoose = require("mongoose");
const {Schema} = mongoose;

const filterSchema = new Schema ({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true,  },
    filters: [
        {
            key: { type: String, required: true }, // Tên bộ lọc (e.g., "RAM", "Chipset")
            type: { type: String, enum: ["range", "list"], required: true }, // Loại bộ lọc: "range" (khoảng giá trị) hoặc "list" (danh sách giá trị)
            values: [String], // Các giá trị cho bộ lọc dạng "list"
            range: { min: Number, max: Number } // Khoảng giá trị cho bộ lọc dạng "range"
        }
    ]
},{ timestamps: true }
);

const Filter = mongoose.model("Filter",filterSchema);
module.exports= Filter   