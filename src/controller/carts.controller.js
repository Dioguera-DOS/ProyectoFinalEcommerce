const { ProductsDAO } = require('../dao/repositories/products.service');
const productService = new ProductsDAO();
const { CartsDAO } = require('../dao/repositories/carts.service');
const productosModel = require('../dao/models/productos.model');
const cartService = new CartsDAO();
const ticketModel = require('../dao/models/ticket.model')
const {authCallCookie} = require('../utils')
const {updateQuantityProducts} = require('../controller/products.controller');
const cartsModel = require('../dao/models/carts.model');


const createTicket = async (req, res) => {
    let cartUser = req.user.users._id
    let cart = await cartsModel.findOne({user:cartUser})
    try {
        let { noStock, productsStock } = await updateQuantityProducts(cart)

        console.log('voltou pra cá')
        console.log(noStock)
        let amount = productsStock.reduce((total, product) => {
            const price = product.product.price
            if (!isNaN(price)) {
                return total + price * product.quantity
            } else {
                return total
            }
        }, 0)

        let newTicketData = {
            purchase_datetime: new Date(),
            product: productsStock,
            total: amount,
            purchaser: req.user.email
        }

        const newticket = await ticketModel.create(newTicketData);

        const viewTicketHTML = ` 
        <h1>Ticket de Compra</h1>
        <h2>GRACIAS POR TU COMPRA :)</h2>
        <p>Fecha de Compra: ${newTicketData.purchase_datetime}</p>
        <h2>Productos:</h2>
        <ul>
          ${newTicketData.products.map(product => `
            <li>
              <strong>${product.product.title}</strong> - Precio: ${product.product.price} - Cantidad: ${product.quantity}
            </li>
          `).join('')}
        </ul>
        <p>Total a Pagar: ${newTicketData.amount}</p>
        <p>Comprador: ${newTicketData.purchaser}</p>
        ${noStock.length ? `
          <h2>Productos no disponibles:</h2>
          <ul>
            ${noStock.map(product => `
              <li>${product.product.title} - ${product.product.description}</li>
            `).join('')}
          </ul>
          <p>Lo sentimos, estos productos no están disponibles en este momento. Te avisaremos cuando haya inventario.</p>
        ` : ''}`

        await transport.sendMail({
            //from: "Santiago Berrio santiagoberriolopez@gmail.com",
            to: req.user.email,
            subject: "Detalle de tu compra",
            html: ticketHTML,
        });


        res.status(200).render('ticket.buy', {
            purchase_datetime: newTicketData.purchase_datetime,
            products: newTicketData.products,
            amount: newTicketData.amount,
            purchaser: newTicketData.purchaser,
            noStock: noStock
        });


    } catch (error) {

    }

    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({ error: "error al generar el ticket" });
}


//get all carts.
const getAllCarts = async (req, res) => {
    try {
        const carts = await cartService.getCarts({});
        res.setHeader('Content-Type', 'application/json')
        return res.status(200).json(carts);
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }

    console.log('Controle Carts exitoso')

}
//get carts by ID.

const getCartsById = async (req, res) => {
    let cartById
    try {
        const cartId = req.params.cid
        cartById = await cartService.getById(cartId)
        console.log(cartById)
        if (!cartById) {
            return res.status(404).json("cart not found!");
        } else {
            res.setHeader('Content-Type', 'text/html')
            return res.status(200).render('carts', { cart: cartById, cartId});
        }
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }

    console.log('Controle Carts exitoso')

}

//create a cats
const createCarts = async (req, res) => {
    let userCart = req
    console.log(`aqui ${userCart}`)
    try {
        await cartService.createCart();
        let getCarts = await cartService.getCarts();
        if (!getCarts) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ message: `Error al cargar tu carrito` });
        } else {
            res.status(201).json({ carrito: getCarts });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}//revisar ese

//add product to cart
const addProdTocart = async (req, res) => {
    let prodID = req.params.pid
    let cartID = req.params.cid
    try {
        const cart = await cartService.getById(cartID)

        // const cartIndex = cart.findIndex(c => )
        //const cartIndex = cart.findIndex(c => c.id === cart._id);
        // if (!cartIndex) {
        //     return { error: "Carrito no encontrado.", status: 404 };
        // }

        if (!cart) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: "Carrito no encontrado." })
            //return { error: "Carrito no encontrado.", status: 404 };
        }

        let indexProduct = cart.products.findIndex(p => p.product._id == prodID)

        if (indexProduct !== -1) {
            //cart.products[indexProduct].quantity++
            cart.products[indexProduct].quantity++
        } else {
            cart.products.push({ product: prodID, quantity: 1 })
        }

        await cartService.update(cartID, cart)

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "Producto agregado al carrito correctamente" })
        //return { message: "Producto agregado al carrito correctamente.", status: 200 };
    } catch (error) {
        console.error('Error al agregar producto al carrito!!!:', error.message);
        console.log(error.message);
        return { error: "Error al agregar producto al carrito.", status: 500 };
    }
}

const deleteCarts = async (req, res) => {
    let prodId = req.params.pid
    let cartId = req.params.cid

    try {
        let delCart = await cartService.deleteCart(cartId)
    } catch (error) {

    }



}

module.exports = {
    createCarts,
    addProdTocart,
    getCartsById,
    getAllCarts,
    deleteCarts,
    createTicket
}