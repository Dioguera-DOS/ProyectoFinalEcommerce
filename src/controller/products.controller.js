const usersModel = require('../dao/models/users.model');
const cartsModel = require('../dao/models/carts.model');
const productosModel = require('../dao/models/productos.model');
const { ProductsDAO } = require('../dao/repositories/products.service')
const { CartsDAO } = require('../dao/repositories/carts.service')
const mongoose = require('mongoose');
const productService = new ProductsDAO();
const cartServices = new CartsDAO();


const { generateProducts } = require('../mock/mocks');

const getAllProducts = async (req, res) => {

    //id del user que viene por la req.
    let userId = req.user.users._id

    let getAllCarts = await cartServices.getCarts({});

    const findCart = getAllCarts.findIndex(c => c.user == userId)
    let createCart
    if (findCart === -1) {
        createCart = await cartServices.createCart(userId)
    }
    let getUser = await usersModel.findOne({
        email: req.user.users.email
    }).lean()

    let page = 1
    if (req.query.page) {
        page = req.query.page
    }

    let limite = null;
    if (req.query.limit) {
        limite = req.query.limit;
    }

    // if (rol === "admin") {
    //   auto = true;
    // }

    // if (rol === "user" || rol === 'premium') {
    //  autoUser = true;
    // }

    //let cart = await cartServices.findOne({cartId})

    let getCartId = await cartsModel.findOne({ user: userId })
    console.log(getCartId)
    let products_list

    try {
        products_list = await productService.getProducts(page, limite)
        let { totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } = products_list

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).render('products', {
            products: products_list.docs,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            user: getUser,
            cartId: getCartId._id


        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const getProductsById = async (req, res) => {
    let { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) // verificar si ID es valido en MongoDB
    {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Ingrese un ID con formato válido!!!!` })
    }

    let exist

    try {
        exist = await productService.getById(id)
        //exist = await productosModel.findOne({ _id: id })
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error ineperado` })
    }

    if (!exist) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `user id ${req.params.id} not found` })

    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ product_details: exist })

}

const createProduct = async (req, res) => {
    const { title, description, price, code, stock, category, status, owner } = req.body;

    try {

        const thumbnails = req.body.thumbnails || [];
        const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !(field in req.body));

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Faltan campos requeridos: ${missingFields.join(', ')}` });
        }

        const typeValidation = {
            title: 'string',
            description: 'string',
            price: 'string',
            code: 'string',
            stock: 'string',
            category: 'string',

        };

        const invalidFields = Object.entries(typeValidation).reduce((acc, [field, type]) => {
            if (req.body[field] !== undefined) {
                if (type === 'array' && !Array.isArray(req.body[field])) {
                    acc.push(field);
                } else if (typeof req.body[field] !== type) {
                    acc.push(field);
                }
            }
            return acc;
        }, []);

        if (!Array.isArray(thumbnails)) {
            return res.status(400).json({ error: 'Formato inválido para el campo thumbnails' });
        }

        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Tipos de datos inválidos en los campos: ${invalidFields.join(', ')}` });
        }

        const productData = {
            title,
            description,
            price,
            thumbnails,
            code,
            stock,
            category,
            status: status !== undefined ? status : true,
            owner: owner === null || owner === '' ? owner : 'admin'
        };



        let newProd = await productService.createProducts(productData)

        // const responseCodes = {
        //     "Ya existe un producto con ese código. No se agregó nada.": 400,
        //     "Producto agregado correctamente.": 201,
        //     "Error agregando producto.": 500,
        // };

        //const reStatus = responseCodes[newProd] || 500;
        return res.status(201).json({ newProd });

    } catch (error) {
        console.log('aqui')
        return res.status(500).json(error.message);
    }

}


const updateProduct = async (req, res) => {
    let { pid } = req.body
    if (!mongoose.Types.ObjectId.isValid(pid)) {
        res.setHeader('Content-type', 'application/json')
        return res.status(400).json({ error: "Ivalid ID" })
    }
    let exist
    try {
        exist = await productService.findOne({ _id: pid })
        const productId = parseInt(req.params.pid);
        const updates = req.body;

    } catch (error) {
        res.status(500).json({ error: "Error de servidor!" });
    }
    if (!exist) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `ID ya existe ${pid}` })
    }

    if (req.body._id || req.body.code) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No se pueden modificar la propiedades "_id" y "code"` })
    }

    let updateProd

    try {
        updateProd = await productService.updateProd({ _id: pid }, updates)
        if (updateProd.modifiedCount > 0) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ payload: 'change sucessfull' })
        } else {
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({ payload: 'change failed' })
        }
    } catch (error) {

    }

}

const deleteProduct = async (req, res) => {
    let { id } = req.body

    let existeId
    try {
        //existeId = await productService.getById(id);
        existeId = await productosModel.findOne({ id: id })

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
    }

    if (!existeId) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `ID ${id} not exist` })
    }


    let resultado
    try {
        resultado = await productService.delProduct(id)


        if (resultado.deletedCount > 0) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload: "Eliminacion realizada" });
        } else {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `No se concretó la eliminacion` })
        }
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(error.message)

    }

}

const productsManager = async (req, res) => {

    try {
        res.setHeader('Content-Type', 'text/html')
        return res.status(200).render('managerProducts')
    } catch (error) {
        res.status(500).json({ error: "error al redireccionar a la sesion de gerenciador de productos. Intente más tarde!" })

    }



}

const updateQuantityProducts = async (cart) => {
    try {
        let noStock = []
        let productsStock = []
        for (const product of cart.products) {
            const productId = product.product;
            const quantity = product.quantity;
            // Get the existing product from the database
            const existingProduct = await productService.getById({ _id: productId });
            if (existingProduct) {
                // Subtract the quantity from the existing stock
            
                let updatedStock = existingProduct.stock - quantity;                

                //si no hay stock agregamos producto a nostock
                if (updatedStock < 0) {
                    noStock.push(product)
                    updatedStock = existingProduct.stock
                    logger.info(noStock)
                } else {
                    productsStock.push(product)                }
                // Update the stock in the database
                const updated = await productService.updateProd(productId, { stock: updatedStock });              

                if (!updated) {
                    console.log(`Product with ID ${productId} not found or not updated.`)
                    logger.info(`Product with ID ${productId} not found or not updated.`);
                }

            } else {
                logger.info(`Product with ID ${productId} not found in the database.`);
            }
        }

        console.log("Passou aqui ")
        console.log(noStock)
        console.log("Passou aqui 2")
        console.log(productsStock)
        return { noStock: noStock, productsStock: productsStock }
    } catch (error) {
        console.log('passou aqui tudo certo!!!')
        logger.error("Error updating product quantities:", error);
        // Handle the error as needed
    }
}


module.exports = {
    getAllProducts,
    getProductsById,
    createProduct,
    updateProduct,
    deleteProduct,
    productsManager,
    updateQuantityProducts
}