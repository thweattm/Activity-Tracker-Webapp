/**********************************************
* Name: Mike Thweatt
* Class: CS290
* Due Date: 08-13-17
* Description: Activity Tracker - Final Project
***********************************************/

//Express
var express = require('express');
var app = express();
//Handlebars
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//MySQL
var mysql = require('./dbcon.js');
//Misc
app.set('port', 9156);
app.use(express.static('public'));


//Load homepage
app.get('/',function(req,res,next){
	res.render('home');
});

//Add new item to database
app.post('/insert', function(req, res, next){
	var context = {};
	var values = [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.lbs];
	var sql = "INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?)"
	
	mysql.pool.query(sql, [values], function(err, result){
		if(err){
		  next(err);
		  return;
		}
		//Set results
		if(result.affectedRows = 1){
			context.success = true;
			context.insertId = result.insertId;
			res.writeHead(200);
		} else {
			context.success = false;
			res.writeHead(500);
		}
		
		res.end(JSON.stringify(context));
	});
});

//Delete item from database
app.post('/delete', function(req, res, next){
	var context = {};
	var values = [req.body.id];
	var sql = "DELETE FROM workouts WHERE id = ?"
	
	mysql.pool.query(sql, [values], function(err, result){
		if(err){
			next(err);
			return;
		}
		//Set results
		if(result.affectedRows = 1){
			context.success = true;
			res.writeHead(200);
		} else {
			context.success = false;
			res.writeHead(500);
		}
		
		res.end(JSON.stringify(context));
	});
});

//Return single entry
app.post('/query', function(req, res, next){
	var context = {};
	var sql = 'SELECT * FROM workouts WHERE id = ?'
	
	mysql.pool.query(sql, [req.body.id], function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		//Set results
		context.success = true;
		context.results = JSON.stringify(rows);
		res.writeHead(200);
		res.end(JSON.stringify(context));
	});
});

//Edit an entry
app.post('/edit', function(req, res, next){
	var context = {};
	var sql = 'SELECT * FROM workouts WHERE id=?'
	mysql.pool.query(sql, [req.body.id], function(err, result){
		if (err){
			next(err);
			return;
		}
		if(result.length == 1){
			var curActivity = result[0];
			var values = {name: req.body.name || curActivity.name, 
						reps: req.body.reps || curActivity.reps, 
						weight: req.body.weight || curActivity.weight, 
						date: req.body.date || curActivity.date, 
						lbs: req.body.lbs || curActivity.lbs};
			var id = {id: req.body.id};
			var sql = 'UPDATE workouts SET ? WHERE ?'
			mysql.pool.query(sql, [values, id], function(err, result){
				if(err){
					next(err);
					return;
				}
				//Set results
				context.success = true;
				res.writeHead(200);
				res.end(JSON.stringify(context));
			});
		} else {
			//Set results
			context.success = false;
			res.writeHead(500);
			res.end(JSON.stringify(context));
		}
	});
});

//Return table contents
app.post('/get-table', function(req, res, next){
	var context = {};
	mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
		if(err){
		  next(err);
		  return;
		}
		context.success = true;
		context.results = JSON.stringify(rows);
		res.writeHead(200);
		res.end(JSON.stringify(context));
	});
});

//Destroys and creates new table
app.get('/reset-table',function(req,res,next){
	mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ 
		var createString = "CREATE TABLE workouts("+
			"id INT PRIMARY KEY AUTO_INCREMENT,"+
			"name VARCHAR(255) NOT NULL,"+
			"reps INT,"+
			"weight INT,"+
			"date DATE,"+
			"lbs BOOLEAN)";
		mysql.pool.query(createString, function(err){
			//res.render('home',context);
			res.writeHead(200);
			res.end();
    })
  });
});

//Error 404 - Page not found
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

//Error handler	
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

//Start server
app.listen(app.get('port'), function(){
  console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port'));
  console.log('Press Ctrl-C to terminate.')
});