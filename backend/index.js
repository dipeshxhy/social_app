import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { errorHandlerMiddleware } from './middlewares/errorHandler.js';

import authRouter from './routes/auth.route.js';
import messageRouter from './routes/message.route.js';
import notificationRouter from './routes/notification.route.js';
import postRouter from './routes/post.route.js';
import userRouter from './routes/user.route.js';
import APIError from './utils/apiError.js';
import { setIO } from './utils/socket.js';

const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200, // Forces clean 200 success handling for preflights
  }),
);

app.options('*', cors());

// Socket.io initialization remains identical
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

setIO(io);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(String(userId));
    }
  });
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ⚡ 2. Body and cookie parsers come AFTER CORS configuration rules
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8000;

app.get('/healthy', (req, res) => {
  res.status(200).send('Server is all healthy and running fine');
});

// ⚡ 3. Router logic routes follow
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/posts', postRouter);

app.all('/*splat', (req, res, next) => {
  throw APIError.notFound(`Can't find ${req.originalUrl} on this server!`);
});

app.use(errorHandlerMiddleware);

server.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on port ${port}`);
});
