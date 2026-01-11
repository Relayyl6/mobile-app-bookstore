import { Router } from "express";
import { deleteUser, logIn, logout, register } from "../controller/auth.controller.js";

const userRouter = Router();

userRouter.post('/register', register);

userRouter.post('/log-in', logIn);

userRouter.post('/log-out/:id', logout)

userRouter.delete('/delete/:id', deleteUser)

export default userRouter