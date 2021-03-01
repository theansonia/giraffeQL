const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const authRouter = require('./api/routes/auth');
const userRouter = require('./api/routes/user');
const profileRouter = require('./api/routes/profile');
const diagramsRouter = require('./api/routes/diagrams');
const scrapedbRouter = require('./api/db/services/scrapedb');
const aws = require('aws-sdk');
const settings = require('./settings.js')

const port = parseInt(process.env.PORT, 10) || 3000

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const s3 = new aws.S3();

const handle = app.getRequestHandler();
app
  .prepare()
  .then(() => {

    const server = express();

    server.use(bodyParser.json({ limit: '50mb' }));
    server.use(cookieParser());

    server.get('/sign-s3', (req, res) => {
      const { fileName, fileType } = req.query;
    
      const s3Params = {
        Bucket: settings.S3_BUCKET,
        Key: fileName,
        ContentType: fileType,
        ACL: 'public-read'
      };
      console.log(req.query)
      console.log(s3Params)

      s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
          console.error(err);
        } else {
          res.json({
            signedRequest: data,
            url: `https://${settings.S3_BUCKET}.s3.amazonaws.com/${fileName}`
          });
        }
       });
    });

    server.use((req, res, next) => {
      const hostname = req.hostname === 'www.giraffeql.io' ? 'giraffeql.io' : req.hostname;

      if (req.headers['x-forwarded-proto'] === 'http' || req.hostname === 'www.giraffeql.io') {
        console.log('redirect url: ', `https://${hostname}${req.url}`);
        res.redirect(301, `https://${hostname}${req.url}`);
        return;
      }

      res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
      next();
    });

    server.use(passport.initialize());

    passport.serializeUser(function (user, cb) {
      cb(null, user);
    });

    server.use('/auth', authRouter);
    server.use('/user', userRouter);
    server.use('/profile', profileRouter);
    server.use('/diagrams', diagramsRouter);

    server.post('/api/scrapedb', scrapedbRouter.scrapeDB);

    server.get('*', (req, res) => handle(req, res));

    server.use((err, req, res, next) => {
      const defaultErr = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: { err: 'An error occurred' },
      };
      const errorObj = Object.assign({}, defaultErr, err);
      console.log(errorObj.log);
      return res.status(errorObj.status).json(errorObj.message);
    });

    server.listen(
      port,
      error => {
        if (error) throw error;
        console.error(`Listening on port ${port}`);
      }
    );

  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });