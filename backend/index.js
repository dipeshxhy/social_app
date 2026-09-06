import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';

const app = express();

// middleware
app.use(express.json()); //parse json payload
app.use(cookieParser()); // parse cookies
app.use(express.urlencoded({ extended: true })); //parse urlencoded payload

// CORS middleware
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent with requests,
  allowHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allow specific HTTP methods
};
app.use(cors(corsOptions));

const port = process.env.PORT || 8000;

app.get('/healthy', (req, res) => {
  res.status(200).send('Server is all healthy and running fine');
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the backend server!',
    success: true,
  });
});

app.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port http://localhost:${port}`);
});
