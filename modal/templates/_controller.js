'use strict';

angular.module('<%= appName %>')
	.controller('<%= controller %>', function ($scope, $rootScope, ModalService) {

		$scope.<%= showModal %> = false;
		
		$scope.$on(ModalService.Events.OPEN_MODAL, function(e, name){
			if(name == <%= modalCamel %>) {
				$scope.<%= showModal %> = true;
				// TODO More actions when opening <%= modalCamel %> modal?
			}
		});

		$scope.$on(ModalService.Events.CLOSE_MODAL, function(e, name){
			$scope.<%= showModal %> = false;
			// TODO More actions when closing <%= modalCamel %> modal?
		});		
	});