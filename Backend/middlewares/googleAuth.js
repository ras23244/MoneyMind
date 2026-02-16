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

        const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173')
            .replace(/\/$/, '');

        // Send tokens via URL fragment for frontend to capture (avoids cross-site cookie issues)
        const fragment = `accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;
        return res.redirect(`${frontendBase}/oauth-success#${fragment}`);

    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = googleAuth;
