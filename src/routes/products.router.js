//const ProductManager = require('../controller/productManager');
//const productManager = new ProductManager();

const express = require('express');
const router = express.Router();
const { mongoose } = require('mongoose');
const { getAllProducts, deleteProduct, getProductsById, createProduct, updateProduct, productsManager } = require('../controller/products.controller')
const {authCallCookie, authAdmin} = require('../utils')

//router.get('/manager',authCallCookie, auth, productsManager)

router.get('/manager',authCallCookie, authAdmin, productsManager)

router.get('/', authCallCookie, getAllProducts)//show all products data.
router.get('/:id',authCallCookie, getProductsById)//show produtc with select ID.
router.post('/', authCallCookie, createProduct)//creared a new product
router.post('/:pid', authCallCookie, updateProduct)
router.post('/delete', authCallCookie ,deleteProduct) //delete product


module.exports = router;