const nodemailer = require("nodemailer");


let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }

});


//test transporter

transporter.verify((error,success) =>{
    if(error){
        console.log(error);
    }else{
        console.log("Ready for messages");
        console.log(success);
    }
});


const sendEmail = async (mailOptions) =>{
    try{
        await transporter.sendMail(mailOptions);
        return;
    }catch(e){
        throw e;
    }
}

module.exports = sendEmail;
