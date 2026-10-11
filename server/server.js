import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/routes.js';
import { redisConnect } from './utils/redis.js';
import { connectDB } from './database.js';

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Initialize Database & Redis
connectDB();
redisConnect();

// Mount Routes
app.use('/', userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
