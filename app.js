if (!process.env.NODE_ENV) process.env.NODE_ENV='development'

var express     = require('express'),
    http        = require('http'),
    path        = require('path'),
    fs          = require('fs'),
    colors      = require('colors'),
    bodyParser  = require('body-parser'),
	ibmbluemix 	= require('ibmbluemix'),
	ibmdata     = require('ibmdata'),
    requestValidaton = require('./server/api/requestValidation');

var app = express();
var appConfig = JSON.parse(fs.readFileSync("./server/resources/bluemix.json","utf8"));
var clientDir = path.join(__dirname, 'public')


app.set('port', process.env.PORT || 8000)
app.use(express.static(clientDir)) 
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.all('/*', function(req, res, next) {
    //CORS Header
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

    //Custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Access-Token,X-Key");

    if(req.method == "OPTIONS") {
        res.status(200).end();
    }
    else {
        next();
    }
});

// init core sdk
ibmbluemix.initialize(appConfig);
var ibmconfig = ibmbluemix.getConfig();
var logger = ibmbluemix.getLogger();
logger.info("bluemix initialization complete");

app.get('/', function(req, res) {
  res.sendfile(path.join(clientDir, 'index.html'))
})

// init service sdks (if needed)
app.use(function(req, res, next) {
    //req.data = ibmdata.initializeService(req);
    //req.ibmpush = ibmpush.initializeService(req);
    req.logger = logger;
    next();
});


// init basics for an express app
app.use(require('./lib/setup'));

//uncomment below code to protect endpoints created afterwards by MAS
//var mas = require('ibmsecurity')();
//app.use(mas);

//If a request start with /api/v1/*, need to check if the token is valid.
app.all("/api/v1/*", [requestValidaton.validateToken]);

app.use("/", require("./server/routes"));


//logger.info('mbaas context root: '+ibmconfig.getContextRoot());
// "Require" modules and files containing endpoints and apply the routes to our application
//app.use(ibmconfig.getContextRoot(), require('./lib/accounts'));
//app.use(ibmconfig.getContextRoot(), require('./lib/staticfile'));

// Want to see how you can easily extend this template to work with third party node modules?
// If so, add the Twilio service to your Mobile Cloud application and uncomment this next line.
// app.use(ibmconfig.getContextRoot(), require('./lib/mytwilio')(ibmbluemix));

//app.listen(ibmconfig.getPort());
//logger.info('Server started at port: '+ibmconfig.getPort());

// **** SERVER CONFIG ****
var server = http.createServer(app)
//reload(server, app)

server.listen(app.get('port'), function(){
  console.log("Web server listening in %s on port %d", colors.red(process.env.NODE_ENV), app.get('port'));
});
