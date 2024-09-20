import express from 'express';
import { deleteMessages, getAllMessages, sendMessage } from '../controller/messageControler.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post("/send", sendMessage)
router.get('/getall', getAllMessages)
router.delete('/delete/:id', isAuthenticated, deleteMessages)

export default router;