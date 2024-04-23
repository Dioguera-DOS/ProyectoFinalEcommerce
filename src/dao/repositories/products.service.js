const productosModel = require('../models/productos.model');

class ProductsDAO {
    constructor() {        

    }

    getProducts = async (page, limite) => {
        //let getProducts = await productosModel.paginate({}, { lean: true, limit: 5, page: page }).lean()
        let getProducts = await productosModel.paginate({}, { lean: true, limit: limite === null ? 5 : limite, page: page })
        return getProducts

    }

    getById = async (id) => {
        let getProductsById = await productosModel.findOne({_id:id}).lean()
        return  getProductsById

    }

    createProducts = async(productData)=>{

        const lastProduct = await productosModel.findOne()
        .sort({ id: -1 })
        .limit(1)
        .lean();
        
        
        //const lastProductId = lastProduct ? lastProduct.id : 0;
        const lastProductId = lastProduct ? lastProduct.id : 0;
        console.log(lastProductId)
        const newProductId = lastProductId + 1;

  
        const productWithId = { ...productData, id: newProductId }; 

        console.log(productWithId)

        
        let createProduct = await productosModel.create(productWithId)

        return createProduct
    }

    delProduct = async(id)=>{
        let delProd = await productosModel.deleteOne({id:id})
        return delProd

    }

    updateProd = async(id, data)=>{
        let upProd = await productosModel.updateOne({_id:id}, data)
        return upProd

    }

    

}

module.exports = {ProductsDAO}