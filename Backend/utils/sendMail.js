const nodemailer= require('nodemailer')

const sendEmail = async (data)=>{
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user:'rashmi.dubey1010@gmail.com',
                pass: process.env.APP_PASSWORD
            }
        });
        const stringOTP = data.otp.toString();
        const mailOptions = {
            from: 'rashmi.dubey1010@gmail.com',
            to: data.email,
            subject: 'Password OTP',
            text: stringOTP
        }
        const result = await transport.sendMail(mailOptions)
        

        return result;

    } catch (error) {
        console.log(error)
    }
}

module.exports = sendEmail;