const { Router } = require('express');
const router = Router()
const usersModel = require('../dao/models/users.model');
const {CartsDAO} = require('../dao/repositories/carts.service')

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateToken } = require('../utils');
const { sendMailRecovery } = require('../mail');
const { config } = require('../config/config');
const SECRETKEY = config.SECRETKEY;

//const prod = new Product()

router.get('/errorLogin',(req,res)=>{
    return res.redirect('/login?error=Error en el proceso de login... :(')
})

const userLogin = async (req, res) => {
    let { email, password } = req.body

    if (!email || !password) {
        return res.redirect('/login?error=Complete todos los datos')
    }

    password = crypto.createHmac("sha256", SECRETKEY).update(password).digest("hex")

    let users = await usersModel.find({ email, password})    
    let user = users.find(u => u.email === email && u.password === password )    
    
    if (!user) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(400).redirect(`/login?error=credenciales invalidas!!!`)
    }

    let token = generateToken(user)

    res.cookie("UserSID", token, { maxAge: 1000 * 60 * 60, httpOnly: true })
   
    return res.redirect('/api/products')
    //return res.render('products')

}

const perfil = async (req, res) => {
    //let user = req.user
    console.log("incluido user na req")
    console.log(req.user.users)
    return res.render("perfil", {user:req.user.users})
    

}
const register = async (req, res) => {
    let { first_name, last_name, email, role, password} = req.body

    if (!first_name || !last_name || !email || !password) {
        return res.redirect('/register?error=Complete todos los datos')
    }

    let usuario = await usersModel.findOne({ email })

    console.log(usuario)

    if (usuario) {
        return res.redirect(`/register?error=Existen usuarios con email${email} en base de datos!!`)
    }

    password = crypto.createHmac("sha256", SECRETKEY).update(password).digest("hex")
    let users
    try {

        users = await usersModel.create({ first_name, last_name, email, role, password})
        console.log(users)
        res.redirect(`/login?message=Usuario ${email} registro correctamente`)

    } catch (error) {
        console.log(error.message)
        res.redirect('/register?error=Error unexpected. Reload a fel minutes!!')
    }
}

const logOut = (req, res) => {
    res.clearCookie('UserSID');
    return res.redirect('/login');
    // set.setHeader('Content-Type', 'application/json')
    // res.status(200).json({ status: true })
}

const passwordRecovery = async (req, res) => {
    let { email } = req.body

    try {
        let usuario = await usersModel.findOne({ email })
        if (!usuario) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(200).json({ error: `user mail found` })
        }

        delete usuario.password

        const token = generateToken()

        let message = `Enter de currenty link to reccovery your password! 
    link:<a href="http://localhost:3000/api/sessions/recovery?token=${token}">Reset your password</a>`

        let response = await sendMailRecovery(email, "Password Recovery", message)
        if (response.accepted.length > 0) {
            res.redirect('http://localhost:3000/index.html?message=contraseña actualizada con éxito')

        } else {
            res.redirect("http://localhost:3000/index.html?message=error al cambiar la contraseña")
        }
    } catch (error) {
        console.log(error.message)

    }
}

const passwordRecovery2 = (req, res) => {

    let { token } = req.query

    try {
        let verifytoken = jwt.verify(token, SECRETKEY)
        res.redirect("http://localhost:3000/recovery2.html?token" + token)
    } catch (error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ error: `error inesperado`})
    }

}


module.exports = { userLogin, perfil, register, logOut, passwordRecovery, passwordRecovery2 }