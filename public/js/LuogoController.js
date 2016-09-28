(function() {
	'use strict';
	angular
			.module("helpParents", [ 'pascalprecht.translate' ])
			.config(function($translateProvider) {
				$translateProvider.translations('it', {
					cerca : 'Cerca',
					place : 'Città',
					tutti : "Tutti",
					fissi : "Fissi",
					temporanei : "Temporanei"

				}).translations('en', {
					cerca : 'Search',
					place : 'Place',
					tutti : "All",
					fissi : "Stationary",
					temporanei : "Temporary"
				});
				$translateProvider.preferredLanguage('it');
				$translateProvider.useSanitizeValueStrategy('escape');

			})
			.controller(
					'luogoCtrl',
					function($scope, $window, $translate, cerca) {

						$scope.changeLanguage = function(langKey) {
							$translate.use(langKey);
							$scope.lingua = langKey;
						};
						$scope.lingua = $translate.use();
					});

})();
