import express from 'express'
import cors from 'cors'
// import routes from './routes'
import { registerController } from './controllers/registerController.js'
import { connectDB } from './database.js';

const app = express();

app.use(cors());

connectDB();
// app.get('/', ()=>console.log("/ url"));
app.get('/', registerController);

// app.get('/register', registerUser);

app.listen(8000, ()=>{
    console.log("server is running on 8000")
})