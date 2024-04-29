# TEST_SERVER

Rutas activas del proyecto:
| Ruta | Metodo | Observaciones |
| ---- | ------ | ------- |
* | '/ ' | Cualquiera | Responde con texto un saludo |
* | '/getproducts' | GET | Responde un archivo JSON con la lista de productos |
* | '/searchproducts' | GET | Requiere ID o nombre (enviado por los __querys/parmas__) y devuelve el producto buscado si existe |
* | '/createUser' | post | Requiere nombre. email y contraseña (enviado por el __body__ de la peticion en formato JSON) y devuelve el estado de la creación del usuario |