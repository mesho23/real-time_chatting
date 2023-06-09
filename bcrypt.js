const bcrypt = require("bcrypt");
const { resolve } = require("path");

async function  encrypt(plainpass){
     hashedpass = await new Promise((resolve,reject) => { 
        bcrypt.hash(plainpass, 10, function(err, hash) {
            // store hash in the database
           if(err)reject(err);
           resolve(hash)
            });
     }) 
        console.log(hashedpass+ " ff")
         return hashedpass;
        
 }

 async function comparePassword(plaintextPassword, hash) {
        const result = await bcrypt.compare(plaintextPassword, hash);
        return result;
    }



    async function genid(){
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
      
       newSessionID= await new Promise((resolve,reject)=>{
        id = ""
        for ( i = 0; i < 20; i++) {
            id+=characters.charAt(Math.floor(Math.random()*characters.length));
           
              
          }
          
          resolve(id)

       }) 

       return newSessionID;
        
    }


module.exports = {encrypt,comparePassword,genid}
