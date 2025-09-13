const User = require('../models/UserModel');
const generateToken = require('../utils/generateToken');

const googleAuth = async (req, res, next) => {
    const { email, given_name, family_name, picture } = req.user?._json;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                fullname: {
                    firstname: given_name,
                    lastname: family_name
                },
                imageUrl: picture
            });
        }
        const token = generateToken(user);

        req.user = user;
        // REMOVE cookie logic
        // res.cookie('token', token, { ... });

        // Instead, redirect with token as query param
        res.redirect(`http://localhost:5173/?token=${token}`);
    } catch (error) {
        console.error("Error in Google Auth Middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}
module.exports = googleAuth;