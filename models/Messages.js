const mongoose=require('mongoose')
const Schema = mongoose.Schema;

let Messages = new Schema({
    userName: String,
    message: String,
    receivers: [String],
    room: String,
    created: {type:Date, default:Date}
})

module.exports = mongoose.model('Messages', Messages)