let chatform = document.getElementById("form");
let input = document.getElementById("msg");

// get the channels id from the the coversation header of the message field
let channelId = document.getElementById("channelId").textContent;


let userId = document.getElementById('userId').textContent;

let loggedInUserProfilePic = document.querySelector('.loggedInUserProfilePic').src;


let userName = document.getElementById('userName').textContent;

const socket = io();

socket.emit('login',{userId:userId});
socket.on("onlineUsers", (onlineUsers) => {
  
  console.log(onlineUsers);
  onlineUsers.forEach(onlineUser => {
    renderOnlineUsers(onlineUser)
  });

  
  
})

function renderOnlineUsers(onlineUsers){
  const onlineUsersDiv = document.createElement("div");
  const onlineUsersNames = document.createElement("div");
  onlineUsersDiv.classList.add("onlineUsers")
    
 
  // onlineUsersNames.innerHTML = `<p class="msgUser ">  ${userName}  </p> `
  
  onlineUsersDiv.innerHTML = `<p > ${onlineUsers} </p> `;
  // onlineUsersDiv.append(onlineUsersNames)
  //   document.querySelector(".chat-messages").appendChild(eachDmDiv);
    document.querySelector(".onlineUsers").appendChild(onlineUsersDiv);


}



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
socket.on("message", (message ) => {
  // socket.on("message", ({ channel: channelId, message: message }) => {
  console.log(message) ;

  // * call func on this message to add typed message to to dom , BUT CANNOT GET THE LOGGED IN USES PROFILE PIC AND NAME, gets only after reload
  outputMessage(message, userName);
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

  

    <p class="msgText"> ${currentChannelMsg.message}</p>
    <a href="/channels/${currentChannelMsg._id}/delete">delete</a>
    `;
    

    eachMessageDiv.append(div)
    eachMessageDiv.append(msgTextdiv)
  document.querySelector(".chat-messages").appendChild(eachMessageDiv);
  // document.querySelector(".chat-messages").appendChild(msgTextdiv);
  }
}


