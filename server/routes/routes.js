import { Router } from 'express';
import { registerController } from '../controllers/registerController.js'
import { signinController } from '../controllers/signinController.js';
import { addEvent } from '../controllers/addEventController.js';
import { getEventList } from '../controllers/getEventList.js';

const routes = Router()
routes.get('/', ()=>console.log("/ url"));
routes.post('/register', registerController);
routes.post('/signin', signinController)
routes.post('/add-event', addEvent)
routes.post('/get-events', getEventList)

export default routes