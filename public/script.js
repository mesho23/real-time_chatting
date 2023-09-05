

const socket = io();

var username;
var displayName;
color = getRandomColor();

created();
loginform = document.getElementById("login-card-con");
aboutus = document.getElementById("aboutcon");
forgetpass = document.getElementById("forgetpass-card-con");
window.onclick = function (event) {
  if (event.target == loginform) {
   
    loginform.style.display = "none";
    $("#username").val("");
    $("#email").val("");
    $("#pass").val("");
    $("#emailcon").css("display", "none");
    $("#userBtn").text("Login");
    $(".error").text("");
    $("#forgetPassword").css("display", "none");
  }
  else if (event.target == aboutus) {
    aboutus.style.display = "none";
    
  }
  else if(event.target == forgetpass){
    forgetpass.style.display = "none";
    $("#email-forget-pass").css("display","flex")
    $("#new_pass").css("display","none")
    $("#OTP-group").css("display","none")
    $("#confirm-newpass").css("display","none")
    $(".error").text("");
    $("#forgetPassword").css("display", "none");
    $("#newpassBtn").css("display", "none");
    $("#OTPBtn").css("display", "none");
    $("#Pass-resetBtn").css("display", "block");
    
  }
};


$("#AboutUs").on("click",()=>{
    $("#aboutcon").css("display","flex");
})

socket.emit("connection", () => {});

$("#sendBtn").on("click", () => {
  message = $("#message").text();

  

  if (displayName) {
    
    socket.emit("send", message, displayName, color);
  } else {
    socket.emit("send", message, socket.id, color);
  }

  $("#message").text("");
  
});

socket.on("recevie", (arg, name, color) => {
  
  p = document.createElement("p");
  label = document.createElement("label");
  label2 = document.createElement("label");
  label.innerText = name;
  label.className = "username";
  if (color) {
    label.style.backgroundColor = color;
  } else {
    label.style.backgroundColor = getRandomColor();
  }

  p.append(label);
  label2.innerText = ": " + arg;
  p.append(label2);
  p.className = "msg";

  $("#chatBox").append(p);
  scrollBottom();
});

socket.on("setSession", (session, name) => {
  socket.id = session;
  
  if (session) {
    localStorage.setItem("sessionID", session);
    localStorage.setItem("name", name);
    displayName = name;
  }
});

$("#joinBtn").on("click", () => {
  channel = $("#channel").val();

  $("#chatBox").empty();
  socket.emit("join", channel);
  $("#channel").val("");
});

$("#DMBtn").on("click", () => {
  channelDM = $("#DM").val();

  $("div").empty();
  socket.emit("DM", channelDM);
  $("#DM").val("");
});


$("#Pass-resetBtn").on("click", () => {
  for_email = $("#email-forget-pass").val();
  if(document.getElementById("email-forget-pass").checkValidity()){
    socket.emit("checkMail",for_email
    ,(status)=>{
      if(status) {
       
      }
    });
  }
  else{
    inputerr("valid email format required","Pass-resetBtn")
  }
})

$("#forgetPassword").on("click",()=>{
  $("#login-card-con").css("display","none")
  $("#forgetpass-card-con").css("display","flex")
})

$("#newpassBtn").on("click",()=>{
  
  

  if(document.getElementById("newpassinput").checkValidity() === false || document.getElementById("passcheck").checkValidity() === false){
   
    inputerr("Password must be 8 character or longer and at least one number and uppsercase and spiecal symbols","newpassBtn");
  }
  else if($("#newpassinput").val()!= $("#passcheck").val()){
    
    inputerr("Passwords do not match","newpassBtn");}
  else {
    socket.emit("update_pass",$("#newpassinput").val(),$("#passcheck").val())
  }
})



$("#userBtn").on("click", () => {
  username = $("#username").val();
  pass = $("#pass").val();
  
  email = $("#email").val();

  if ($("#userBtn").text() == "Register") {
  
    
    $(".loading").css("display", "flex");
    $("#userBtn").css("display", "none");
    if (
      !document.getElementById("username").checkValidity() &
      !document.getElementById("pass").checkValidity()  &
      !document.getElementById("email").checkValidity()
    ) {
       
      
      inputerr("username and email and password are required","userBtn");
    }
    else if(!document.getElementById("pass").checkValidity()){
        inputerr("password must be 8 character or longer and at least one number and uppsercase and spiecal symbols","userBtn");
    }
    else if(!document.getElementById("email").checkValidity()){
        inputerr("you entered a wrong email format it should be like: example@org.com","userBtn");
    }
    else {
        socket.emit("newSession", username, email, pass);
    }
  }

  if ($("#userBtn").text() == "Login") {
    
    if (
      document.getElementById("username").checkValidity()
    ) {
      $(".loading").css("display", "flex");
      $("#userBtn").css("display", "none");
      socket.emit("getSession", username, pass);
    } else {
      inputerr("username and password are required","userBtn");
    }
  } else {
  }
});

