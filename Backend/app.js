'use strict';

const PORT = 3000;

import express from 'express';
import bodyParser from 'body-parser';
import routes from './src/routes/index';
import * as API from './src/apis';

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
