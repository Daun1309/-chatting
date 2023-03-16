const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;


//메세지 출력
function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}


//내가 보낸 메세지 출력
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`나: ${value}`);
    });
    input.value = "";
}

function showRoom(msg){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

//방 입장
//신부방 or 신랑방 버튼을 누르는 순간 각 방 입장
function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room",input.value , showRoom); 
    roomName = input.value;
    input.value = ""
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} 님이 들어왔습니다!`);  
})

socket.on("bye", (left) => {
    addMessage(`${left} 님이 떠났습니다 ㅠㅠ`);  
})

socket.on("new_message", addMessage);
