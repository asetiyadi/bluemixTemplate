var monk = require("monk"),
	jwt  = require("jwt-simple"),
	fs 	 = require("fs");
	q	 = require("q");

var monkdb = monk("mongodb://technician:technician@ds041180.mongolab.com:41180/IbmCloud_lqiun5ia_jnftshuu");

var registerUser = function(req, res) {
	console.log("new user info: " + JSON.stringify(req.body));

	var user = monkdb.get("user");
	user.insert(req.body.user, function(err, data) {
		if(err)
			res.send("ERROR: " + err);
	});
};

var verifyUser = function(req, res) {
	var user = monkdb.get("user");
	user.find({'username': req.body.username, 'password': req.body.password}, function(err, data) {
		if(err)
			res.send("ERROR: " + err);

		res.send(data);
	});
};

var login = function(req, res) {
	var username = req.body.username || "";
	var password = req.body.password || "";
	
	if(username === "" || password === "") {
		res.status(401);
		res.json({
			"status": 401,
			"message": "Invalid credentials - username or password is empty"
		});
		return;
	}

	validateUser(username, password)
	.then(function(userObj) {
		res.json(generateToken(userObj, password));
	})
	.fail(function(error) {
		res.json({
			"status": 401,
			"message": "Invalid credentials - user not found"
		});
		res.status(401);
		return;
	});
}

var validateUser = function(username, password) {
	var deferred = q.defer();

	//Check username/password against database
	var userDb = monkdb.get("user");
	var userObj = {};

	userDb.find({'username': username, 'password': password}, function(err, data) {
		if(err)
			return;

		if(data.length > 0) {
			
			userObj.username = username;
			userObj.firstname = data[0].firstname;
			userObj.lastname = data[0].lastname;
			userObj.email = data[0].email;
			userObj.techId = data[0].techId;

			deferred.resolve(userObj);
		}
		else {
			userObj.error = "No user found";
			deferred.reject(userObj);
		}
	});	

	return deferred.promise;
}

var generateToken = function(userObj, password) {
	//Set how long the token will stay valid
	var expires = setTokenExpiration(1);

	//Get the key to encode the token
	var key = JSON.parse(fs.readFileSync("./server/resources/bluemix.json","utf8")).applicationSecret;

	var token = jwt.encode({
		expiration: expires,
		credential: {
			username: userObj.username,
			password: password
		}
	}, key, 'HS512');

	var loginObj = {
		token: token,
		expires: expires,
		user: userObj
	};

	return loginObj;
}

var setTokenExpiration = function(interval) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + interval);

	//DEBUGGING
	//var dateGetMinutes = new Date().getMinutes() + interval;
	//return dateGetMinutes;
}

module.exports = {
	registerUser: registerUser,
	login: login,
	validateUser: validateUser,
	verifyUser: verifyUser
}