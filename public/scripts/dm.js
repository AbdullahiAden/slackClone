// const dm = require("../../models/dm");

let chatformDm = document.getElementById("form");
let inputDm = document.getElementById("msg");

let userId = document.getElementById('userId').textContent;
let dmId = document.getElementById("dmId").textContent;

console.log(userId);
console.log(dmId);

const Dmsocket = io();
// * fetched messages........
Dmsocket.on("outputDmMsg", (dmMessages) => {
    // all dms 
    console.log(dmMessages);
    //  loop through the direct messages in our db, match channelId from message header(which is hidden)
    // get the appropriate channel and its messages and output to the dom
    for (let dmMsg in dmMessages) {
        // console.log(dmMsg);

      let dmToIds = dmMessages[dmMsg].userTo._id;
      let dmFromIds = dmMessages[dmMsg].conversation;

      let currentDmMsgs = dmMessages[dmMsg].conversation;
    //   console.log(dmToIds + "___");
    //   console.log(dmFromIds + "___");
    //   console.log(currentDmMsgs);

        //   console.log(currentDmMsgs);
        //   outputDmMessage(currentDmMsgs);
        
        for (currentDmMsg of currentDmMsgs) {
            let currentDmUserFrom = currentDmMsg.userFrom
            console.log(currentDmUserFrom);

            if (dmId === dmToIds &&  currentDmUserFrom === userId || userId === dmId && currentDmUserFrom ===dmToIds) {
            
                let currentDmMessages = currentDmMsg;
                console.log(currentDmMessages);
                // console.log(currentChannelMsg.user);
                outputDmMessage(currentDmMessages);
            }

            if (dmId !== dmToIds &&  currentDmUserFrom !== userId ){
                console.log("no conversation between these two ");
            }
        }
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
function outputDmMessage(currentDmMessages) {
  const div = document.createElement("div");
  const msgTextDmDiv = document.createElement("div");
  const eachDmDiv = document.createElement("div");
  div.classList.add("userPic");
//   msgTextDmDiv.classList.add("messageBlock");
  eachDmDiv.classList.add("eachMessageDiv");


//   if(!currentDmMsg.user){
//   `<p class="msgText"> ${currentChannelMsg.message}</p> `

  

//   }else{
    
//   div.innerHTML = `<img class="avatar" src="../uploads/${currentChannelMsg.user.profilePic}"></img>`;
    
msgTextDmDiv.innerHTML = `<p class="msgUser ">  ${currentDmMessages.userFrom}  <span class= "msgDate">${currentDmMessages.timestamp} </span></p>
  
    <p class="msgText"> ${currentDmMessages.message}</p> `;

    // eachMessageDiv.append(div)
    eachDmDiv.append(msgTextDmDiv)
//   document.querySelector(".chat-messages").appendChild(eachDmDiv);
  document.querySelector(".chat-messages").appendChild(msgTextDmDiv);
  }


// }
