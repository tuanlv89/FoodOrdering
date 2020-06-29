import express from 'express';
import bodyParser from 'body-parser';
import routes from './src/routes/index';
import * as API from './src/apis';

const PORT = 3000;

const app = express();

const publicDir = (`${__dirname}/public`);

app.use(express.static(publicDir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

//--------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
})
// error handling
app.use((err, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send(err);
  } else next();
})
//--------------------------------------------------

app.listen(PORT, () => {
  console.log('Server running...');
})
