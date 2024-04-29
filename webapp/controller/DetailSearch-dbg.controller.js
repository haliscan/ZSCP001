sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/Popup",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
  ],
  function(e, t, i, r, a, o, s, n, u) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.DetailSearch", {
      onInit: function() {
        var e = new u();
        var t = { cartCount: 0 };
        e.setData(t);
        this.getView().setModel(e, "viewModel");
        var i = this.getOwnerComponent().getRouter();
        i.getRoute("DetailSearch").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("arguments");
        this.type = t.type;
        this.searchText = t.searchText;
        var i = this.getView().getModel("productsModel");
        var r = this.getView().getModel("familyModel");
        if (typeof i !== "undefined") {
          this.getView().getModel("productsModel").setData("");
        }
        if (typeof r !== "undefined") {
          this.getView().getModel("familyModel").setData("");
        }
        this.beforeListData();
        var a = this.type;
        var o = new sap.ui.model.json.JSONModel();
        o.setData(a);
        this.getView().setModel(o, "categoryPageModel");
        var s = [];
        if (a[a.length - 1] === "_") {
          var n = a.split("_");
          s.push(
            new sap.ui.model.Filter(
              "ArananKelime",
              sap.ui.model.FilterOperator.EQ,
              n[0]
            )
          );
        } else {
          s.push(
            new sap.ui.model.Filter(
              "MalGrubu",
              sap.ui.model.FilterOperator.EQ,
              a
            )
          );
        }
        var u = this.getOwnerComponent().getModel();
        var l = this;
        this.sepetSayisiniGuncelle();
        this.handlePressSearchProduct();
      },
      beforeListData: function() {
        var e = this.getView();
        var t = e.byId("listProductsProduct");
        var i = [];
        i.push(new o("Sctype", s.EQ, this.type));
      },
      onFilterCategoryPress: function(e) {
        var t = e.getSource().getBindingContext("familyModel").getObject();
        var i = [];
        i.push(
          new sap.ui.model.Filter(
            "MalGrubu",
            sap.ui.model.FilterOperator.EQ,
            t.MalGrubu
          )
        );
        sap.ui.core.BusyIndicator.show();
        var r = this.getOwnerComponent().getModel();
        var a = this;
        r.read("/KategoriSet", {
          filters: i,
          urlParameters: { $expand: "NavKategori,NavUrun" },
          success: function(e, i) {
            var r = e.results[0].NavUrun.results;
            var o = new sap.ui.model.json.JSONModel();
            o.setData({ productListesi: r, kategoriAdi: t.KategoriAdi });
            a.getView().setModel(o, "productsModel");
            sap.ui.core.BusyIndicator.hide();
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            sap.ui.core.BusyIndicator.hide();
          },
          async: true,
        });
      },
      getSearchFields: function(e) {
        var t = this.getView().byId("searchInput").getValue();
        if (t.length > 2) {
          var i = this.getOwnerComponent().getModel();
          var r = this;
          var a = new sap.ui.model.json.JSONModel();
          var o = [];
          o.push(
            new sap.ui.model.Filter(
              "ArananKelime",
              sap.ui.model.FilterOperator.EQ,
              t
            )
          );
          i.read("/HizliAramaSet", {
            filters: o,
            success: function(e, t) {
              var i = e.results;
              a.setData(i);
              a.setSizeLimit(100);
              r.getView().setModel(a, "helperSearchModel");
            },
            error: function(e, t) {
              sap.m.MessageBox.error(
                "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
              );
              sap.ui.core.BusyIndicator.hide();
            },
          });
        }
      },
      handlePressSearchCategory: function(e) {
        var t = this.getView().byId("searchInput").getValue();
        if (t === "") {
          sap.m.MessageBox.error(
            "Boş arama yapmayınız yada bir Kategori seçerek devam ediniz."
          );
        } else {
          i.show("'" + t + "' pressed");
          var r = sap.ui.core.UIComponent.getRouterFor(this);
          r.navTo("Products", { category: t + "_" });
        }
      },
      handleNavigateSearch: function(e) {
        var t = this.getView().byId("searchInput")._lastValue;
        var i = sap.ui.core.UIComponent.getRouterFor(this);
        i.navTo("DetailSearch", { type: this.type, searchText: t });
      },
      handlePressSearchProduct: function(e) {
        var t = [];
        var i = this.searchText;
        var r = i.length;
        if (i != "#" && r < 4) {
          n.warning(d.getText("searchTextLengthErr"));
          return;
        }
        if (i == "#") {
          return;
        }
        this.getView().byId("searchInput").setValue(i);
        var a = this.getView().byId("detailList");
        var u = this.getView().byId("detailListObj");
        t.push(new o("SearchString", s.EQ, i));
        var l = this.getView();
        var d = l.getModel("i18n").getResourceBundle();
        a.bindAggregation("items", {
          path: "/CatProdListSet",
          template: u,
          filters: t,
          events: {
            dataReceived: function(e) {
              var t = e.getParameter("data")["results"].length;
              if (t < 1) {
                n.information(d.getText("recordNotFound"));
              }
            },
          },
        });
      },
      onPressSepeteEkle: function(e) {
        var t = this.getView().byId("detailList");
        var i = t.getSelectedItems();
        var r = [];
        if (i.length === 0) {
          n.error("Lütfen sepete eklemek istediğiniz kalemleri seçiniz.");
          return;
        }
        for (var a = 0; a < i.length; a++) {
          r.push({
            Prodid: i[a].getBindingContext().getObject().Prodid,
            Prodtx: i[a].getBindingContext().getObject().Prodtx,
            Categtx: i[a].getBindingContext().getObject().Categtx,
          });
        }
        this.postSepeteEkle(r);
      },
      postSepeteEkle: function(e) {
        sap.ui.core.BusyIndicator.show();
        var t = this.getOwnerComponent().getModel();
        var i = this.getView().byId("detailList");
        var r = this.getView();
        var a = this;
        var o = { IvDokod: this.type };
        var s = [];
        s.push({ Type: "" });
        var u = [];
        for (var l = 0; l < e.length; l++) {
          u.push({ Prodi: e[l].Prodid, Updkz: "I", Prodtx: e[l].Prodtx });
        }
        o.NavReturn = s;
        o.NavItem = u;
        t.create("/TemporaryUpdateSet", o, {
          success: function(e, t) {
            var r = e.NavReturn.results;
            if (r.length !== 0) {
              a.openErrorList(r);
            } else {
              a.sepetSayisiniGuncelle();
              i.removeSelections();
              n.success(
                "Seçilen kalem sepete başarılı bir şekilde eklenmiştir."
              );
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
        var i = this;
        var r = [];
        r.push(
          new sap.ui.model.Filter(
            "Dokod",
            sap.ui.model.FilterOperator.EQ,
            this.type
          )
        );
        t.setBusy(true);
        e.read("/TemporaryItemSet", {
          filters: r,
          success: function(e, t) {
            var r = e.results;
            var a = r.length;
            var o = i.getView();
            var s = o.getModel("viewModel");
            s.getData().cartCount = a;
            s.refresh(true);
            o.setBusy(false);
          },
          error: function(e, i) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            t.setBusy(false);
          },
        });
      },
      onClickSepet: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Cart", { type: this.type });
      },
      openErrorList: function(e) {
        var t = "";
        for (var i = 0; i < e.length; i++) {
          t += e[i].Message + "\n";
        }
        n.error(t);
      },
      handlePressOpenMenu: function(e) {
        var t = e.getSource();
        if (!this._menu) {
          r
            .load({
              name: "com.tupras.zsrmscp.fragments.Categories",
              controller: this,
            })
            .then(
              function(e) {
                this._menu = e;
                this.getView().addDependent(this._menu);
                this._menu.open(
                  this._bKeyboard,
                  t,
                  a.Dock.BeginTop,
                  a.Dock.BeginBottom,
                  t
                );
              }.bind(this)
            );
        } else {
          this._menu.open(
            this._bKeyboard,
            t,
            a.Dock.BeginTop,
            a.Dock.BeginBottom,
            t
          );
        }
      },
      handleMenuItemPress: function(e) {
        i.show("'" + e.getParameter("item").getText() + "' pressed");
        var t = e.getParameter("item").getText();
        var r = this.getView().getModel("kategoriModel").getData();
        var a = r.find(function(e) {
          return e.KategoriAdi === t;
        });
        var o = a.MalGrubu;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Products", { category: o });
      },
      getCategories: function() {
        sap.ui.core.BusyIndicator.show();
        var e = this.getOwnerComponent().getModel();
        var t = this;
        e.read("/KategoriHiyerarsiSet", {
          success: function(e, i) {
            var r = e.results;
            var a = new sap.ui.model.json.JSONModel();
            a.setData(r);
            t.getView().setModel(a, "kategoriModel");
            sap.ui.core.BusyIndicator.hide();
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            sap.ui.core.BusyIndicator.hide();
          },
          async: true,
        });
      },
      onListItemPress: function(e) {
        var t = this.getView().getModel("productsModel").getData();
        var i = this.getView().getModel("categoryPageModel").getData();
        var r = e.getSource();
        var a = r.getParent().indexOfItem(r);
        var o = t[a].Name;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Details", { category: i, detail: o });
      },
      onNavBack: function(e) {
        var i, r;
        i = t.getInstance();
        r = i.getPreviousHash();
        var a = this.getView().getModel("productsModel");
        if (a) {
          a.setData("");
        }
        this.getView().unbindElement();
        if (r !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("SearchPage", {}, true);
        }
      },
      onClickHome: function(e) {
        var t = this.getOwnerComponent().getRouter();
        t.navTo("Menu");
      },
      onClickProfile: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Profile");
      },
      onPressGrid: function(e) {
        var t = e.getSource().getBindingContext().getObject().Prodid;
        var i = sap.ui.core.UIComponent.getRouterFor(this);
        i.navTo("Details", { prodId: t, type: this.type });
      },
      onCantFind: function() {
        this.getOwnerComponent().getRouter().navTo("CantFind");
      },
      onClickGecmis: function() {
        this.getOwnerComponent().getRouter().navTo("GecmisSiparisler");
      },
      onDetayliArama: function(e) {
        this.detayliAramaDialog = sap.ui.getCore().byId("detayliAramaDialog");
        if (!this.detayliAramaDialog) {
          this.detayliAramaDialog = sap.ui.xmlfragment(
            "com.tupras.zsrmscp.fragments.DetayliArama",
            this
          );
        }
        jQuery.sap.syncStyleClass(
          "sapUiSizeCompact",
          this.getView(),
          this.detayliAramaDialog
        );
        this.detayliAramaDialog.open();
      },
    });
  }
);
