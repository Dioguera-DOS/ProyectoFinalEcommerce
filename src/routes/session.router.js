const { Router } = require('express');
const { UsersReadDTO } =  require( '../DTO/users.DTO');
const usersModel = require('../dao/models/users.model');
const router = Router();
const crypto = require('crypto');
const {userLogin, perfil, register, logOut, passwordRecovery, passwordRecovery2} = require('../controller/users.controller')

const {passportCall, authCallCookie} = require('../utils')

router.get('/current', passportCall('jwt'),(req,res)=>{    
    res.status(200).json(new UsersReadDTO(req.user));
});
router.post('/login', userLogin);
//router.get('/perfil', passportCall('jwt'),perfil);
router.get('/perfil', authCallCookie, perfil);
router.post('/register', register);
router.get('/logout', logOut);
router.post('/recovery',passwordRecovery)
router.get('/recovery2',passwordRecovery2)


module.exports = router

