const cartsModel = require('../models/carts.model');

class CartsDAO {
    async createCart(userCart) {
        try {
            const existingCarts = await cartsModel.find({});
            const cartId = existingCarts.length;
            const newCart = await cartsModel.create({ id: cartId, products: [], user: userCart });
            return newCart;
        } catch (error) {
            console.log(error.message)
        }



        // try {
        //     //return await cartsModel.create({products:[]})
        //     return await cartsModel.create(cartId, userCart)
        // } catch (error) {
        //     console.log(error.message)
        //     return null

        // }
    }
    async getCarts() {
        try {
            return await cartsModel.find({}).lean()
        } catch (error) {
            console.log(error.message)

        }
    }
    async getById(id) {
        try {
            return await cartsModel.findOne({ _id: id }).populate("products.product").lean()
            //return await cartsModel.findOne({ _id: id })
        } catch (error) {
            console.log(error.message)
            return null

        }

    }

    async update(id, cart) {
        try {
            return await cartsModel.updateOne({ _id: id }, cart)
        } catch (error) {
            console.log(error.message)
            return null

        }

    }

    async deleteCart(id) {
        try {
            return await cartsModel.deleteOnr({_id:id})
        } catch (error) {
            console.log(error.message)

        }
    }
}


module.exports = { CartsDAO }