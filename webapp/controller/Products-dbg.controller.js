sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/Popup",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function(e, t, i, a, r, o, s) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.Products", {
      onInit: function() {
        this.getCategories();
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("Products").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("arguments");
        this.type = t.category;
        var i = this.getView().getModel("productsModel");
        var a = this.getView().getModel("familyModel");
        if (typeof i !== "undefined") {
          this.getView().getModel("productsModel").setData("");
        }
        if (typeof a !== "undefined") {
          this.getView().getModel("familyModel").setData("");
        }
        this.beforeListData();
        var r = this.type;
        var o = new sap.ui.model.json.JSONModel();
        o.setData(r);
        this.getView().setModel(o, "categoryPageModel");
        var s = [];
        if (r[r.length - 1] === "_") {
          var n = r.split("_");
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
              r
            )
          );
        }
        sap.ui.core.BusyIndicator.show();
        var u = this.getOwnerComponent().getModel();
        var l = this;
        u.read("/KategoriSet", {
          filters: s,
          urlParameters: { $expand: "NavKategori,NavUrun" },
          success: function(e, t) {
            var i = e.results[0].NavUrun.results;
            var a = e.results[0].NavKategori.results;
            var r = new sap.ui.model.json.JSONModel();
            var o = new sap.ui.model.json.JSONModel();
            r.setData({ productListesi: i });
            o.setData(a);
            l.getView().setModel(r, "productsModel");
            l.getView().setModel(o, "familyModel");
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
        var a = this.getOwnerComponent().getModel();
        var r = this;
        a.read("/KategoriSet", {
          filters: i,
          urlParameters: { $expand: "NavKategori,NavUrun" },
          success: function(e, i) {
            var a = e.results[0].NavUrun.results;
            var o = new sap.ui.model.json.JSONModel();
            o.setData({ productListesi: a, kategoriAdi: t.KategoriAdi });
            r.getView().setModel(o, "productsModel");
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
          var a = this;
          var r = new sap.ui.model.json.JSONModel();
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
              r.setData(i);
              r.setSizeLimit(100);
              a.getView().setModel(r, "helperSearchModel");
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
          var a = sap.ui.core.UIComponent.getRouterFor(this);
          a.navTo("Products", { category: t + "_" });
        }
      },
      handlePressOpenMenu: function(e) {
        var t = e.getSource();
        if (!this._menu) {
          a
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
                  r.Dock.BeginTop,
                  r.Dock.BeginBottom,
                  t
                );
              }.bind(this)
            );
        } else {
          this._menu.open(
            this._bKeyboard,
            t,
            r.Dock.BeginTop,
            r.Dock.BeginBottom,
            t
          );
        }
      },
      handleMenuItemPress: function(e) {
        i.show("'" + e.getParameter("item").getText() + "' pressed");
        var t = e.getParameter("item").getText();
        var a = this.getView().getModel("kategoriModel").getData();
        var r = a.find(function(e) {
          return e.KategoriAdi === t;
        });
        var o = r.MalGrubu;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Products", { category: o });
      },
      getCategories: function() {
        sap.ui.core.BusyIndicator.show();
        var e = this.getOwnerComponent().getModel();
        var t = this;
        e.read("/KategoriHiyerarsiSet", {
          success: function(e, i) {
            var a = e.results;
            var r = new sap.ui.model.json.JSONModel();
            r.setData(a);
            t.getView().setModel(r, "kategoriModel");
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
        var a = e.getSource();
        var r = a.getParent().indexOfItem(a);
        var o = t[r].Name;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Details", { category: i, detail: o });
      },
      onNavBack: function(e) {
        var i, a;
        i = t.getInstance();
        a = i.getPreviousHash();
        var r = this.getView().getModel("productsModel");
        if (r) {
          r.setData("");
        }
        this.getView().unbindElement();
        if (a !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("SearchPage", {}, true);
        }
      },
      onClickHome: function(e) {
        var t = this.getView().getModel("productsModel");
        if (t) {
          t.setData("");
        }
        this.getView().unbindElement();
        this.getOwnerComponent().getRouter().navTo("SearchPage");
      },
      onClickSepet: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Cart");
      },
      onClickProfile: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("Profile");
      },
      onPressGrid: function(e) {
        var t = this.getView().getModel("productsModel").getData()
          .productListesi;
        var i = e.getSource();
        var a = i.getParent().indexOfItem(i);
        var r = t[a].UrunNo;
        var o = t[a].KategoriAdi;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Details", { category: o, detail: r });
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
