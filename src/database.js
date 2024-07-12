// process.loadEnvFile();

const { MongoClient } = require("mongodb");

const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI);

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Conexion existosa con MongoDB");
        return client;
    } catch (error) {
        console.error(error + " Error al conectar mongoDB");
        return null;
    }
}

async function disconnectFromMongoDB() {
    try {
        await client.close();
        console.log("Desconexión existosa con MongoDB");
    } catch (error) {
        console.error(error + " Error al desconectar mongoDB");
    }
}

module.exports = { connectToMongoDB, disconnectFromMongoDB }