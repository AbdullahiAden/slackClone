let chatformDm = document.getElementById("form");
let inputDm = document.getElementById("msg");

let userId = document.getElementById('userId').textContent;
let dmId = document.getElementById("dmId").textContent;

console.log(userId);
console.log(dmId);

const Dmsocket = io();
// * fetched messages........
Dmsocket.on("outputDmMsg", (dmMessages) => {
    console.log(dmMessages);
    //  loop through the direct messages in our db, match channelId from message header(which is hidden)
    // get the appropriate channel and its messages and output to the dom
    for (let message in dmMessages) {
        console.log(message);

    //   let msgIds = messages[message]._id;
    //   let currentChannelMsgs = dmMessages[message].conversation;
      // console.log(msgIds);
  
    //   if (channelId === msgIds) {
    //     console.log(currentChannelMsgs);
    //     for (currentChannelMsg of currentChannelMsgs) {
    //       let currentmessages = currentChannelMsg.message;
    //       // console.log(currentmessages);
    //       // console.log(currentChannelMsg.user);
  
    //     //   outputMessage(currentDmMsg);
    //     }
    //   }
    }
    
  });



//* message from server
// socket.on("dmMsg", (message, user,poppedMessage ) => {
//   console.log(message) ;

//   outputMessage(message, user, poppedMessage);
// });

Dmsocket.on("dmMessage", (dmMessages) => {
  // socket.on("message", ({ channel: channelId, message: message }) => {
  console.log(dmMessages) ;

  // outputMessage(message, user, poppedMessage);
});

// message submit
chatformDm.addEventListener("submit", (e) => {
  e.preventDefault();
  // get input text
  let msg = e.target.elements.msg.value;
  console.log(msg);

  // * DM 
  Dmsocket.emit("dmMessage", { userTo: dmId, userFrom: userId, message: msg });

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
