'use strict';

angular.module('<%= appName %>')
	.controller('<%= controller %>', function ($scope, $rootScope, ModalService) {
		$scope.$on(ModalService.Events.OPEN_MODAL, function(e, name){
			if(name == <%= modalCamel %>) {
				// TODO More actions when opening <%= modalCamel %> modal?
			}
		});

		$scope.$on(ModalService.Events.CLOSE_MODAL, function(e, name){
			// TODO More actions when closing <%= modalCamel %> modal?
		});

		$scope.<%= modalClose %> = function() {
			$rootScope.$broadcast(ModalService.Events.CLOSE_MODAL, <%= modalCamel %>);
		}
	});