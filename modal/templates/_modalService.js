'use strict';

angular.module('<%= appName %>')
	.factory('ModalService', function ($q, $rootScope) {
		var Events = {
				OPEN_MODAL: "ModalService:OPEN_MODAL",
				CLOSE_MODAL: "ModalService:CLOSE_MODAL"
			};
		return {
			Event: Events,
			open: function(name) {
				$rootScope.$broadcast( Events.OPEN_MODAL, name );
			},
			close: function(name) {
				$rootScope.$broadcast( Events.CLOSE_MODAL, name );
			}
		};
	});