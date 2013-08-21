angular.module('<%= appName %>')
	.provider('<%= controllerName %>Service', function() {
		this.$get = function($q, astro<%= controllerName %>Service<% if(needsCache){ %>, $cacheFactory<% } %>) {
			<% if(needsCache){ %>var cache = $cacheFactory('<%= controllerName %>Service');<% } %>
			return {<% _.each( serviceMethods, function( method ) { %>
				<%= method.name %>: function(<% _.each(method.parameters, function(parameter) { %><%= parameter %><% }) %>) {
					<% if(method.cache) { %>var key=<% if(method.cacheKey) { if(method.cacheKey.indexOf("function") !=-1) { %><%= method.cacheKey %><% } else { %>'<%= method.cacheKey %>'<% } } else { %>'<%= method.name %>'<% } %>;
					var cachedValue = cache.get(key);
					if(cachedValue){
						var q = $q.defer();
						q.resole(cachedValue);
						return q.promise;
					} else {
						return astro<%= controllerName %>Service.<%= method.name %>(<% _.each(method.parameters, function(parameter) { %><%= parameter %><% }) %>)
							.then(function(resp){
								return resp.data;
							}, function(err){
								throw err;
							});
					}
					<% } else { %>
						return astro<%= controllerName %>Service.<%= method.name %>(<% _.each(method.parameters, function(parameter) { %><%= parameter %><% }) %>)
							.then(function(resp){
								return resp.data;
							}, function(err){
								throw err;
							});
					<% } %>
				},<% }); %>
			}
		}
	});