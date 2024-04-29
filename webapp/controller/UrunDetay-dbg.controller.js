sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/tupras/zsrmscp/model/models",
    "com/tupras/zsrmscp/model/formatter",
  ],
  function(e, t, r, a, s, i, o, n) {
    return e.extend("com.tupras.zsrmscp.controller.UrunDetay", {
      formatter: n,
      onInit: function() {
        this._mViewSettingsDialogs = {};
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("Details").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("arguments");
        var r = t.prodId;
        this.type = t.type;
        this.belgeNumarasi = t.belgeNumarasi;
        var a = [];
        a.push(
          new sap.ui.model.Filter("IvProdid", sap.ui.model.FilterOperator.EQ, r)
        );
        sap.ui.core.BusyIndicator.show();
        var s = this.getOwnerComponent().getModel();
        var i = this;
        s.read("/CatProdGetDetailSet", {
          filters: a,
          urlParameters: { $expand: "NavProdList,NavCharacDetail,NavReturn" },
          success: function(e, t) {
            var r = e.results[0].NavReturn.results;
            var a = e.results[0].NavProdList.results[0];
            var s = e.results[0].NavCharacDetail.results;
            a["Laeng"] = a["Laeng"] + "x" + a["Breit"] + "x" + a["Hoehe"];
            if (r.length !== 0) {
              i.openErrorList(r);
            } else {
              var o = new sap.ui.model.json.JSONModel();
              o.setData({ malzeme: a, karakter: s, cartCount: 0 });
              i.sepetSayisiniGuncelle();
              i.getView().setModel(o, "detailsModel");
            }
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
      onAddCart: function(e) {
        var t = e.getSource().getModel("detailsModel").getData().malzeme;
        if (t.Prodid === "") {
          i.error("Malzeme numarası boş olamaz.");
          return;
        }
        sap.ui.core.BusyIndicator.show();
        var r = this.getOwnerComponent().getModel();
        var a = this;
        if (
          this.belgeNumarasi &&
          this.belgeNumarasi != "" &&
          this.belgeNumarasi != "000000000"
        ) {
          var s = {
            IvLangu: "T",
            IvDokod: this.type,
            IvScnum: this.belgeNumarasi,
          };
        } else {
          var s = { IvLangu: "T", IvDokod: this.type };
        }
        var o = [];
        o.push({ Type: "" });
        var n = [];
        n.push({ Prodi: t.Prodid, Updkz: "I" });
        s.NavReturn = o;
        s.NavItem = n;
        r.create("/TemporaryUpdateSet", s, {
          success: function(e, t) {
            var r = e.NavReturn.results;
            if (r.length !== 0) {
              a.openErrorList(r);
            } else {
              a.sepetSayisiniGuncelle();
            }
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
      sepetSayisiniGuncelle: function() {
        var e = this.getOwnerComponent().getModel();
        var t = this.getView();
        var r = this;
        var a = [];
        a.push(
          new sap.ui.model.Filter(
            "Dokod",
            sap.ui.model.FilterOperator.EQ,
            this.type
          )
        );
        if (this.belgeNumarasi && this.belgeNumarasi != "000000000") {
          a.push(
            new sap.ui.model.Filter(
              "Scnum",
              sap.ui.model.FilterOperator.EQ,
              this.belgeNumarasi
            )
          );
        }
        t.setBusy(true);
        e.read("/TemporaryItemSet", {
          filters: a,
          success: function(e, t) {
            var a = e.results;
            var s = a.length;
            var i = r.getView();
            var o = i.getModel("detailsModel");
            o.getData().cartCount = s;
            o.refresh(true);
            i.setBusy(false);
          },
          error: function(e, r) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            t.setBusy(false);
          },
        });
      },
      onClickSepet: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        if (
          this.belgeNumarasi &&
          this.belgeNumarasi != "" &&
          this.belgeNumarasi != "000000000"
        ) {
          t.navTo("Cart_Catalog", {
            type: this.type,
            "belgeNumarası": this.belgeNumarasi,
          });
        } else {
          t.navTo("Cart", { type: this.type });
        }
      },
      onClickProfile: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Profile");
      },
      createViewSettingsDialog: function(e) {
        var t = this._mViewSettingsDialogs[e];
        if (!t) {
          t = sap.ui.xmlfragment(e, this);
          this._mViewSettingsDialogs[e] = t;
          if (a.system.desktop) {
            t.addStyleClass("sapUiSizeCompact");
          }
        }
        return t;
      },
      handleSortButtonPressed: function() {
        this.createViewSettingsDialog(
          "com.tupras.zsrmscp.fragments.SortDialog"
        ).open();
      },
      handleSortDialogConfirm: function(e) {
        var t = this.byId("idProductsTable"),
          a = e.getParameters(),
          s = t.getBinding("items"),
          i,
          o,
          n = [];
        i = a.sortItem.getKey();
        o = a.sortDescending;
        n.push(new r(i, o));
        s.sort(n);
      },
      onNavBack: function(e) {
        this.getOwnerComponent()
          .getRouter()
          .navTo("SearchPageNotRefresh", { type: this.type, yenile: false });
      },
      openErrorList: function(e) {
        var t = "";
        for (var r = 0; r < e.length; r++) {
          t += e[r].Message + "\n";
        }
        i.error(t);
      },
    });
  }
);
