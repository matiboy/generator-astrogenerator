	$scope.$on(<%= serviceName %>.Events.OPEN_MODAL, function(e){
		$scope.showModals = true;
	});
	$scope.$on(<%= serviceName %>.Events.CLOSE_MODAL, function(e){
		$scope.showModals = false;
	});