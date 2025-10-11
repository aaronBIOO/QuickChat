import express from 'express'
import { requireAuth } from '@clerk/express'
import {
  getUsers,
  getUserMessages,
  markAsSeen,
  sendUserMessage,
} from '@/controllers/message.controller.js'

const messageRouter = express.Router()

messageRouter.get('/users', requireAuth(), getUsers)
messageRouter.get('/users/:id', requireAuth(), getUserMessages)
messageRouter.put('/mark/:id', requireAuth(), markAsSeen)
messageRouter.post('/send/:id', requireAuth(), sendUserMessage)

export default messageRouter
