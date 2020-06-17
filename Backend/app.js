'use strict';

const PORT = 3000;

import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index';
const app = express();

const publicDir = (__dirname + '/public');

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// import files
app.use('/', routes);
const user = require('./routes/user');
const restaurant = require('./routes/restaurant');
const menu = require('./routes/menu');
const food = require('./routes/food');
const size = require('./routes/size');
const addon = require('./routes/addon');
const order = require('./routes/order');

app.listen(PORT, () => {
    console.log('Server running...');
})






/**
 * Api User
 */
app.get('/user', user.login);
app.post('/user', user.register);
/**
 * Api Restaurant
 */
app.get('/restaurant', restaurant.getAllRestaurants);
app.get('/restaurantById', restaurant.getRestaurantById);
app.get('/restaurantNearBy', restaurant.getRestaurantNearBy);
/**
 * Api Menu
 */
app.get('/menu', menu.getMenuByRestaurantId);
/**
 * Api Food
 */
app.get('/food', food.getFoodByMenuId);
app.get('/foodById', food.getFoodById);
app.get('/foodSearchByName', food.searchFoodByName);
/**
 * Api Size
 */
app.get('/size', size.getSizeByFoodId);
/**
 * Api AddOn
 */
app.get('/addon', addon.getAddOnByFoodId);
/**
 * Api Order
 */
app.get('/order', order.getOrder);
app.post('/createOrder', order.createOrder);