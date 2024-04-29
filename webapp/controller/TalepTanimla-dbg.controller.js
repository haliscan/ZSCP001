sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "com/tupras/zsrmscp/model/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
  ],
  function(e, t, o, i, a, n, r, s) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.TalepTanimla", {
      formatter: i,
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("TalepTanimla").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("name");
        this.oDataView = {
          tanim: "",
          not: "",
          kategori: "",
          miktar: "1,000",
          birim: "",
          netFiyat: "0",
          paraBirimi: "TRY",
          teslimatTarihi: new Date(),
        };
        this.bindView();
      },
      bindView: function() {
        var e = new t();
        e.setData(this.oDataView);
        this.getView().setModel(e, "talepModel");
      },
      handlePressOlustur: function() {
        console.log(this.getView().getModel("talepModel").getData());
      },
      onNavBack: function(e) {
        var t, i;
        t = o.getInstance();
        i = t.getPreviousHash();
        if (i !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("Menu");
        }
      },
      onClickHome: function(e) {
        this.getOwnerComponent().getRouter().navTo("Menu");
      },
    });
  }
);
