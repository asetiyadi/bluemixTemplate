var express 	= require("express"),
	user        = require('../api/user');
	//inspection 	= require('../api/inspection');

var router = express.Router();

//Routes that can be accessed by anyone .. no token is required
router.post("/login", user.login);

//Only authenticated users can access the following api
//sample API: router.get('/api/v1/checklist/:inspectionType', inspection.getChecklist);


module.exports = router;