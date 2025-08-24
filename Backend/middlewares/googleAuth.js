const User = require('../models/UserModel');
const generateToken =require('../utils/generateToken');

const googleAuth= async(req,res,next)=>{
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
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        next();
    } catch (error) {
        console.error("Error in Google Auth Middleware:", error);
        res.status(500).send("Internal Server Error");
    }
}
module.exports=googleAuth;