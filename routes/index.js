var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('../config');
var authy = require('authy')(config.authyApiKey); // ask me

var connection = mysql.createConnection({
    host     : 'studmysql01.fhict.local',
    user     : config.dbusername, // ask me
    password : config.dbpassword, // ask me
    database : config.dbname // ask me
});
var app = express();
app.use(session({
    secret: config.sessionsecret, // ask me
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response,cb) {
    var self = this;
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = false;
                request.session.twofactor = true;
                request.session.username = username;
                request.session.authyid = results[0].authyid;
                console.log(results[0].authyid)

                authy.request_sms(results[0].authyid,true, function (err, res) {
                    console.log(res);
                    console.log(err);
                });
                response.redirect('/2fa');
            } else {
                response.send('Incorrect Username and/or Password!');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});
app.get('/2fa', function (request, response){
    if (request.session.twofactor) {
        response.sendFile(path.join(__dirname + '/2factor.html'));
    } else {
        request.session.loggedin = false;
        request.session.twofactor = false;
        response.send('Please login to view this page!');
    }
});
app.post('/verify', function(request, response){
    var self = this;
    var otp = request.body.otp;
    authy.verify(request.session.authyid, token=otp, true, function (err, res) {
        console.log(res);
        console.log(err);
        if(err==null){
            request.session.twofactor = false;
            request.session.loggedin = true;
            response.redirect('/home');
        }
        else{
            response.send('Wrong token, please login again to access this page')
        }
    });
});

module.exports = router;
app.listen(8080);