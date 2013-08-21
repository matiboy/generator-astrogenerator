angular.module('astro<%= controllerName %>')
	.provider('astro<%= controllerName %>Service', function() {
		// Get correct Url templates
		var Urls = {
			<% _.each( serviceMethods, function( method ) { %><% print(method.name.toUpperCase()) %>: _.template('<% if(method.method == "jsonp") { print(&format=jsonp&callback=JSON_CALLBACK) } %>'),
			<% }); %>
		};
		this.$get = function(astroApiUrls, $http) {
			return {<% _.each( serviceMethods, function( method ) { %>
				<%= method.name %>: function(<% _.each(method.parameters, function(parameter) { %><%= parameter %><% }) %>) {
					return $http.<%= method.method %>(Urls.<%= method.name.toUpperCase() %>({
						// Put url template variables here
					})<% if(method.method == 'post') { %>, {
						//Put post params here
					}<% } else if( method.method == 'get') { %>, {
						params: {
							// Put get parameters here
						}
					}<% } %>);
				},<% }); %>
			}
		}
	});