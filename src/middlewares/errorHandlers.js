const  {CuntomError}  = require('../errors.js')

const errorHandler = (error, req, res, next) => {
    if (error) {
        if (error instanceof CuntomError) {
            res.setHeader('Content-Type', 'application/json');           
            return res.status(500).json({                
                error: `${error}:${error.msg}`,
                detail: error.descript ? error.descript : "Error unexpected server error. Try later or contact support."
            })
        } else {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `unexpected server error. Try later or contact support.`,
                detail: error.message
            })

        }

    }

    next()
}

module.exports = { errorHandler }