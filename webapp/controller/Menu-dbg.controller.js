sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function(e, t, o, i) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.Main", {
      formatter: i,
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("Menu").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function() {
        var e = this.getOwnerComponent().getModel();
        var o = this;
        sap.ui.core.BusyIndicator.show();
        e.read("/DocTypesSet", {
          success: function(e, i) {
            var n = e.results;
            var a = new t(n);
            o.getView().setModel(a, "menuModel");
            sap.ui.core.BusyIndicator.hide();
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            sap.ui.core.BusyIndicator.hide();
          },
        });
        sap.ui.core.BusyIndicator.show();
        e.read("/DocSubTypesSet", {
          success: function(e, i) {
            var n = e.results;
            var a = new t(n);
            o.getView().setModel(a, "subMenuModel");
            sap.ui.core.BusyIndicator.hide();
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            sap.ui.core.BusyIndicator.hide();
          },
        });
      },
      onPressGrid: function(e) {
        var t = e.getSource().getBindingContext("menuModel").getObject().Dtype;
        var o = e.getSource().getBindingContext("menuModel").getObject().Navi;
        var i = this.getView().getModel("subMenuModel").getData();
        var n = [];
        for (var a = 0; a < i.length; a++) {
          if (t === i[a].Dtype && i[a].Dokod === "") {
            n.push(i[a]);
          }
        }
        if (o === "Detail") {
          if (n.length !== 0) {
            this.openSubDialog(n);
          } else {
            this.toManuelSepet(Sutyp);
          }
        }
        if (o === "Talep") {
          if (n.length !== 0) {
            this.openSubDialog(n);
          } else {
            this.getOwnerComponent().getRouter().navTo("TalepListesi");
          }
        }
        if (o === "CantFind") {
          if (n.length !== 0) {
            this.openSubDialog(n);
          } else {
            this.getOwnerComponent().getRouter().navTo("TalepTanimla");
          }
        }
      },
      onPressGridAltMenu: function(e) {
        var t = e.getSource().getBindingContext("altDialogModel").getObject()
          .Sutyp;
        var o = e.getSource().getBindingContext("altDialogModel").getObject()
          .Dokod;
        var i = e.getSource().getBindingContext("altDialogModel").getObject()
          .Navi;
        var n = this.getView().getModel("subMenuModel").getData();
        var a = [];
        for (var s = 0; s < n.length; s++) {
          if (t === n[s].Dokod) {
            a.push(n[s]);
          }
        }
        if (i === "Detail") {
          if (a.length !== 0) {
            this.openSubTypeDialog(a);
          } else {
            this.toManuelSepet(t);
          }
        }
        if (i === "SCatalog") {
          this.getOwnerComponent()
            .getRouter()
            .navTo("CatalogPage", { type: t });
        }
        if (i === "Catalog") {
          this.getOwnerComponent().getRouter().navTo("SearchPage", { type: t });
        }
        if (i === "CantFind") {
          this.getOwnerComponent().getRouter().navTo("TalepTanimla");
        }
      },
      onPressGridAltSubMenu: function(e) {
        var t = e
          .getSource()
          .getBindingContext("altTypeDialogModel")
          .getObject().Sutyp;
        var o = e
          .getSource()
          .getBindingContext("altTypeDialogModel")
          .getObject().Navi;
        if (o === "Catalog") {
          this.getOwnerComponent().getRouter().navTo("SearchPage", { type: t });
        }
        if (o === "SCatalog") {
          this.getOwnerComponent()
            .getRouter()
            .navTo("CatalogPage", { type: t });
        }
        if (o === "Detail") {
          this.toManuelSepet(t);
        }
        if (o === "CantFind") {
          this.getOwnerComponent().getRouter().navTo("TalepTanimla");
        }
      },
      openSubDialog: function(e) {
        this.oSubDialog = sap.ui.xmlfragment(
          this.getView().getId(),
          "com.tupras.zsrmscp.view.Dialogs.AltMenuDialog",
          this
        );
        var o = new t();
        o.setData(e);
        this.oSubDialog.setModel(o, "altDialogModel");
        this.oSubDialog.open();
      },
      openSubTypeDialog: function(e) {
        this.oSubTypeDialog = sap.ui.xmlfragment(
          this.getView().getId(),
          "com.tupras.zsrmscp.view.Dialogs.AltMenuTypeDialog",
          this
        );
        var o = new t();
        o.setData(e);
        this.oSubTypeDialog.setModel(o, "altTypeDialogModel");
        this.oSubTypeDialog.open();
      },
      handlePressAltMenuKapat: function(e) {
        this.oSubDialog.close();
        this.oSubDialog.destroy();
      },
      handlePressAltSubMenuKapat: function(e) {
        this.oSubTypeDialog.close();
        this.oSubTypeDialog.destroy();
      },
      toManuelSepet: function(e) {
        var t = this.getView();
        var i = this.getOwnerComponent().getModel();
        var n = {};
        var a = [];
        n.IvCreWithTemp = true;
        n.IvType = "CREATE";
        n.IvDokod = e;
        var s = [];
        s.push({ Message: "" });
        var r = [];
        n.NavItem = r;
        n.NavReturn = s;
        n.NavHeader = a;
        var u = this;
        t.setBusy(true);
        i.create("/DocCreateSet", n, { success: l, error: g });
        function l(e, i) {
          t.setBusy(false);
          if (e.NavReturn.results.length == 0) {
            o.success(e.EvScnum + " numaralı belgeniz oluşturulmuştur.", {
              onClose: function(t) {
                u
                  .getOwnerComponent()
                  .getRouter()
                  .navTo("Goruntule", { BelgeNumarasi: e.EvScnum });
              },
            });
          } else {
            var n = e.NavReturn.results;
            t.setBusy(false);
            u.openErrorList(n);
          }
        }
        function g(e) {
          o.error(
            "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
          );
          t.setBusy(false);
        }
      },
    });
  }
);
