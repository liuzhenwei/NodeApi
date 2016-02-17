var http = require('http');
var querystring = require('querystring');
var connect = require('connect');
var logger = require('morgan');
var bodyParser = require('body-parser');
var httpReq = require('request');

const ApiDomain = 'http://10.200.246.120';

var app = connect();

app.use(logger('dev'));
app.use('/getAll', bodyParser.urlencoded({extended: false}));
app.use(function (req, res) {
	if( !(req.body && req.body.data) ){
		res.end(JSON.stringify({"errorCode": 1, "errorDesc": "route error"}));
		return;
	}

	var postData = JSON.parse(req.body.data);

	var promisesReq = [ApiDomain + '/api/users/' + postData.user, ApiDomain + '/api/products/' + postData.product];

	promisesReq = promisesReq.map(function(url){
		return new Promise(function(resolve, reject){
			httpReq.get(url, {timeout: 3000}, function(error, response, body){
				if (!error && response.statusCode == 200) {
					resolve(body);
				} else {
					reject(error.code);
				}
			});
		});
	});

	var resData = {};

	Promise.all(promisesReq).then(function(rets){
		resData.errorCode = 0;
		for( var i = 0; i < rets.length; i ++ ){
			var _data = JSON.parse(rets[i]);
			if( _data.errorCode == 0 ){
				_data.users && (resData.users = _data.users);
				_data.products && (resData.products = _data.products);
			}
		}
		res.end(JSON.stringify(resData));
	}).catch(function(reason){
		res.end(JSON.stringify({"errorCode": -1, "errorDesc": reason}));
	});

	// 基础写法
	// http.get(ApiDomain + '/api/users/' + postData.user, function(resStream){
	// 	if (resStream.statusCode == 200) {
	// 		var ret = '';
	// 		resStream.on('data', (data) => {
	// 			console.log(data);
	// 			ret += data;
	// 		});
	// 		resStream.on('end', () => {
	// 			res.end(ret);
	// 		});
	// 	}
	// });
});
app.listen(3000);
