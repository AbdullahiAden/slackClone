let chatform = document.getElementById("form")
let input = document.getElementById('msg');
let chatMessages = document.getElementsByClassName('chat-messages');

const socket = io()
// * fetched messages........
// 
socket.on("outputmsg", (messages)=>{
    // console.log(messages);
    // * loop through the message object and get the constent of the message
    for(let message in messages ){
        let msgText= messages[message].message


        outputMessage(msgText)
      }

    // messages.forEach(mess => {
    //     console.log(mess);
    //     // let mess = mess
    //     outputMessage(mess)
        
    // });
    // call func on this message to add to dom 
    // console.log(message.conversation);

    
})
// message from server
socket.on("message", (message)=>{
    console.log(message + "..........");
    // call func on this message to add to dom 
    outputMessage(message)
})

// message submit
chatform.addEventListener("submit", (e) =>{
    e.preventDefault();
    // get message text
    let msg = e.target.elements.msg.value
    //  emit message to server
    socket.emit("chatMessage", msg );
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})
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
function outputMessage(outputmsg){
    const div = document.createElement("div")
    div.classList.add("message")

    div.innerHTML=`<p class="meta "> abbe <span>9.10pm</span></p>
    <p class="text">
        ${outputmsg}
    </p>`
    document.querySelector(".chat-messages").appendChild(div)
}
