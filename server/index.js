// app dependencies
const express = require('express');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const http = require('http');
const logger = require('winston');
const requestLogger = require('middleware/requestLogger.js');

function Server () {
  this.configureLogger = (loggerConfig) => {
    require('loggerConfig.js').configure(loggerConfig);
  }
  this.configureMysql = (mysqlConfig) => {
    require('mysqlConfig.js').configure(mysqlConfig);
  };
  this.configureSiteDetails = (siteConfig) => {
    require('siteConfig.js').configure(siteConfig);
    this.sessionKey = siteConfig.auth.sessionKey;
    this.PORT = siteConfig.details.port;
  };
  this.configureSlack = (slackConfig) => {
    require('slackConfig.js').configure(slackConfig);
  };
  this.configureClientBundle = () => {
    console.log('configure the client here by passing in the bundle and configuring it, or better yet: taking in the components to use dynamically from here.');
  }
  this.configureModels = () => {
    console.log('here is where you could add/overwrite the default models')
  }
  this.configureRoutes = () => {
    console.log('here is where you could add/overwrite the default routes')
  }
  this.createApp = () => {
    // create an Express application
    const app = express();

    // trust the proxy to get ip address for us
    app.enable('trust proxy');

    // add middleware
    app.use(helmet()); // set HTTP headers to protect against well-known web vulnerabilties
    app.use(express.static(`${__dirname}/public`)); // 'express.static' to serve static files from public directory
    // note: take in a different public folder, so it can serve it's own bundle from there?
    app.use(bodyParser.json()); // 'body parser' for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // 'body parser' for parsing application/x-www-form-urlencoded

    // add custom middleware (note: build out to accept dynamically use what is in server/middleware/
    app.use(requestLogger);

    // configure passport
    const speechPassport = require('speechPassport');
    // initialize passport
    app.use(cookieSession({
      name  : 'session',
      keys  : [this.sessionKey],
      maxAge: 24 * 60 * 60 * 1000, // i.e. 24 hours
    }));
    app.use(speechPassport.initialize());
    app.use(speechPassport.session());

    // configure handlebars & register it with express app
    const hbs = expressHandlebars.create({
      defaultLayout: 'embed',
      handlebars   : Handlebars,
    });
    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');

    // set the routes on the app
    require('./routes/auth/')(app);
    require('./routes/api/')(app);
    require('./routes/pages/')(app);
    require('./routes/assets/')(app);
    require('./routes/fallback/')(app);

    this.app = app;
  };
  this.initialize = () => {
    // require('./helpers/configureLogger.js')(logger);
    // require('./helpers/configureSlack.js')(logger);
    this.createApp();
    this.server = http.Server(this.app);
  };
  this.start = () => {
    const db = require('./models/');
    // sync sequelize
    db.sequelize.sync()
    // start the server
      .then(() => {
        this.server.listen(this.PORT, () => {
          logger.info(`Server is listening on PORT ${this.PORT}`);
        });
      })
      .catch((error) => {
        logger.error(`Startup Error:`, error);
      });
  };
};

module.exports = Server;