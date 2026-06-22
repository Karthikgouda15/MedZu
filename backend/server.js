import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import { initSocket } from './src/socket/index.js';
import { notFound, errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: true, // Allow all origins dynamically
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`MedZu server running on port ${PORT}`);
  });
};

start();
