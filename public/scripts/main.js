let chatform = document.getElementById("form")
let input = document.getElementById('msg');
let chatMessages = document.getElementsByClassName('chat-messages');

const socket = io()

// message from server
socket.on("message", (message)=>{
    console.log(message + "..........");

    //---------------
    //  save messgae to db

    // call func on this message to add to dom 
    outputMessage(message)
})


// message submit
chatform.addEventListener("submit", (e) =>{
    e.preventDefault();
    
    // // get message text
    let msg = e.target.elements.msg.value

    // // emit message to server
    socket.emit("chatMessage", msg );

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

// socket.on("message ", message=>{
//     console.log(message);
//     let item  = document.createElement("li")
//     item.textContent=message

//     item.style.backgroundColor="red";
//     item.style.marginLeft="500px";


//     messages.appendChild(item)

// })


// output message to dom 
function outputMessage(message){
    const div = document.createElement("div")
    div.classList.add("message")

    div.innerHTML=`<p class="meta "> abbe <span>9.10pm</span></p>
    <p class="text">
        ${message}
    </p>`

    document.querySelector(".chat-messages").appendChild(div)
}
