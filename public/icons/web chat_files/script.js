

const socket = io();

var username;
 var displayName ;
 color = getRandomColor();

created();
loginform = document.getElementById("login-card-con")
window.onclick = function(event) {
    if (event.target == loginform) {
        loginform.style.display = "none";
        $("#username").val("");
        $("#email").val("");
        $("#pass").val("");
         $("#emailcon").css("display","none");
         $("#userBtn").text("Login");
    }
  }




socket.emit("connection", () => {
   
  });

$("#sendBtn").on("click",() => {
    message = $("#message").val();
   
    //displayMeassage(message)
   
    
    if(displayName){
        console.log("send emit "+socket.id)
        socket.emit("send",message,displayName,color);
    }
    else {
        socket.emit("send",message,socket.id,color);
    }
    
      $("#message").val("");
     

})

socket.on("recevie",(arg,name,color)=>{
   
    console.log("client side got a message");
    p = document.createElement("p");
    label = document.createElement("label");
    label2 = document.createElement("label");
    label.innerText = name;
    label.className = "username";
    if(color){label.style.backgroundColor = color}
    else{label.style.backgroundColor  = getRandomColor();}
    

    p.append(label);
    label2.innerText=": "+arg;
  p.append(label2)
p.className="msg"
   
    $("#chatBox").append(p)
    scrollBottom();
    
})





socket.on("setSession",(session,name)=>{
   
    socket.id = session;
    console.log("hey "+ socket.id);
    if(session){
        localStorage.setItem("sessionID", session);
        localStorage.setItem("name", name);
        displayName = name;
    }
    
})




$("#joinBtn").on("click",() => {
    channel = $("#channel").val();
    
      $("#chatBox").empty();
    socket.emit("join",channel);
    $("#channel").val("");
  


})

$("#DMBtn").on("click",() => {
    channelDM = $("#DM").val();
    
      $("div").empty();
    socket.emit("DM",channelDM);
    $("#DM").val("");
  


})

$("#userBtn").on("click",() => {
    username = $("#username").val();
    pass = $("#pass").val();
    email = $("#email").val();
   
   
    alert( $("#pass").val())
    if( $("#userBtn").text()=="Login"){
        socket.emit("getSession",username,pass);
    }
    else{
        socket.emit("newSession",username,email,pass);
    }
   
  

   


})

$("#login").on("click",()=>{
    $("#login-card-con").css("display","flex")
   
})

$("#register").on("click",()=>{
    $("#emailcon").css("display","block")
    $("#login-card-con").css("display","flex")
    $("#userBtn").text("Register")


   
})

$( window ).on( "load", function() {
   
   socket.emit("page_load");
});

//fun

socket.on("sendself",(message)=>{
displayMeassage(message);
})
function displayMeassage(arg) { 
    if(displayName){
        $("#chatBox").append(DOMPurify.sanitize("<p>"+displayName+": "+arg+"</p>"));
    } 
    else{
        $("#chatBox").append("<p>"+socket.id+": "+arg+"</p>");
    }
   }

   socket.on("receive_img",(file,name,color)=>{
    buff=file
    blob = new Blob([buff]);
    const blobUrl = URL.createObjectURL(blob)
    p = document.createElement("p");
    label = document.createElement("label");
    img = document.createElement("img");
    img = new Image();
    img.src =blobUrl;
    img.className="chat_img";
    label.style.backgroundColor = color;
    label.innerText =name+": ";
    label.className = "username";
    p.className = "msg"
    p.append(label);
    p.append(img);
    $("#chatBox").append(p)
    
    scrollBottom();
    
   })

   socket.on("receive_vid",(file,name)=>{
    buff=file
    blob = new Blob([buff]);
    const blobUrl = URL.createObjectURL(blob)
    p = document.createElement("p");
    vid = document.createElement("video");
    vid.controls = true;
    vid.muted = false;
    vid.src =blobUrl;
    vid.className="chat_vid";
    p.innerText =name+": ";
   
    $("#chatBox").append(p)
    $("#chatBox").append(vid)
    scrollBottom();
    
   })


function created() {
    const sessionID = localStorage.getItem("sessionID");
    tempname  = localStorage.getItem("name");
  
  
    if (sessionID) {
      
      socket.id = sessionID ;


      socket.connect();
    socket.emit("update_session",socket.id);
   
    }
    if(tempname){
        displayName = tempname;
        
    }
    // ...
  }


function sendfile(files) {
    socket.emit("upload", files[0],displayName,color, (status) => {
        console.log(status);
      });
}

socket.on("error",(message)=>{
    alert(message);
})


function scrollBottom() {
   
    
        const element = document.getElementById("chatBox");
        element.scrollTop = element.scrollHeight;
    
}


function getRandomColor() {
    let red = Math.floor(Math.random() * 256);
    let green = Math.floor(Math.random() * 256);
    let blue = Math.floor(Math.random() * 256);
  
    return `rgb(${red}, ${green}, ${blue})`;
  }
  document.getElementById("message").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      document.getElementById("sendBtn").click();
    }
  });


  messageInput = document.getElementById("message");
  messageInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
    if(this.style.height >= "80px") this.style.overflowY = "scroll";
  });


