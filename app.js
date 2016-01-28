var connect = require('connect');
var logger = require('morgan');
var bodyParser = require('body-parser');
var xhr = require('request');
var app = connect();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(function (req, res) {
	// res.end('hello world\n');
	xhr.get('http://www.liuzhenwei.com.cn/api/users', function(error, response, body){
		if (!error && response.statusCode == 200) {
			res.end(body);
		}
	});
});
app.listen(3000);
