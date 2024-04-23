

const express = require('express');
const swaggerJsdoc=require("swagger-jsdoc");
const swaggerUi=require("swagger-ui-express");
//const {errorHandler} = require("./middlewares/errorHandlers");

const app = express();

//Handlebars
const handlebars = require('handlebars');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
//express

const path = require('path');


const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title: "API Ecommerce",
            version: "1.0.0",
            description: "Documentación API Ecommerce"
        }
    },
    apis: ["./docs/*.yaml"]
}

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

const mongoose = require('mongoose');
const passport = require('passport');
const { initPassport } = require('./config/passport.config');
const cookieParser = require('cookie-parser');

//routers
const routerProducts = require('./routes/products.router');
const sessionRouter = require('./routes/session.router');
const routerCarts = require('./routes/carts.router');
const routerViews = require('./routes/views.router');
const showMessage = require('./routes/message.router');
const chatRouter = require('./routes/chat.router');

//variables de ambientes
const { config } = require('./config/config');
const {CustomError, TYPES_ERROR} = require('./errors');
const { throws } = require('assert');

const PORT = config.PORT 
const DBNAME = config.DBNAME
const MONGO_URL = config.MONGO_URL

//app.use(passport.session())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
initPassport()
app.use(cookieParser())

app.use(passport.initialize())

//handlebars config
app.engine('handlebars', engine());

//setup view engine
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));

//app.use(errorHandler)
//Router config
app.use('/', routerViews)
app.use('/api/products', routerProducts)
app.use('/api/carts', routerCarts)
app.use('/api/sessions', sessionRouter)
app.use('/message', showMessage)
app.use('/api/chat', chatRouter)

// app.get('/testing', (req, res)=>{
//     if(req.query.error==="1"){
//         console.log('aqui papai')
//        throw new CustomError('Login', 'Error al iniciar sesión', TYPES_ERROR.VALIDATION, "Error por credenciales.")
//     }
//     try {
//         if(req.query.error==="2"){
//             console.log("Error not cutomized!!!")
//         }
//     } catch (error) {
//         throw new CustomError('Testing', 'testando', TYPES_ERROR.INDETERMINATE, "error que entro na catch, descript")
//     }
//     res.setHeader('Content-type', 'application/json')
//     return res.status(200).json({
//         message:"Endpoint testing ok!!!!"
//     })
// })

async function dataBase() {
    try {
        await mongoose.connect(MONGO_URL,{dbName:DBNAME})//{dbName:'ecommerce'}
        //let products = await productosModel.paginate({},{limit:10, page:1})
        console.log('DB online')
    } catch (error) {
        console.log(error.message)
    }
}
dataBase()
const server = app.listen(PORT, () => console.log("Server online port " + PORT))

const io = new Server(server)


let users = []
let menssageUsers = []
io.on('connection', socket => {
    console.log(`Cliente connected with ID ${socket.id}!!!`)

    socket.on('id', nombre => {
        users.push({ nombre, id: socket.id })
        socket.broadcast.emit('newUser', nombre)
        socket.emit("hello", menssageUsers)
    })

    socket.on('message', datos => {
        menssageUsers.push(datos)
        io.emit('newMessage', datos)

    })

    socket.on('disconnect', () => {
        let userDesc = users.find(u => u.id === socket.id)
        if (userDesc) {
            io.emit("userDesconnected", userDesc.nombre)
        }
    })
})


module.exports = { io }



