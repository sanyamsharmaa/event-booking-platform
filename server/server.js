import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRoutes from './routes/routes.js'
import cookieParser from 'cookie-parser'
import { authZmiddleware } from './middlewares/authZ.middleware.js'


// import routes from './routes'
import { connectDB } from './database.js';
connectDB();

const app = express();



app.use(cors());
app.use(cookieParser())
app.use(express.json())
app.use('/',authZmiddleware,  userRoutes)


// app.get('/register', registerUser);

app.listen(8000, ()=>{
    console.log("server is running on 8000")
})