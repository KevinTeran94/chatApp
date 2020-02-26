var socket = io.connect('http://localhost:3000');

var message = document.getElementById('message');
var username = document.getElementById('username');
var send_message = document.getElementById('send_message');
var send_username = document.getElementById('send_username');
var chatroom = document.getElementById('chatroom')
var feedback = document.getElementById('feedback')
var room = document.getElementById('room').innerHTML

//user is typing
function keypress(){
    socket.emit('typing')
}

// user stopped typing evenet
function onkeyup(){
    socket.emit('clear')
}

function newMessage(){
    socket.emit('new_message',{message : message.value, room: room})
}

//emit user name
function changeUsername(){
    console.log(" change user name button clicked, user name changed to "+username.value)
    socket.emit('change_username',{username: username.value})
}

function userLeaving(){

}


/// socket IO implementation

socket.on('connect', ()=>{
    socket.emit('join-room',room)
    var p = document.createElement("P")
    var t = document.createTextNode("You have connected to "+room)
    p.appendChild(t)
    chatroom.append(p)
})

socket.on("message_received", (data)=>{
    console.log(data)
    var pTag = document.createElement("P")
    var text = document.createTextNode(data.username+": "+data.message)
    pTag.appendChild(text)
    chatroom.append(pTag)
})

// user is typing
socket.on('typing',(data)=>{
   feedback.innerHTML = data.username+" is typing..."
})

socket.on('clear', ()=>{
    feedback.innerHTML = ''
})

socket.on('userJoined', (data)=>{
    var p = document.createElement("P")
    var t = document.createTextNode(data)
    p.appendChild(t)
    chatroom.append(p)
})

socket.on('userLeft', (data)=>{
    var p = document.createElement("P")
    var t = document.createTextNode(data)
    p.appendChild(t)
    chatroom.append(p)
})

socket.on('userDisconnect', (data)=>{
    var p = document.createElement("P")
    var t = document.createTextNode(data)
    p.appendChild(t)
    chatroom.append(p)
})

// socket.on('disconnect',)


