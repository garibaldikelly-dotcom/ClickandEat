document.addEventListener("DOMContentLoaded",()=>{

const form=document.getElementById("loginForm");

form.addEventListener("submit",function(e){

e.preventDefault();

const username=document.getElementById("username").value;
const password=document.getElementById("password").value;

if(username==="admin" && password==="1234"){

alert("Login correcto");

window.location.href="index.html";

}else{

alert("Usuario o contraseña incorrectos");

}

});


const toggle=document.getElementById("togglePassword");

toggle.addEventListener("click",()=>{

const password=document.getElementById("password");

if(password.type==="password"){

password.type="text";

}else{

password.type="password";

}

});

});