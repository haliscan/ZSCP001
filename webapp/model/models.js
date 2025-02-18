sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (e, n) {
	"use strict";
	return {
		createDeviceModel: function () {
			var i = new e(n);
			i.setDefaultBindingMode("OneWay");
			return i
		},
		createGlobalModel: function () {
			var n = new e;
			n.setDefaultBindingMode("OneWay");
			return n
		}
	}
});
//# sourceMappingURL=models.js.map