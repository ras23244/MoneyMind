const User = require('../models/UserModel');
const { generateTokens } = require('../utils/generateToken');

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

        const tokens = generateTokens(user._id);

        // Set secure HTTP-only cookies
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', tokens.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        req.user = user;
        // Redirect to dashboard without token in query param (it's in cookie now)
        res.redirect(`http://localhost:5173/dashboard`);
    } catch (error) {
        console.error("Error in Google Auth Middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}
module.exports = googleAuth;