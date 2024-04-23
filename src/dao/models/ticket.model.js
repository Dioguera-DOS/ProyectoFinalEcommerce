const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ticketCollection = 'tickets';
const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        //default: () => shortid.generate() // Devuelve directamente el código generado por shortid
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
}, {strict: false})

const ticketsModel = mongoose.model(ticketCollection, ticketSchema)
module.exports = ticketsModel