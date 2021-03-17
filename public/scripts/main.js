let chatform = document.getElementById("form");
let input = document.getElementById("msg");


// get the channels id from the the coversation header of the message field
let channelId = document.getElementById("channelId").textContent;

let userName = document.getElementById('userName');
let userId = document.getElementById('userId').textContent;


const socket = io();
// * fetched messages........
socket.on("outputmsg", (messages) => {
  console.log(messages);

  //  loop through the channels in our db, match channelId from message header(which is hidden)
  // get the appropriate channel and its messages and output to the dom

  for (let message in messages) {
    let msgIds = messages[message]._id;
    let currentChannelMsgs = messages[message].conversation;
    console.log(msgIds);

    if (channelId === msgIds) {
      console.log(currentChannelMsgs);
      for (currentChannelMsg of currentChannelMsgs) {
        let currentmessages = currentChannelMsg.message;
        console.log(currentmessages);

        outputMessage(currentmessages);
      }
    }
  }
});

//* message from server
// socket.emit("message", { channel: channelId, message: msg });
socket.on("message", (message) => {
  // socket.on("message", ({ channel: channelId, message: message }) => {
  console.log(message);

  // call func on this message to add to dom -- emit the message, message.message will emit the content not the object
  outputMessage(message.message);

 
});

// message submit
chatform.addEventListener("submit", (e) => {
  e.preventDefault();
  // get input text
  let msg = e.target.elements.msg.value;

  //  emit message to server
  // * send an object to the server, the channel and the message that is typed

  socket.emit("chatMessage", { channel: channelId, message: msg , user : userId});

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output database messages to dom
// function outputMessage(message) {
//   const div = document.createElement("div");
//   div.classList.add("message");

//   div.innerHTML = `<p class="meta "> abbe <span>9.10pm</span></p>
//     <p class="text">
//         ${message}
//     </p>`;
//   document.querySelector(".chat-messages").appendChild(div);
// }

// output typed message to dom
function outputMessage(currentmessages) {
  const div = document.createElement("div");
  div.classList.add("message");

  div.innerHTML = `<p class="meta "> ${userName.textContent} <span>9.10pm</span></p>
    <p class="text">
        ${currentmessages}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
