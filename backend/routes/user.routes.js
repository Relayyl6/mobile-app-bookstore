import { Router } from "express";
import { deleteUser, logIn, logout, register } from "../controller/auth.controller.js";

const userRouter = Router();

userRouter.post('/register', register);

userRouter.post('/log-in', logIn);

userRouter.post('/log-out/:id', logout)

userRouter.delete('/delete/:id', deleteUser)

// TODO: add route to update a user information and softdelete(deactivate) and recover an accoutn

export default userRouter