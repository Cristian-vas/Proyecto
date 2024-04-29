const express = require ('express')
const app = express()

//configuracion express
app.use(express.json())
const PORT = process.env.PORT || 3000

//configuracion de rutas
app.all('/', (req, res)=>{
    //El codigo para esa peticion
    res.send('Hola esta es la respuesta de mi petición raiz')
})

app.get('/getproducts', (req, res)=>{
    console.log("petición /getproducts realizada ")

    const read_products = [
        {"id": "A1", "Nombre": "Cocacola", "Precio": "1500", "En stock": 4},
        {"id": "B1", "Nombre": "Doritos", "Precio": "2500", "En stock": 10},
        {"id": "C1", "Nombre": "Gomitas", "Precio": "1500", "En stock": 3},
    ]
    res.status(200).json({status: "ok", products:read_products })
})

app.get('/searchproducts', (req, res)=>{
    console.log("petición /searchproducts realizada ")
    if (Object.keys(req.query).length === 0) {
        res.status(400).json({error: "Se requiere ID o nombre del producto "})
    }

    let product = {}

    if (req.query.hasOwnProperty('ID')) {
        if (req.query.ID === "A1") {
            product = {"id": "A1", "Nombre": "Cocacola", "Precio": "1500", "En stock": 4};
        } else if (req.query.ID === "B1") {
            product = {"id": "B1", "Nombre": "Doritos", "Precio": "2500", "En stock": 10};
        } else if (req.query.ID === "C1") {
            product = {"id": "C1", "Nombre": "Gomitas", "Precio": "1500", "En stock": 3};
        } else {
            res.status(404).json({error: "Producto no encontrado"})
        }
    }else if (req.query.hasOwnProperty('Nombre')) {
        if (req.query.Nombre === "Cocacola") {
            product = {"id": "A1", "Nombre": "Cocacola", "Precio": "1500", "En stock": 4}
        }else if (req.query.Nombre === "Doritos") {
            product = {"id": "B1", "Nombre": "Doritos", "Precio": "2500", "En stock": 10}
        }else if (req.query.Nombre === "Gomitas") {
            product = {"id": "C1", "Nombre": "Gomitas", "Precio": "1500", "En stock": 3}
        }else {
            res.status(404).json({error: "Producto no encontrado"})
        }
    }else{
        res.status(400).json({error: "Se requiere ID o nombre del producto "}) 

    }
    res.status(200).json({status: "ok", products: product })
})

app.post('/createUser', (req, res ) => {
    console.log("PETICION /createUser realizada")
    console.log(req.body)
    if (!req.body.hasOwnProperty('nombre') || !req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
        res.status(400).json({error:"Para crear un usuario se requiere contraseña, nombre y correo electronico"})
    }
    res.status(201).json({status: "ok", msj: "Usuario creado con exito"})
})

//iniciar escucha del puerto
app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
