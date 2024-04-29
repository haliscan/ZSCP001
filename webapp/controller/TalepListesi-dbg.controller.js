sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    "sap/m/Token",
    "com/tupras/zsrmscp/utils/RefCreate",
  ],
  function(e, t, r, s, o, a, i, u, n) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.TalepListesi", {
      formatter: r,
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("TalepListesi").attachMatched(this._onRouteMatched, this);
        var t;
        var r = jQuery.sap.getModulePath("com.tupras.zsrmscplist");
        this._refCreate = new n();
      },
      _onRouteMatched: function(e) {},
      onPress: function(e) {
        this._showObject(e.getSource());
      },
      _showObject: function(e) {
        var t = e.getBindingContext().getPath().substring(12, 22);
        this.toRequest(t);
      },
      toRequest: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Goruntule", { BelgeNumarasi: e });
        return;
        var r = this.oView.getModel("i18n").getResourceBundle();
        if (sap.ushell) {
          var s = sap.ushell.Container.getLogonSystem("system").getName();
        } else {
          var s = "TGD";
        }
        if (s == "TGD") {
          var o = r.getText("requestDev");
          o = o + e;
        } else if (s == "TGQ") {
          var o = r.getText("requestDev");
        } else if (s == "TGP") {
          var o = r.getText("requestDev");
        } else {
          var o = r.getText("requestDev");
          o = o + e;
        }
        sap.ui.require(["sap/m/library"], ({ URLHelper: e }) =>
          e.redirect(o, true)
        );
      },
      refCreate: function(e) {
        this._refCreate.createRef(e, this);
      },
      deleteRequest: function(e) {
        this._refCreate.deleteRef(e, this);
      },
    });
  }
);
