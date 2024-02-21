const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dbConfig = require('./config/db');
const {unless} = require('express-unless');
const middleware = require('./middlewares/error')
const app = express();
dotenv.config();



mongoose.connect(dbConfig.db).then(
    () => {
        console.log("Database Connected");
    },(error) =>{
        console.log("Database can't be connected" + error);
    }
)
app.use(express.json());
app.use("/brands", require("./routes/brands.routes"));
app.use("/carts", require("./routes/carts.routes"));
app.use("/categories", require("./routes/categories.routes"));
app.use("/orders", require("./routes/orders.routes"));
app.use("/products", require("./routes/products.routes"));
app.use("/reviews", require("./routes/reviews.routes"));
app.use("/sales", require("./routes/sales.routes"));
app.use("/users", require("./routes/users.routes"));
// app.use(
//     (req,res,next) =>{
//         auth
//     }
// )



app.use((err, req, res, next) => {
    const statusCode = err.status || 500;  
    const errorMessage = err.message || 'Đang có một số lỗi xảy ra!';
    return res.status(statusCode).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
    });
});
app.listen(process.env.PORT || 4000 ,()=> {
    console.log("Ready!!");
} )



