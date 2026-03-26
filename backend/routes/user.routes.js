import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  deleteUser,
  getMyProfile,
  logIn,
  logout,
  register,
  updateMyProfile,
} from "../controller/auth.controller.js";

const userRouter = Router();

userRouter.post('/register', register);

userRouter.post('/log-in', logIn);

userRouter.post('/log-out/:id', logout)

userRouter.delete('/delete/:id', deleteUser)
userRouter.get('/me', authMiddleware, getMyProfile);
userRouter.patch('/me', authMiddleware, updateMyProfile);

// TODO: add route to update a user information and softdelete(deactivate) and recover an accoutn

export default userRouter
