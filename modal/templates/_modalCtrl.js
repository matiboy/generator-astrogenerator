'use strict';

angular.module('<%= appName %>').controller('ModalCtrl', function ($scope, $rootScope, ModalService) {
	$scope.showModals = false;
	$scope.$on(ModalService.Events.CLOSE_MODAL, function(){
		$scope.showModals = false;
	});
	$scope.closeEverything = function(){
		$rootScope.$broadcast(ModalService.Events.CLOSE_MODAL);
	}
	$scope.$on(ModalService.Events.OPEN_MODAL, function() {
		$scope.showModals = true;
	});
});