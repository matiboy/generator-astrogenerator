angular.module('<%= appName %>')
	.controller('<%= controllerName %>Ctrl', function($scope<% if(useService){ %>, <%= controllerName %>Service<% } %>) {
		
	});