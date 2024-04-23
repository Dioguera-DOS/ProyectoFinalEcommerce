const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productsCollection = 'products';
// const productSchema = new mongoose.Schema(
// {
    
//     title: String,
//     description: String,
//     price: Number,
//     thumbnails: Array,
//     code: String,
//     stock: Number,
//     category: Number,
//     status: Boolean

// },
// {
//     timestamps: true
// })

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        //required: true
    },
    code: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: false
    },
    id: {
        type: Number,
        required: false,
        unique: true
    },
    owner: {
        type: String, 
        
    }        
},
{
    timestamps: true
},

{
    strict : false
}

);




productSchema.plugin(mongoosePaginate);
const productosModel = mongoose.model(productsCollection, productSchema)
module.exports = productosModel