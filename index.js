import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { errorMiddlerware } from './middlewares/error.js';
import messageRouter from './router/messageRouter.js'
import userRouter from './router/userRouter.js'
import timelineRouter from './router/timelindRouter.js'
import softwareApplicationRouter from './router/softwareApplicationRouter.js'
import skillRouter from './router/skillRouter.js'
import projectRouter from './router/projectRoute.js'


const app = express();

// Origin
app.use(cors({
  origin: [process.env.PORTFOLIO_URL, process.env.DASHBOARD_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/timeline", timelineRouter);
app.use("/api/v1/softwareapplication", softwareApplicationRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/project", projectRouter);

//   Database Connection
dotenv.config();
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true, // Enable TLS
  tlsAllowInvalidCertificates: true, // Useful for development
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
app.use(errorMiddlerware)
export default app;
// module.exports = app;
