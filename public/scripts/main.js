let chatform = document.getElementById("form");
let input = document.getElementById("msg");

// get the channels id from the the coversation header of the message field
let channelId = document.getElementById("channelId").textContent;

console.log(channelId + "--chanel");

let userName = document.getElementById('userName');

const socket = io();

//  fetched messages........
socket.on("outputmsg", (allChannels) => {
  // all channels with its data in channels collection
  console.log(allChannels);
  //  loop through the channels in our db, match channelId from messagefields header(which is hidden)
  // get the appropriate channel and its messages and output to the dom
  for (let currentChannel in allChannels) {

    let channnelIds = allChannels[currentChannel]._id;
    let currentChannelMsgs = allChannels[currentChannel].conversation;
    // console.log(channnelIds);

    if (channelId === channnelIds) {
      console.log(currentChannelMsgs);
      for (currentChannelMsg of currentChannelMsgs) {
        // all messages in the  databasein for the current channel , send to function to be outputted 
        let currentmessages = currentChannelMsg.message;
        // console.log(currentmessages);
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

  // * call func on this message to add typed message to to dom , BUT CANNOT GET THE LOGGED IN USES PROFILE PIC AND NAME, gets only after reload
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

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output db message to dom
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
