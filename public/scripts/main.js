let chatform = document.getElementById("form");
let input = document.getElementById("msg");


// get the channels id from the the coversation header of the message field
let channelId = document.getElementById("channelId").textContent;

console.log(channelId + "--chanel");

let userName = document.getElementById('userName');
// let userId = document.getElementById('userId').textContent;

// let dmId = document.getElementById("dmId").textContent;
// console.log(dmId);

const socket = io();

//  fetched messages........
socket.on("outputmsg", (messages) => {
  console.log(messages);
  //  loop through the channels in our db, match channelId from message header(which is hidden)
  // get the appropriate channel and its messages and output to the dom
  for (let message in messages) {
    let msgIds = messages[message]._id;
    let currentChannelMsgs = messages[message].conversation;
    // console.log(msgIds);

    if (channelId === msgIds) {
      console.log(currentChannelMsgs);
      for (currentChannelMsg of currentChannelMsgs) {
        let currentmessages = currentChannelMsg.message;
        // console.log(currentmessages);
        // console.log(currentChannelMsg.user);

        outputMessage(currentChannelMsg);
      }
    }
  }
  
});

// message from server
// socket.emit("message", { channel: channelId, message: msg });
socket.on("message", (message, user,poppedMessage ) => {
  // socket.on("message", ({ channel: channelId, message: message }) => {
  console.log(message) ;

  // call func on this message to add to dom -- emit the message, message.message will emit the content not the object
  outputMessage(message, user, poppedMessage);
});

// message submit
chatform.addEventListener("submit", (e) => {
  e.preventDefault();
  // get input text
  let msg = e.target.elements.msg.value;

  //  emit message to server
  //  send an object to the server, the channel and the message that is typed
  socket.emit("chatMessage", { channel: channelId, message: msg , user : userId});

  // * DM 
  // * cant prvent def submit and cant clear input with below line
  // socket.emit("dmMessage", { userTo: dmId, userFrom:userId, message: msg });

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output typed message to dom
function outputMessage(currentChannelMsg) {
  const div = document.createElement("div");
  const msgTextdiv = document.createElement("div");
  const eachMessageDiv = document.createElement("div");
  div.classList.add("userPic");
  msgTextdiv.classList.add("messageBlock");
  eachMessageDiv.classList.add("eachMessageDiv");

  if(!currentChannelMsg.user){
  `<p class="msgText"> ${currentChannelMsg.message}</p> `

  }else{
    
  div.innerHTML = `<img class="avatar" src="../uploads/${currentChannelMsg.user.profilePic}"></img>`;
    
  msgTextdiv.innerHTML = `<p class="msgUser ">  ${currentChannelMsg.user.name}  <span class= "msgDate">${currentChannelMsg.timestamp} </span></p>
  
    <p class="msgText"> ${currentChannelMsg.message}</p> `;

    eachMessageDiv.append(div)
    eachMessageDiv.append(msgTextdiv)
  document.querySelector(".chat-messages").appendChild(eachMessageDiv);
  // document.querySelector(".chat-messages").appendChild(msgTextdiv);
  }
}
