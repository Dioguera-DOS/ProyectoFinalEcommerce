const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const cartsCollection = 'carts';

const productCartSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    quantity: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
    id: { type: Number, required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    products: [productCartSchema]
    
},

{
    timestamps: true
}

);

// const cartSchema = new mongoose.Schema(
//     {
//         products: [
//             {
//                 product:{
//                     type:mongoose.Schema.Types.ObjectId,
//                     ref:"products"
//                 },
//                 quantity:Number
//             }
//         ]
//     },
// )

productCartSchema.plugin(mongoosePaginate);
const cartsModel = mongoose.model(cartsCollection, cartSchema)
module.exports = cartsModel