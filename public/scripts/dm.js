let chatformDm = document.getElementById("form");
let inputDm = document.getElementById("msg");

let dmUserFrom  = document.querySelector('.dmUserFrom').textContent;
let dmId = document.getElementById("dmId").textContent;

let dmUserFromTrimmed= dmUserFrom.trim()

const Dmsocket = io();
// * fetched messages........
Dmsocket.on("outputDmMsg", (dmMessages) => {
  console.log(dmMessages);
    //  loop through the direct messages in our db, match channelId from message header(which is hidden)
    // get the appropriate channel and its messages and output to the dom
    for (let dmMsg of dmMessages) {
        console.log(dmMsg);
        // console.log(dmMsg.conversation);

        for (let dmConv of dmMsg.conversation ){
          // both dm users can acces messages in that dm channel
          if ((dmMsg.userTo._id  === dmId  &&  dmConv.userFrom === dmUserFromTrimmed)|| dmMsg.userTo._id=== dmUserFromTrimmed && dmConv.userFrom=== dmId  ) {
            console.log(dmConv);

          }
        }
    }
    
  });

//* message from server
Dmsocket.on("dmMessage", (dmMessages) => {
  // socket.on("message", ({ channel: channelId, message: message }) => {
  console.log(dmMessages) ;

  outputDmMessage(dmMessages);
  
});

// message submit
chatformDm.addEventListener("submit", (e) => {
  e.preventDefault();
  // get input text
  let msg = e.target.elements.msg.value;
  console.log(msg);

  // emit object to server to be saved to db 
  // prevents empty messages being saved to db
  if(msg){
     Dmsocket.emit("dmMessage", { userTo: dmId, userFrom: dmUserFromTrimmed, message: msg });
  }
  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output all  message to dom
function outputDmMessage(dmMessages) {
  const msgTextDmDiv = document.createElement("div");
    
msgTextDmDiv.innerHTML = `<p class="msgText"> ${dmMessages.message}</p> `;
//   document.querySelector(".chat-messages").appendChild(eachDmDiv);
  document.querySelector(".chat-messages").appendChild(msgTextDmDiv);
  }

