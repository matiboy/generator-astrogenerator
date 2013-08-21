var serviceMethods = module.exports = [
	{
		name: 'load',
		value: 'load',
		parameters: [],
		method: 'get'
	},
	{
		name: 'get',
		value: 'get',
		parameters: [
			'id'
		],
		method: 'post',
		cacheKey: '(function(id){ return id; })(id)'
	},
	{
		name: 'update',
		value: 'update',
		parameters: [
			'id',
			'dsaasd'
		],
		method: 'jsonp',
		cacheKey: '(function(id){ return id; })(id)'
	}
];