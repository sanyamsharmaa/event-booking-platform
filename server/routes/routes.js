import { Router } from 'express';
import { registerController } from '../controllers/registerController.js'
import { signinController } from '../controllers/signinController.js';
import { addEvent } from '../controllers/addEventController.js';
import { getEventList } from '../controllers/getEventList.js';
import {bookEvent, myEvents} from '../controllers/bookEvent.js';
import {Addbanners, Getbanners} from '../controllers/banners.js';
import {getArtist, artistProfile} from '../controllers/getArtist.js';
import { createOrder, verifyPayment } from '../controllers/payment.js';
import { recommendedShows } from '../controllers/recommendedShows.js';
import {trendingShows} from '../controllers/trendingShows.js';

const routes = Router()
routes.get('/', ()=>console.log("/ url"));
routes.post('/register', registerController);
routes.post('/signin', signinController)
routes.post('/add-event', addEvent)
routes.post('/get-events', getEventList)

routes.post('/create-order', createOrder);
routes.post("/verify-payment", verifyPayment);
routes.post('/book-event', bookEvent) 

routes.post('/recommended-shows',recommendedShows)
routes.post('/my-events', myEvents)
routes.post('/trending-shows',trendingShows)

routes.post('/search-artists', getArtist)
routes.post('/get-artist-profile', artistProfile)

routes.get('/banners', Getbanners)
routes.post('/banners', Addbanners)


export default routes