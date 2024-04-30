require('dotenv').config()
const path = require('path') 
const express = require('express');
const { Router } = require("express");
const {getFirestore} = require("firebase-admin/firestore");
const bcryptjs = require('bcryptjs');
const {initializeApp, applicationDefault} = require('firebase-admin/app');
const morgan = require('morgan');

initializeApp({
    credential:applicationDefault()
});

const db =getFirestore();
const app = express();
const router = Router();

app.use(express.json());
const PORT = process.env.PORT || 3000
app.use(morgan("dev"));
app.use(express.json())
app.use(express.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname,'public')));

// Create product formulario
app.post("/create/product", async (req, res) => {
    const { name, cantidad, precio } = req.body;
    
    await db.collection("Productos").add({
        name,
        cantidad,
        precio,

    })
    if (!name || !cantidad || !precio) {
        return res.status(400).json({ error: 'Debes proporcionar nombre, cantidad y precio.' });
      
        return res.status(200).json({ message: 'Producto creado exitosamente.' });
    }
    
});
//get the characteristics of a specific product
app.get("/products/:product_id", async (req, res) => {
  try {
    const doc = db.collection("Productos").doc(req.params.product_id);
    const item = await doc.get();

    if (!item.exists) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const data = item.data();
    const response = {
      name: data.name,
      cantidad: data.cantidad,
      precio: data.precio
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return res.status(500).send(error);
  }
});
// prueba imprime en consola listado
app.get('/getproducts', async (req, res)=>{

    const querySnapshot = await db.collection('Productos').get()

    const productos = querySnapshot.docs.map(doc =>({
        Id: doc.id,
        ...doc.data()
    }))

    console.log(productos);


    res.send('Hello')
})

//get product imprime listad
app.get("/products", async (req, res) => {
  try {
    let query = db.collection("Productos");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      name: doc.data().name,
      cantidad: doc.data().cantidad,
      precio: doc.data().precio
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update product features
app.put("/products/:product", async (req, res) => {
  try {
    const document = db.collection("Productos").doc(req.params.product_id);
    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
    }

    if (req.body.cantidad) {
      updateData.cantidad = req.body.cantidad;
    }

    if (req.body.precio) {
      updateData.precio = req.body.precio;
    }

    await document.update(updateData);

    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
});
//delete product
app.delete("/products/delete/:product_id", async (req, res) => {
  try {
    const doc = db.collection("Productos").doc(req.params.product_id);
    await doc.delete();
    return res.status(200).json('Product was deleted successfully');
  } catch (error) {
    return res.status(500).send(error);
  }
});
///////////////////////////////////////////////////////////////////////////////////////
//Create admin user
app.post("/create/admin", async (req, res) => {
  try {
    const { user, password, email } = req.body; 

    if (!user || !password || !email) {
      return res.status(400).json('Se requieren el nombre de usuario, la contraseña y el correo electrónico.');
    }

    let passwordHash = await bcryptjs.hash(password, 8);

    await db
      .collection("cuentas")
      .doc(user)
      .create({ user, password: passwordHash, email });

    return res.status(200).json('Admin User was created');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//admin user authentication
app.post("/login/admin", async (req, res) => {
  const { user, password } = req.body; // Desestructura el objeto req.body

  if (!user || !password) {
    return res.status(400).json('Se requieren tanto el nombre de usuario como la contraseña.');
  }

  const docRef = db.collection("cuentas").doc(user);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const storedPassword = doc.data().password;
      const compare = bcryptjs.compareSync(password, storedPassword);

      if (compare) {
        return res.status(200).json("¡AUTENTICACIÓN EXITOSA!");
      } else {
        return res.status(401).json('Contraseña incorrecta');
      }
    } else {
      return res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al verificar el documento:", error);
    return res.status(500).json(error);
  }
});
//get admin users
app.get("/users/admin", async (req, res) => {
  try {
    let query = db.collection("cuentas");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      user: doc.data().user,
      email: doc.data().email
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update admin users
app.put("/users/admin/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;
    const { user, password, email } = req.body;

    const document = db.collection("cuentas").doc(users_id);
    const name = await document.get();

    if (!name.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    let updatedFields = {};

    if (user) {
      updatedFields.user = user;
    }

    if (password) {
      const passwordHash = await bcryptjs.hash(password, 8);
      updatedFields.password = passwordHash;
    }

    if (email) {
      updatedFields.email = email;
    }

    await document.update(updatedFields);

    return res.status(200).json('Usuario administrador actualizado correctamente');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//delete admin user
app.delete("/users/admin/delete/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;

    if (!users_id) {
      return res.status(400).json('Se requiere el ID del usuario administrador.');
    }

    const document = db.collection("cuentas").doc(users_id);
    const user = await document.get();

    if (!user.exists) {
      return res.status(404).json('Usuario administrador no encontrado');
    }

    await document.delete();

    return res.status(200).json('Usuario administrador eliminado correctamente');
  } catch (error) {
    console.error("Error al eliminar el usuario administrador:", error);
    return res.status(500).json(error);
  }
});
//Create customer user
app.post("/create/users", async (req, res) => {
  try {
    const { user, password, email } = req.body; 

    if (!user || !password || !email) {
      return res.status(400).json('Se requieren el nombre de usuario, la contraseña y el correo electrónico.');
    }

    let passwordHash = await bcryptjs.hash(password, 8);

    await db
      .collection("usuario")
      .doc(user)
      .create({ user, password: passwordHash, email });

    return res.status(200).json('Customer User was created');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//Customer user authentication
app.post("/login/users", async (req, res) => {
  const { user, password } = req.body; 

  if (!user || !password) {
    return res.status(400).json('Se requieren tanto el nombre de usuario como la contraseña.');
  }

  const docRef = db.collection("usuario").doc(user);

  try {
    const doc = await docRef.get();

    if (doc.exists) {
      const storedPassword = doc.data().password;
      const compare = bcryptjs.compareSync(password, storedPassword);

      if (compare) {
        return res.status(200).json("¡AUTENTICACIÓN EXITOSA!");
      } else {
        return res.status(401).json('Contraseña incorrecta');
      }
    } else {
      return res.status(404).send("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al verificar el documento:", error);
    return res.status(500).json(error);
  }
});
//get customer users
app.get("/users", async (req, res) => {
  try {
    let query = db.collection("usuario");
    const querySnapshot = await query.get();
    let docs = querySnapshot.docs;

    const response = docs.map((doc) => ({
      user: doc.data().user,
      email: doc.data().email
    }));

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//Update customer user
app.put("/users/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;
    const { user, password, email } = req.body;

    const document = db.collection("usuario").doc(users_id);
    const name = await document.get();

    if (!name.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    let updatedFields = {};

    if (user) {
      updatedFields.user = user;
    }

    if (password) {
      const passwordHash = await bcryptjs.hash(password, 8);
      updatedFields.password = passwordHash;
    }

    if (email) {
      updatedFields.email = email;
    }

    await document.update(updatedFields);

    return res.status(200).json('Usuario administrador actualizado correctamente');
  } catch (error) {
    return res.status(500).send(error);
  }
});
//delete customer user
app.delete("/users/delete/:users_id", async (req, res) => {
  try {
    const users_id = req.params.users_id;

    if (!users_id) {
      return res.status(400).json('Se requiere el ID del usuario administrador.');
    }

    const document = db.collection("usuario").doc(users_id);
    const user = await document.get();

    if (!user.exists) {
      return res.status(404).json('Usuario no encontrado');
    }

    await document.delete();

    return res.status(200).json('Usuario eliminado correctamente');
  } catch (error) {
    console.error("Error al eliminar el usuario administrador:", error);
    return res.status(500).json(error);
  }
});
app.listen(PORT,()=>{
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
module.exports = {
    db,
}
module.exports = app;