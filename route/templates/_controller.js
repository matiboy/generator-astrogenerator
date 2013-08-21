angular.module('<%= appName %>')
	.controller('<%= controllerName %>Ctrl', function($scope<% if(useService){ %>, <%= controllerName %>Service<% } %>) {
		// Define local variables

		// Set up event listeners

		// Define scope related functions
		<% if( subnavItems.length > 0) { %>$scope.activeSubNav = 0;
		$scope.changeSubNav = function(i) {
			$scope.activeSubNav = i;
		};<% } %>
		<% if(includeFooter) { _.each(footerButtons, function(item){ %>
		$scope.<%= item %>Click = function() {

		};<%}); } %>
	});