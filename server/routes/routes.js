import { Router } from 'express';
import { registerController } from '../controllers/registerController.js';
import { signinController } from '../controllers/signinController.js';
import { addEvent } from '../controllers/addEventController.js';
import { getEventList } from '../controllers/getEventList.js';
import { bookEvent, myEvents } from '../controllers/bookEvent.js';
import { Addbanners, Getbanners } from '../controllers/banners.js';
import { getArtist, artistProfile } from '../controllers/getArtist.js';
import { createOrder, verifyPayment } from '../controllers/payment.js';
import { recommendedShows } from '../controllers/recommendedShows.js';
import { trendingShows } from '../controllers/trendingShows.js';
import { myShows, updateEvent, deleteEvent } from '../controllers/artistShowsController.js';
import { authenticate, authorizeRoles } from '../middlewares/authZ.middleware.js';

const routes = Router();

// Health Check / Root
routes.get('/', (req, res) => {
    return res.status(200).json({ success: true, message: "Event Booking API is running" });
});

// Auth Routes (Public)
routes.post('/register', registerController);
routes.post('/signin', signinController);

// Discovery & Public Event Routes
routes.post('/get-events', getEventList);
routes.get('/banners', Getbanners);
routes.post('/trending-shows', trendingShows);
routes.post('/search-artists', getArtist);
routes.post('/get-artist-profile', artistProfile);

// Protected User Routes (Requires Authentication)
routes.post('/recommended-shows', authenticate, recommendedShows);
routes.post('/create-order', authenticate, createOrder);
routes.post('/verify-payment', authenticate, verifyPayment);
routes.post('/book-event', authenticate, bookEvent);
routes.post('/my-events', authenticate, myEvents);

// Protected Artist Routes (Requires Authentication + Artist Role)
routes.post('/add-event', authenticate, authorizeRoles('artist'), addEvent);
routes.post('/artist/my-shows', authenticate, authorizeRoles('artist'), myShows);
routes.post('/artist/update-event', authenticate, authorizeRoles('artist'), updateEvent);
routes.post('/artist/delete-event', authenticate, authorizeRoles('artist'), deleteEvent);
routes.post('/banners', authenticate, authorizeRoles('artist', 'admin'), Addbanners);

export default routes;
