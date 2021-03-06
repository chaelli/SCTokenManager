﻿/// <reference path="angular.js" />
(function () {
	'use strict';

	var app = angular
        .module('app')
        .controller('tokenselectorcontroller', tokenselectorcontroller);

	tokenselectorcontroller.$inject = ['$http', 'tokenfactory', '$sce'];
	app.filter("sanitize", ['$sce', function ($sce) {
		return function (htmlCode) {
			return $sce.trustAsHtml(htmlCode);
		}
	}]);
	function tokenselectorcontroller($http, tokenfactory, $sce) {

		var vm = this;
		vm.category = "";
		vm.token = "";
		vm.tokens = [];
		vm.data = new Object();
		vm.events = {
			'click': function (val) { }
		};
		vm.groupedClicked = function(field) {
			vm.data[field].grouped.id = vm.events[field];
		}
		vm.clicked = function (field) {
			vm.data[field] = vm.events[field];
		}
		tokenfactory.tokenCategories().then(function (response) {
			vm.categories = response.data;
		}, function (response) {
			vm.error = response.data;
		});
		vm.loadTokens = function (category) {
			if (category === vm.category)
				vm.category = "";
			else {
				tokenfactory.tokens(category).then(function (response) {
					vm.tokens = response.data;
					vm.category = category;
					if (!vm.fields)
						vm.token = "";
					else if (vm.preset && vm.fields.length === 0 && vm.category !== "" && vm.token !== "")
						vm.returnToken(vm.category, vm.token);
				}, function (response) {
					vm.error = response.data;
				});
			}
		}
		vm.reset = function () {
			vm.selectedToken = "";
			vm.category = "";
			vm.token = "";
			vm.tokens = [];
			tokenfactory.tokenCategories().then(function (response) {
				vm.categories = response.data;
			}, function (response) {
				vm.error = response.data;
			});
		}
		vm.returnToken = function (category, token) {
			vm.token = token;
			if (typeof (window.parent.scTokenSelectorCallback) != "undefined") {
				tokenfactory.tokenIdentifier(category, token).then(function (response) {
					if (response.data.Fields === null || response.data.Fields.length === 0) {
						window.parent.scTokenSelectorCallback(null, response.data.TokenIdentifier+"&nbsp;");
						scCloseRadWindow();
					} else {
						vm.fields = response.data.Fields;
					}
				}, function (response) {
					vm.error = response.data;
				});
			} else {
				tokenfactory.tokenStats(category, token).then(function (response) {
					vm.tokenStats = response.data;
					vm.selectedToken = true;
				}, function (response) {
					vm.error = response.data;
				});
			}
		}
		vm.submit = function () {
			var valid = true;
			for (var i = 0; i < vm.fields.length; i++) {
				if (vm.fields[i].Required && (typeof (vm.data[vm.fields[i].Name]) === "undefined" || vm.data[vm.fields[i].Name] === '')) {
					valid = false;
					vm.fields[i].class = "token-data-invalid";
				} else
					vm.fields[i].class = "";
			}
			if (valid)
				tokenfactory.tokenIdentifier(vm.category, vm.token, vm.data).then(function (response) {
					window.parent.scTokenSelectorCallback(null, response.data.TokenIdentifier);
					scCloseRadWindow();
				}), function (response) {
					vm.error = response.data;
				};
		}
		if (typeof (window.parent.scTokenSelectorCallback) !== "undefined")
			tokenfactory.getSelectedToken().then(function (response) {
				if (typeof (tmPreset) !== "undefined" && tmPreset) {
					document.getElementById("tmtitle").innerText = document.getElementById("tmtitle").innerText.replace("Token Manager",response.data.Category + " " +  response.data.Token);
					if (window.location.href.indexOf("?command=TokenSelector&") === -1)
						vm.preset = true;
				}
				if (response.data.Category)
					vm.loadTokens(response.data.Category);
				vm.fields = response.data.Fields;
				vm.token = response.data.Token;
				vm.data = response.data.FieldValues;
				if (!vm.data)
					vm.data = new Object();
			}, function (response) {
				vm.error = response.data;
			});
	}
})();