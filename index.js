const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dbConfig = require('./db');
const messages = require('./models/Messages')


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

server = app.listen(3000)

// socket.io implementation

const io = require("socket.io")(server)

io.on('connection',(socket)=>{
    console.log('New user connected!')
    
    // socket.on('disconnect',()=>{
    //     io.sockets.
    // }
    
    socket.on('room', (room)=>{
        socket.join(room)
        io.sockets.in(room).emit('userJoined','Anonymous joined the room')
    })

    socket.username = "Anonymous"

    socket.on('change_username', (data)=>{
        socket.username = data.username
    })

    socket.on('new_message', (data)=>{
        console.log(data)
        console.log(data['room'])
        
        //create message variable and save to db
        var newMessage = new messages({userName: socket.username, message: data['message'], room: data['room'] } )
        newMessage.save(function(err){
            if(err) throw err
            io.sockets.in(data['room']).emit('new_message',{message: data.message, username: socket.username})
        })
    })

    socket.on('typing', (data)=>{
        socket.broadcast.emit('typing', {username : socket.username})
    })

    socket.on('clear',()=>{
        socket.broadcast.emit('clear')
    })
})