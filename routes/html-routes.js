// load dependencies
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
// load helpers
var lbryApi = require('../helpers/lbryApi.js');
var queueApi = require('../helpers/queueApi.js');


function handleRequestError(error, res) {
	if ((error === "NO_CLAIMS") || (error === "NO_FREE_PUBLIC_CLAIMS")){
		res.status(307).sendFile(path.join(__dirname, '../public', 'noClaims.html'));
	} else if (error === "Invalid URI") {
		res.status(400).sendFile(path.join(__dirname, '../public', 'invalidUri.html'));
	} else {
		res.status(400).send(error);
	};
}

// routes to export
module.exports = function(app){
	// route to fetch one free public claim 
	app.get("/favicon.ico", function(req, res){
		console.log(" >> GET request on favicon.ico");
		res.sendFile(path.join(__dirname, '../public/assets/img', 'favicon.ico'));
	});
	// route to fetch one free public claim 
	app.get("/:name/all", function(req, res){
		console.log(">> GET request on /" + req.params.name + " (all)");
		// create promise
		lbryApi.getAllClaims(req.params.name)
		.then(function(orderedFreePublicClaims){
			console.log("/:name/all success.")
			res.status(200).send(orderedFreePublicClaims); 
			return;
		})
		.catch(function(error){
			console.log("/:name/all error:", error);
			handleRequestError(error, res);
		})
	});
	// route to fetch one free public claim 
	app.get("/:name/:claim_id", function(req, res){
		var uri = req.params.name + "#" + req.params.claim_id;
		console.log(">> GET request on /" + uri);
		// create promise
		lbryApi.getClaimBasedOnUri(uri)
		.then(function(filePath){
			console.log("/:name/:claim_id success.");
			res.status(200).sendFile(filePath);
		})
		.catch(function(error){
			console.log("/:name/:claim_id error.")
			handleRequestError(error, res);
		});
	});

	// route to fetch one free public claim 
	app.get("/:name", function(req, res){
		console.log(">> GET request on /" + req.params.name);
		// create promise
		lbryApi.getClaimBasedOnNameOnly(req.params.name)
		.then(function(filePath){
			console.log("/:name success.")
			res.status(200).sendFile(filePath);
		}).catch(function(error){
			console.log("/:name error.");
			handleRequestError(error, res);
		});
	});

	// route for the home page
	app.get("/", function(req, res){
		res.status(200).sendFile(path.join(__dirname, '../public', 'index.html'));
	});

	// a catch-all route if someone visits a page that does not exist
	app.use("*", function(req, res){
		res.status(404).sendFile(path.join(__dirname, '../public', 'fourOhfour.html'));
	});
}