$("#login").on("click", () => {
  $("#login-card-con").css("display", "flex");
  $("#forgetPassword").css("display", "flex");
 
});

$("#register").on("click", () => {
  $("#emailcon").css("display", "block");
  $("#login-card-con").css("display", "flex");
  $("#userBtn").text("Register");
});

$(window).on("load", function () {
  socket.emit("page_load");
});

//fun

socket.on("sendself", (message) => {
  displayMeassage(message);
});
function displayMeassage(arg) {
  if (displayName) {
    $("#chatBox").append(DOMPurify.sanitize("<p>" + displayName + ": " + arg + "</p>"));
  } else {
    $("#chatBox").append("<p>" + socket.id + ": " + arg + "</p>");
  }
}

socket.on("receive_img", (file, name, color) => {
  buff = file;
  blob = new Blob([buff]);
  const blobUrl = URL.createObjectURL(blob);
  p = document.createElement("p");
  label = document.createElement("label");
  img = document.createElement("img");
  img = new Image();
  img.src = blobUrl;
  img.className = "chat_img";
  label.style.backgroundColor = color;
  label.innerText = name + ": ";
  label.className = "username";
  p.className = "msg";
  p.append(label);
  p.append(img);
  $("#chatBox").append(p);

  scrollBottom();
});

socket.on("receive_vid", (file, name) => {
  buff = file;
  blob = new Blob([buff]);
  const blobUrl = URL.createObjectURL(blob);
  p = document.createElement("p");
  label = document.createElement("label");
  vid = document.createElement("video");
  label.style.backgroundColor = color;
  label.innerText = name + ": ";
  label.className = "username";
  p.className = "msg";
  vid.controls = true;
  vid.muted = false;
  vid.src = blobUrl;
  vid.className = "chat_vid";
 
  p.append(label);

 
  p.append(vid);
  $("#chatBox").append(p);
  scrollBottom();
});

function created() {
  const sessionID = localStorage.getItem("sessionID");
  tempname = localStorage.getItem("name");

  if (sessionID) {
    socket.id = sessionID;

    socket.connect();
    socket.emit("update_session", socket.id);
  }
  if (tempname) {
    displayName = tempname;
  }
  // ...
}

function sendfile(files) {
  if (displayName) {
    socket.emit("upload", files[0], displayName, color, (status) => {
      console.log(status);
    });
  } else {
    socket.emit("upload", files[0], socket.id, color, (status) => {
      console.log(status);
    });
  }
}

socket.on("mail_sent",()=>{
  $("#email-forget-pass").css("display","none")
  $("#OTP-group").css("display","flex");   
  $("#OTPBtn").css("display","flex");
  $("#Pass-resetBtn").css("display","none");
})
socket.on("new_pass",()=>{
  $(".error").text("");
  $("#newpassBtn").css("display", "flex");
  $("#OTPBtn").css("display", "none");
  $("#OTP-group").css("display", "none");
  $("#new_pass").css("display", "block");
})
$("#OTPBtn").on("click",()=>{
  
  socket.emit("verifyOTP",$("#otp").val())
})
socket.on("error_email", (message) => {
    
  
  
  $(".error").css("color", "red");
  $(".error").text(message);
});
socket.on("error", (message) => {
    
  $(".loading").css("display", "none");
  $("#userBtn").css("display", "block");
  $(".error").css("color", "red");
  $(".error").text(message);
});
socket.on("error_filetype", (message) => {
   
    alert(message)
  });

 socket.on("password_changed",()=>{
  document.getElementById('forgetpass-card-con').click()
  alert("password changed")
 })
socket.on("success", (name) => {
  $("#register").css("display", "none");
  $("#login").css("display", "none");
  $("#login-card-con").css("display", "none");
  document.getElementById("loginArea").append("Hello " + name+", remember public chat is not saved");
});

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
document
  .getElementById("message")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.getElementById("sendBtn").click();
    }
  });

messageInput = document.getElementById("message");
messageInput.addEventListener("input", function () {
  if (this.style.overflowY == "scroll") {
  } else {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  }

  if (this.style.height >= "80px") this.style.overflowY = "scroll";
});

function inputerr(message,btn) {
  
  $(".loading").css("display", "none");
  $("#"+btn).css("display", "block");
  $(".error").css("color", "red");
  $(".error").text(message);
}

