import express from 'express'
import cors from 'cors'
import userRoutes from './routes/routes.js'

// import routes from './routes'
import { connectDB } from './database.js';
connectDB();

const app = express();


app.use(cors());
app.use(express.json())
app.use('/', userRoutes)


// app.get('/register', registerUser);

app.listen(8000, ()=>{
    console.log("server is running on 8000")
})