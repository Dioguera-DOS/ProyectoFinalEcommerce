// const CartsManager = require('../dao/managers/cartsManager');
// const cartsManager = new CartsManager();

const {authCallCookie} = require('../utils')

const { Router } = require('express');
const router = Router();
const {createCarts, addProdTocart, getCartsById, getAllCarts, deleteCarts, createTicket, } = require('../controller/carts.controller');//getCartsId//getAllCarts


// get all carts registred
router.get('/', getAllCarts);

//get carts by ID.
router.get('/:cid', getCartsById);

//create a cats
router.post('/', createCarts);
//router.get('/', createCarts);

//add product to cart
router.post('/:cid/product/:pid', addProdTocart);

//ticket buy
router.get('/:cid/purchase', authCallCookie, createTicket)

//delete product to cart
//router.delete("/:cid/product/:pid", cartsController.deleteCart);

module.exports = router