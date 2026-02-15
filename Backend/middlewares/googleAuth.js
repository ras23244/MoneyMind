const User = require('../models/UserModel');
const { generateTokens } = require('../utils/generateToken');

const googleAuth = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication failed - no user data from Google'
        });
    }

    const email = req.user.emails?.[0]?.value;
    const given_name = req.user.name?.givenName;
    const family_name = req.user.name?.familyName;
    const picture = req.user.photos?.[0]?.value;

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

        const { accessToken, refreshToken } = generateTokens(user._id);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173')
            .replace(/\/$/, '');

        return res.redirect(`${frontendBase}/dashboard`);

    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = googleAuth;
