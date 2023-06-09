const fs = require("fs")
const options = {
  key: fs.readFileSync('./sslcert/yourKey.pem'),
  cert: fs.readFileSync('./sslcert/yourCert.pem')
}
const http= require("http");
const https= require("https")
const enc = require('./bcrypt');

const express = require('express');
const path = require('path');
const app = express();
const mail = require('./mail');

const port = 3000;

const server = https.createServer(options,app).listen(port,()=>{

  console.log("listeing on port: "+port);
})

var mysql = require('mysql');




var con = mysql.createPool({
  connectionLimit : 100,
    host: "localhost",
    user: "yourUser",           
    password: "yourPassword",
    database: "YourDB" ,
    debug:false 
  });
 
  


  var user;
  
  



  
const io = require("socket.io")(server,{
    cors: {
        origin: ["http://localhost:3000"]
    },
    maxHttpBufferSize: 1e8
});




//midleware
app.use(express.static(path.join(__dirname, 'public')));

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  





// routing
app.get("/",(req,res) => {
 
  res.render("index");
})



app.get("/test",(req,res)=>{


  
  res.end();
})










// socket.io 
const messages=[];

const messages_channel=[];
const mp = new Map();
io.on('connection', (socket) => {
  let user_email;
  const joined_chan=[];
  console.log(socket.id);
var chan;
 var in_chan;
 var fixedUserID;
 var receiver_id;
 var receiver_name;
 console.log(in_chan);
 let code;


socket.on("getSession",(name,pass)=>{

  myquery = "select password,session from users where name = ? ";
  sqlobj = [name]
  myquery=mysql.format(myquery,sqlobj)
  con.query(myquery, function (err, result, fields) {
    user = JSON.parse(JSON.stringify(result));
    if(user[0]){ 
      hash = user[0].password;
      console.log(hash); 
  
      enc.comparePassword(pass,hash).then(async function(is_same){
        console.log(is_same)
        if(is_same){
          try {
            console.log(user[0].session);
           mp.set(user[0].session,socket.id);
           console.log(mp.keys(),mp.values());
           
           socket.emit("success",name);
            console.log(Object.keys(socket.rooms))
            socket.emit("setSession",socket.id,name);
        
          } catch (error) {
            console.log("cant set session for the user")
          }
        }
        else{
          socket.emit("error","username or password is incorrect");
        }
      })}
      else{  socket.emit("error","no user with this name");}
   
  
  })
  //
  
  
})
// new session

socket.on("newSession",(username,email,pass)=>{


enc.encrypt(pass).then((hashedpass) => {
  

  //
  myquery = "select name from users where name = ? or email = ? ";
  console.log(hashedpass)
  sqlobj = [username,email]
  myquery=mysql.format(myquery,sqlobj)
  con.query(myquery, function (err, result, fields) {
    if (err) throw err;
    
    if (result.length > 0) {
      
        socket.emit("error","user already exist")
      
      
      }

      

      else{
        
       enc.genid().then((id)=>{
       
        console.log(id+" newsessionid");

        myquery = "INSERT INTO users ( name, email, password,session) VALUES (?,?,?,?)";
        sqlobj = [username,email,hashedpass,socket.id]
        myquery=mysql.format(myquery,sqlobj)
        con.query(myquery, function (err, result, fields) {
          if(err)throw err;
         // console.log(result)
         // user = JSON.parse(JSON.stringify(result));
          console.log("user inserted")
          try {
           
            
            socket.emit("success",username);
            socket.emit("setSession",socket.id,username);
        
          } catch (error) {
            console.log("no seesion for the user")
          }
           
        })
       })
        
        
      }
    user = JSON.parse(JSON.stringify(result));
 
 
    
    
   
  })
})
 
})




    socket.on("send", (message,name,color) => { 
       console.log("on send and my socket id is:" +socket.id + "c")
        console.log(message+" were recevied and user is : "+name+" id: "+socket.id);
        console.log(in_chan+"send on")
       
        if(in_chan){
          joined_chan.forEach(element => {
            console.log(element + "is in ")
          });
          console.log(chan+" in if statment in send")
         io.in(chan).emit("recevie",message,name,color,()=>{console.log("callback or recive "); console.log(Object.keys(socket.rooms))});
         
            myquery = "INSERT INTO channelMsgs (channelID,MSG,name) VALUES (?,?,?)";
            sqlobj = [chan,message,name];
            myquery=mysql.format(myquery,sqlobj);
             con.query(myquery,function (err, result, fields){
              if(err){ throw err
                socket.emit("error","cant register try clearning the local register F12")};
              console.log("inserted into the table channel: "+ chan);
            });
           
           

        }
       
        else{
        io.emit("recevie",message,name,color);
        messages.push({message,name}); 
    }
    
    console.log("\n we have "+messages.length+" stored")
   })


   socket.on("join" , (channel) =>{
    joined_chan.forEach(element => {
      socket.leave(element);
    });
    console.log(Object.keys(socket.rooms));
    chan = channel;
    console.log(chan);
    

    myquery = "select channelID from channels where channelID = ?";
    sqlobj = [channel];
    myquery=  mysql.format(myquery,sqlobj);
     con.query(myquery,async function (err, result, fields){
        if(result.length==0){
          myquery = "insert into channels (channelID,channelOwnerID) VALUES (?,?)";
          sqlobj = [channel,socket.id];
          myquery=mysql.format(myquery,sqlobj);
           con.query(myquery,function  (err, result, fields){
            if(err) console.log("cant create new channel");
            socket.join(channel,()=>{ console.log("user joined channel " + chan);});
           
            console.log(socket.rooms);
            in_chan = true;
           })
        }

        else{
          await socket.join(channel,function(){ console.log("user joined channel " + chan);});
        
          console.log(socket.rooms);
          in_chan = true;
         

          myquery = "select MSG,name from channelMsgs where channelID = ?";
           sqlobj = [chan];
           myquery=mysql.format(myquery,sqlobj);
           con.query(myquery, function (err, result, fields){
             if(err) throw err;
            channel_messages = JSON.parse(JSON.stringify(result));
           

            channel_messages.map((obj)=>{
             //console.log("getting one message to user : " + obj.name+" : "+ obj.MSG);
            //console.log(socket.id);
             socket.emit("recevie",obj.MSG,obj.name);
            })
            
           });

        }
        joined_chan.push(channel);

     })
         
     
         
   })

  
   
   socket.on("page_load",function(){
    console.log("page load happend");
    messages.forEach(obj => {
    
      console.table("getting one message " + obj.name+ obj.message);
      socket.emit("recevie",obj.message,obj.name);
     });

   })

   socket.on('disconnect', function () {
   userkey = getKey(mp,socket.id);
   console.log(userkey)
   if(userkey) mp.delete(userkey);
   
   for (let [key, value] of mp.entries()) {
    
     console.log(key+"user is still in the chat");
    
 }
 

   
   
});

socket.on("upload",async(file,name,color,callback)=>{

  console.log(file); // <Buffer 25 50 44 ...>

  filetype = await verifyFileExtension(file);

  if(filetype === null) return socket.emit("error_filetype","unkown file type remmber we only support images,videos ");

  else if(filetype == "jpeg" | filetype == "png"  | filetype == "gif" ) {
    if(in_chan){
      io.in(chan).emit("receive_img",file,name,color)
    }
    else{
      io.emit("receive_img",file,name,color)
    }
  }
  else if(filetype.includes("mp4")){
    if(in_chan){
      io.in(chan).emit("receive_vid",file,name)
    }
    else{
      io.emit("receive_vid",file,name)
    }
  }
  else{
    return socket.emit("error_filetype","unkown file type remmber we only support images,videos ");
  }



  // save the content to the disk, for example
  
  

})
   
 socket.on("update_session",(id)=>{
  mp.set(id,socket.id);
 })

 socket.on("checkMail",async function(email){
  myquery = "select email from users where email = ?";
    sqlobj = [email];
    myquery=  mysql.format(myquery,sqlobj);
    con.query(myquery,async(err, result, fields)=>{
      if(result.length == 0) socket.emit("error_email","no user with that email");
      else
      { 
        
        user_email = JSON.parse(JSON.stringify(result))[0].email;
        code =  await mail.sendauthcode(email)
        socket.emit("mail_sent");
      }
    })
    
   
 })
 socket.on("verifyOTP",(usercode)=>{
  console.log(usercode+" "+code)
  if(usercode == code && !!code ){
    socket.emit("new_pass")
  }
  else{ 
    socket.emit("error_email","incorrect OTP")}

 })
 socket.on("update_pass",(pass,pass2)=>{
  if(pass===pass2&&!!user_email){
    enc.encrypt(pass).then((hashedpass)=>{
      myquery = "update users set password = ? where email = ?";
      sqlobj = [hashedpass,user_email]
      myquery=mysql.format(myquery,sqlobj)
      con.query(myquery, function (err, result, fields) {
        if(err)throw err;
        socket.emit("password_changed")
       // console.log(result)
       // user = JSON.parse(JSON.stringify(result));
       
        
         
      })
    })
    
  }
  else if(!!user_email){socket.emit("error_email","email was not defined, try again")}
  else socket.emit("error_email","Password you entered doesnt match");

 })

 setInterval(() => {
  code = ""
 }, 90000);
  
  });

  function getKey(map, input) {
    for (let [key, value] of map.entries()) {
       if (value === input) {
         return key;
       }
    }
    
    
  }
  
  function getvalue(map, input) {
    for (let [key, value] of map.entries()) {
       if (key === input) {
         return value;
       }
    }
    
    
  }




  // Define a function that takes in a hexadecimal string representation of the file and returns the corresponding file extension
  function verifyFileExtension(arrayBuffer) {
    // An object that maps file extensions to their magic bytes
    let magicNumbers = {
        jpeg: [0xff, 0xd8, 0xff, 0xe0],
        png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 
        gif: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
        pdf: [0x25, 0x50, 0x44, 0x46],
        mp3: [0xff, 0xfb],
        wav: [0x52, 0x49, 0x46, 0x46],
        mp4v1: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
        mp4v2: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], 
        mp4v3: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
        mp4v4: [0x00, 0x00, 0x00, 0x21, 0x66, 0x74, 0x79, 0x70],
        mp4v5: [0x00, 0x00, 0x00, 0x22, 0x66, 0x74, 0x79, 0x70],
        mp4v6: [0x00, 0x00, 0x00, 0x23, 0x66, 0x74, 0x79, 0x70],

      
    };

    // Create a Uint8Array view on the ArrayBuffer
    let uint8Array = new Uint8Array(arrayBuffer);

    // Loop over the magicNumbers object
    for (let fileExtension in magicNumbers) {
        // Get the magic bytes for the current file extension
        let magicBytes = magicNumbers[fileExtension];

        // A flag to indicate if a match is found
        let match = true;
             
        // Loop over the magic bytes
        for (let i = 0; i < magicBytes.length; i++) {
            // Compare each magic byte to the corresponding byte in the Uint8Array
            
            if (uint8Array[i] !== magicBytes[i]) {
                // If a mismatch is found, set the match flag to false and break the loop
                match = false;
                console.log("file mismatch")
                break;
            }
        }

        // If a match is found, return the file extension
        if (match) {
          console.log(fileExtension)
            return fileExtension;
        }
    }

    // If no match is found, return null
    return null;
}




  


//listen 

/**
           
             */
