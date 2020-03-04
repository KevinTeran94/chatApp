const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dbConfig = require('./db');
const messages = require('./models/Messages')
const events  = require('./models/Events')


mongoose.connect(dbConfig.db, function(err){
    if(err){
        console.log(err)
    } else{
        console.log('connected to mongodb!')
    }
})
// code to initalize express app

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/',(req,res)=> {
    res.render('index')
})

app.get('/gaming.ejs',(req, res)=>{
    res.render('gaming')
})

app.get('/api/eventlog', (req, res)=>{
    events.find((error, data)=>{
        if(error){
            return console.error(error)
        } else{
            res.json(data)
        }
    })
})

app.get('/api/history',(req, res, next)=>{
    messages.find((error, data)=>{
        if (error){
            return next(error)
        } else{
            res.json(data)
        }
    })
})

app.post('/api/roomhistory/:roomname', (req, res,)=>{
    //http://localhost:3000/api/roomhistory/Super%20Chat url to post to. 
    // %20 must be used to encode the space in the url
    messages.find({room: req.params.roomname}, (error, data)=>{
        if(error){
            return console.error(error)
        } else{
            res.json(data)
        }
    })
})
server = app.listen(3000)

// socket.io implementation

const io = require("socket.io")(server)



io.on('connection',(socket)=>{
    socket.join("Super Chat")
    socket.roomName = "Super Chat"
    socket.username = "Anonymous"
    
    // saving connection event
    var connectEvent = new events({eventType: 'connection', userName:socket.username, socketID: socket.id})
    connectEvent.save();

    console.log('New user connected!')
    
    var joinRoomHelper = (room) => {
        // join room event and save event to db
        var joinEvent = new events({eventType: 'join-room', userName:socket.username, socketID: socket.id, room: room})
        joinEvent.save()
        console.log("join room event")
        socket.join(room)
        socket.roomName = room;
        io.sockets.in(room).emit('userJoined', socket.username+' joined the '+socket.roomName+' room!')
    };

    joinRoomHelper(socket.roomName)

    socket.on('join-room', (room)=>{
        const oldRoom = socket.roomName
        
        //leave room event and save event to db
        var leaveEvent = new events({eventType: 'leave-room', userName:socket.username, socketID: socket.id, room: oldRoom})
        leaveEvent.save()
        socket.leave(oldRoom)
        io.sockets.in(oldRoom).emit('userLeft', socket.username+ " has left the room!")

        joinRoomHelper(room)
    })

    socket.on('change_username', (data)=>{
        var changeUsernameEvent = new events({eventType: 'change_username', userName:data.username, socketID: socket.id})
        changeUsernameEvent.save()
        socket.username = data.username
    })

    socket.on('new_message', (data)=>{
        var newMessageEvent = new events({eventType: 'new_message', userName:socket.username, socketID: socket.id, room: data['room']})
        newMessageEvent.save()
        console.log(data)
        console.log(data['room'])
        
        var receivers = []
        var object = io.sockets.in(data['room']).connected
        for (var key in object){
            if(object[key].id !== socket.id && object[key].roomName === data['room'])
                receivers.push(object[key].username)
        }

        console.log(receivers)

        var newMessage = new messages({userName: socket.username, message: data['message'], receivers: receivers, room: data['room'] } )
        newMessage.save(function(err){
            if(err) console.error(err)
        })
        io.sockets.in(data['room']).emit('message_received',{message: data.message, username: socket.username})
    })

    socket.on('typing', (data)=>{
        socket.broadcast.emit('typing', {username : socket.username})
    })

    socket.on('clear',()=>{
        socket.broadcast.emit('clear')
    })

    socket.on('disconnect',()=>{
        var disconnectEvent = new events({eventType: 'disconnect', userName:socket.userName, socketID: socket.id})
        disconnectEvent.save()
        console.log("disconnect event")
        io.sockets.in(socket.roomName).emit('userDisconnect', socket.username+ " has disconnected")
    })
})