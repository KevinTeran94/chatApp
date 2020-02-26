const mongoose=require('mongoose')
const Schema = mongoose.Schema;

let Events = new Schema({
    eventType: String,
    time: {type: Date, default: Date.now},
    userName: String,
    socketID: String, 
    room: String
})

module.exports = mongoose.model('Events', Events)