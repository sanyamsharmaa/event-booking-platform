import { Router } from 'express';
import { registerController } from '../controllers/registerController.js'

const routes = Router()
routes.get('/', ()=>console.log("/ url"));
routes.post('/register', registerController);

export default routes