sap.ui.define(
  [
    "./BaseController",
    "sap/ui/core/routing/History",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/m/MessageBox",
  ],
  function(e, t, o, n, i) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.Profile", {
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("Profile").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function() {
        console.log("Profile");
      },
      onNavBack: function(e) {
        var o, n;
        o = t.getInstance();
        n = o.getPreviousHash();
        var i = this.getView().getModel("productsModel");
        if (i) {
          i.setData("");
        }
        this.getView().unbindElement();
        if (n !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("SearchPage", {}, true);
        }
      },
    });
  }
);
