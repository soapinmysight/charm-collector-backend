import express from 'express';
import mongoose from "mongoose";
import scoreEntries from "./routes/scoreEntries.js";

const app = express();
mongoose.connect(process.env.MONGO_URL);

// To allow retrieval of information in json only, the accept header is checked.
app.use((req, res, next)=>{
    // Check what header client accepts
    const acceptHeader = req.headers['accept'];
    console.log(`Client accepteert ${acceptHeader}`)
    //if json is one of the headers that client accepts, send message
    // if (req.header.includes('Accept') === 'application/json' || req.method === 'OPTIONS'){
        if ((acceptHeader && acceptHeader.includes('application/json')) || req.method === 'OPTIONS') {
        //send to next tasks
        next();
    } else {
        // if json is NOT one of the headers that client accepts, send 406 status
        res.status(406).send('Format not allowed, did you forget to accept json?');
    }
});

// CORS Middleware
app.use((req, res, next) => {
    // Laat alle origins toe.
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Specificeer de toegestane headers, waaronder content-type en accept
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorisation');
        next();
});

// Content-type control: The middleware supports both JSON and x-www-form-urlencoded for incoming requests via:
// Middleware voor JSON-gegevens
app.use(express.json());
// Middleware voor www-urlencoded-gegevens
app.use(express.urlencoded({extended: true}));


//set base route
app.use('/scoreEntries', scoreEntries)

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is listening on port http://145.24.222.134:${process.env.EXPRESS_PORT}/`);
});
