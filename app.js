var connect = require('connect');
var logger = require('morgan');
var bodyParser = require('body-parser');
var httpReq = require('request');

const ApiDomain = 'http://liuzhenwei.com.cn';


function loadApi(arrApi, res){
	var promisesReq = arrApi.map(function(url){
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

	Promise.all(promisesReq)
		.then(function(rets){
			resData.errorCode = 0;
			for( var i = 0; i < rets.length; i ++ ){
				var _data = JSON.parse(rets[i]);
				if( _data.errorCode == 0 ){
					_data.users && (resData.users = _data.users);
					_data.products && (resData.products = _data.products);
				}
			}
			res.end(JSON.stringify(resData));
		})
		.catch(function(reason){
			res.end(JSON.stringify({"errorCode": -1, "errorDesc": reason}));
		});
}


var app = connect();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));

app.use('/getUser', function(req, res, next){
	var postData = JSON.parse(req.body.data);
	loadApi([ApiDomain + '/api/users/' + postData.user], res);
});

app.use('/getAll', function(req, res, next){
	var postData = JSON.parse(req.body.data);
	loadApi([ApiDomain + '/api/users/' + postData.user, ApiDomain + '/api/products/' + postData.product], res);
});

app.use(function (req, res) {
	res.end(JSON.stringify({"errorCode": 9, "errorDesc": "route error"}));
});

app.listen(3000);
