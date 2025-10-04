import { Router } from 'express';
import { registerController } from '../controllers/registerController.js'
import { signinController } from '../controllers/signinController.js';

const routes = Router()
routes.get('/', ()=>console.log("/ url"));
routes.post('/register', registerController);
routes.post('/signin', signinController)

export default routes