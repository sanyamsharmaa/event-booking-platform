import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import userRoutes from './routes/routes.js'
import cookieParser from 'cookie-parser'
import { authZmiddleware } from './middlewares/authZ.middleware.js'
import {redis, redisConnect} from './utils/redis.js'


// import routes from './routes'
import { connectDB } from './database.js';
connectDB();

const app = express();
// {
//   origin: 'http://127.0.0.1:5500/', // Replace with your specific origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//   allowedHeaders: ['Content-Type', 'Authorization','application/json'], // Allowed headers
//   credentials: true // Optional: Allow credentials (cookies, auth headers)
// }
app.use(cors());
app.use(cookieParser())
app.use(express.json())

redisConnect();

// await redis.set('goat', 'cr7')
app.use('/',authZmiddleware,  userRoutes)


// app.get('/register', registerUser);

app.listen(8000, ()=>{
    console.log("server is running on 8000")
})