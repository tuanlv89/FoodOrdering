'use strict';

const PORT = 3000;

import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index';
import user from './routes/user';
import restaurant from './routes/restaurant';
import menu from './routes/menu';
import food from './routes/food';
import size from './routes/size';
import addon from './routes/addon';
import order from './routes/order';

const app = express();

const publicDir = (__dirname + '/public');

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// import files
app.use('/', routes);

app.listen(PORT, () => {
    console.log('Server running...');
})
