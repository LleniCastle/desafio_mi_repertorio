import express from "express";
import { logger } from "logger-express"; //tambn se puede usar morgan
import path from 'path';
import fs from 'fs';

const PORT = 3000;

//middleware
const app = express();
app.use(express.json()) //se indica a express que trabajaremos con json
app.use(logger());

const __dirname = path.resolve();
const filePath = path.join(__dirname, 'repertorio.json');

//rutas get unicas leidas por navegador
// no se puede tener rutas iguales con mismo metodo, en este caso se ejecutara la primera o arrojara error

//RUTAS
//ruta home
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

//ruta get con json
//Devuelve un JSON con las canciones registradas en el repertorio
//obtener
app.get('/canciones', (req, res) => {
    try {
        const songs = JSON.parse(fs.readFileSync(filePath, "utf8"));
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ messege: 'recurso no disponible' });
    }
});

//Recibe los datos correspondientes a una canción y la agrega al repertorio.
//crear
//body, bolsita donde se pueden cargar cosas, req.body o res.body
app.post('/canciones', (req, res) => {
    try {
        const newSong = req.body;  //pasa ["datos"]
        const songs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        songs.push(newSong) //[{"data"}]
        fs.writeFileSync(filePath, JSON.stringify(songs)); //escribir el archivo...//[{"data"}]        
        res.status(201).json("cancion agregada")
    } catch (error) {
        res.status(500).json({ message: 'algo salio mal' + error });
    }
    //res.json({message:'soy post json'});
});

//Recibe los datos de una canción que se desea editar y la actualiza manipulando el JSON local.
//semana pasada
//editar
app.put('/canciones/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id); //para traer el id tambn sirbe const {id} = req. params
        const songs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const songIndex = songs.findIndex(song => song.id === id);
        if (songIndex !== -1) {
            songs[songIndex] = { id, ...req.body };
            fs.writeFileSync(filePath, JSON.stringify(songs));
            res.status(200).json({ message: 'cancion editada' });
        } else {
            res.status(404).json({ message: 'cancion no encontrada' })
        }
    } catch (error) {
        res.status(500).json({ message: 'algo salio mal' + error });
    }
});

//Recibe por queryString el id de una canción y la elimina del repertorio.
//semana pasada
//eliminar
app.delete('/canciones/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let songs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        songs = songs.filter(song => song.id !== id);
        fs.writeFileSync(filePath, JSON.stringify(songs));
        res.status(200).json({ message: 'cancion eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'algo salio mal' + error });
    }
});

//all para cualquier ruta, siempre debe ir al final
app.all('*', (req, res) => {
    res.status(404).send('Ruta no existe')
});

app.listen(PORT, console.log(`server on http://localhost:${PORT}`));

//codigos de estado, mensaje de error
//100-199 denota una respuesta informativa.
//200-299 denota una solicitud exitosa.
//300-399 denota una redirección.
//400-499 indica un error del cliente.
//500-599 denota un error del servidor.
