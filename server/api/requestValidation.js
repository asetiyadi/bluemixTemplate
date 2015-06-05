var jwt 	= require('jwt-simple'),
	fs 		= require('fs'),
	user 	= require('./user');

var validateToken = function(req, res, next) {
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

	//Check if token is passed in
	if(token) {
		try {
			//Get the key to decode the token
			var key = JSON.parse(fs.readFileSync("./server/resources/bluemix.json","utf8")).applicationSecret;
			var decoded = jwt.decode(token, key);
			
			//DEBUGGING
			//var currentTime = new Date().getMinutes();

			var currentTime = Date.now();

			//Check for token expiration
			if(decoded.expiration <= currentTime) {
				res.json({
					"status": 401,
					"message": "Unauthorized: Token has expired"
				});
				res.status(401);
				return;
			}

			user.validateUser(decoded.credential.username, decoded.credential.password)
			.then(function(userObj) {
				next();
			})
			.fail(function(error) {
				res.json({
					"status": 401,
					"message": "Unauthorized: Invalid credentials - user not found"
				});
				res.status(401);
				return;
			});
		}
		catch(error) {
			res.json({
				"status": 401,
				"message": "Unauthorized: Invalid token"
			});
			res.status(401);
			return;
		}
	}
	else {
		res.json({
			"status": 401,
			"message": "Unauthorized: Token not found"
		});
		res.status(401);
		return;
	}
}

module.exports = {
	validateToken: validateToken
}
