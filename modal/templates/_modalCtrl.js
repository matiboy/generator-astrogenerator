'use strict';

angular.module('<%= appName %>').controller('ModalCtrl', function ($scope, $rootScope) {
	$scope.showModals = false;

	<%= modalStartSignal %>

	$scope.closeEverything = function(){
		$rootScope.$broadcast(ModalService.Events.CLOSE_MODALS);
	}
});