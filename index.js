const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dbConfig = require('./config/db');
const auth=require('./middlewares/auth');
const {unless} = require('express-unless');
const middleware = require('./middlewares/error')
const app = express();
dotenv.config();


const cors = require("cors");


app.use(
    cors({
        credentials: true,
        origin: true,
    }),
);



mongoose.connect(dbConfig.db).then(
    () => {
        console.log("Database Connected");
    },(error) =>{
        console.log("Database can't be connected" + error);
    }
)
app.use(express.json());

app.use("/brands", require("./routes/brands.routes"));
app.use("/categories", require("./routes/categories.routes"));
app.use("/banners", require("./routes/banners.routes"));

app.use("/users", require("./routes/users.routes"));
app.use("/employees", require("./routes/employees.routes"));


app.use("/carts", require("./routes/carts.routes"));

// app.use("/bills", require("./routes/bills.routes"));
app.use("/orders", require("./routes/orders.routes"));


app.use("/products", require("./routes/products.routes"));
app.use("/productdetails", require("./routes/productdetails.routes"));
app.use("/variants", require("./routes/variants.routes"));
app.use("/favourites", require("./routes/favourites.routes")); 
app.use("/reviews", require("./routes/reviews.routes")); 



// app.use(
//     (req,res,next) =>{
//         auth
//     }
// )



app.use((err, req, res, next) => {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send({
      success: false,
      message: err.message
    });
  });
app.listen(process.env.PORT || 4000 ,()=> {
    console.log("Ready!!");
} )



