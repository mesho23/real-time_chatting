var nodemailer = require('nodemailer');

const { gen } = require('n-digit-token');




function sendauthcode(email){
  console.log(email)

    return new Promise((resolve,reject) => {
        let code = gen(6);
 var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'yourEmail',
          pass: 'yourPassword'
        }
      });
      
      var mailOptions = {
        from: 'yourEmail',
        to: email,
        subject: 'dummyorg authentication',
        text: 'your authentication is: '+ code +' please dont share this with anyone'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return null;
        } else {
          console.log('Email sent: ' + info.response);
          resolve(code);
        }
      }); 
      return code;
    })
    


   
}




module.exports = {sendauthcode};

