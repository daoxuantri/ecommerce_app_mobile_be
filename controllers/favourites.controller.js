const Favourite = require("../models/favourites");

exports.createfavourite = async (req, res, next) => {
    try {

        const {user} = req.body; 
        const newFavourite = new Favourite({
            user: user

        });
        const saveFavourite = await newFavourite.save();
        if (!saveFavourite) {
            return res.status(404).send({
                success: false,
                message: "Thêm mục không thành công!"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Thêm mục thành công",
            data: saveFavourite
        });
    } catch (err) {
        next(err);
    }
};

