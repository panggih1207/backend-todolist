import { Router } from "express";
import { getTodos } from "./todos.service";



export const router = Router ();
router.get('/api/get/todos' , getTodos)