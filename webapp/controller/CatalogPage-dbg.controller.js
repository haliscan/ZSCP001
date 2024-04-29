sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/Popup",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "com/tupras/zsrmscp/model/formatter",
  ],
  function(e, t, r, i, a, s, o, n, u, g) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.CatalogPage", {
      formatter: g,
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("CatalogPage").attachMatched(this._onRouteMatched, this);
        e
          .getRoute("CatalogPage_Catalog")
          .attachMatched(this._onRouteMatched, this);
        e
          .getRoute("CatalogPageNotRefresh")
          .attachMatched(this._onRouteMatchedNotRefresh, this);
        this.bindView();
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("name");
        var r = e.getParameter("arguments");
        this.type = r.type;
        this.belgeNumarasi = r.belgeNumarasi;
        this.sepetSayisiniGuncelle();
        var i = this.getView().byId("categoryList");
        this.getCategoryTopData();
      },
      _onRouteMatchedNotRefresh: function(e) {
        var t = e.getParameter("name");
        var r = e.getParameter("arguments");
        this.type = r.type;
        this.getCategoryTopData();
      },
      bindView: function() {
        var e = new a();
        var t = { cartCount: 0 };
        e.setData(t);
        this.getView().setModel(e, "viewModel");
      },
      getCategoryTopData: function() {
        var e = this.getOwnerComponent().getModel();
        var t = this.getView();
        var r = this;
        var i = [];
        t.setBusy(true);
        var t = r.getView();
        var a = t.getModel("viewModel");
        e.read("/StoksuzVendorListSet", {
          filters: i,
          success: function(e, t) {
            var i = r.getView();
            var a = i.getModel("viewModel");
            var s = [];
            e.results.forEach(e => {
              var t = { Matkl: e["VendorName"], Partner: e["PartnerId"] };
              s.push(t);
            });
            a.setProperty("/TopCategories", s);
            a.setProperty("/CategoryTopSet", s);
            a.setProperty("/TopCategory", false);
            a.refresh(true);
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
      getCategoryData: function(e, t) {
        var r = t.getOwnerComponent().getModel();
        var i = t.getView();
        var a = i.getModel("viewModel");
        var s = a.getData();
        var o = [];
        var n = e.getSource().getProperty("title");
        var u = e.getSource().getBindingContextPath();
        var g = u.split("/")[2];
        o.push(
          new sap.ui.model.Filter(
            "Tanim",
            sap.ui.model.FilterOperator.EQ,
            s["CategoryTopSet"][g]["Partner"]
          )
        );
        i.setBusy(true);
        r.read("/MapCategoriesSet", {
          filters: o,
          success: function(e, t) {
            a.setProperty("/CategoryTopSet", e.results);
            a.setProperty("/TopCategory", true);
            a.refresh(true);
            i.setBusy(false);
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            i.setBusy(false);
          },
        });
      },
      getExtItems: function(e, t) {
        var r = t.getOwnerComponent().getModel();
        var i = t.getView();
        var a = [];
        var s = e.getSource().getBindingContextPath();
        var o = i.getModel("viewModel").getProperty(s)["ZMappingCat"];
        a.push(
          new sap.ui.model.Filter("Categid", sap.ui.model.FilterOperator.EQ, o)
        );
        a.push(
          new sap.ui.model.Filter(
            "Lifnr",
            sap.ui.model.FilterOperator.EQ,
            t.vendor
          )
        );
        var n = this.getView().byId("listProducts");
        var u = this.getView().byId("prodObjItem");
        n.bindAggregation("items", {
          path: "/ExtMaterialSet",
          template: u,
          filters: a,
        });
      },
      handlePressCategoryItem: function(e) {
        var t = this.getView();
        var r = t.getModel("viewModel");
        var i = r.getData();
        var a = e.getSource().getBindingContextPath();
        var s = a.split("/")[2];
        if (r.getProperty("/TopCategory") == false) {
          this.getCategoryData(e, this);
          this.vendor = i["CategoryTopSet"][s]["Partner"];
        } else {
          this.getExtItems(e, this);
        }
      },
      HandleNavButton: function() {
        var e = this.getView();
        var t = e.getModel("viewModel");
        t.setProperty("/CategoryTopSet", t.getProperty("/TopCategories"));
        t.setProperty("/TopCategory", false);
      },
      filterCategoryList: function(e) {
        var t = [];
        var r = this.getView().byId("listProducts");
        var i = this.getView().byId("prodObjItem");
        this.categoryFilter = [];
        if (e["nodes"].length == 0) {
          t.push(new o("Categid", n.EQ, e["text"]));
        } else {
          e["nodes"].forEach(e => {
            var r = e["text"];
            t.push(new o("Categid", n.EQ, r));
          });
        }
        this.categoryFilter = t;
        r.bindAggregation("items", {
          path: "/StoksuzVendorListSet",
          template: i,
          filters: t,
        });
      },
      beforeListData: function() {
        var e = this.getView();
        var t = e.byId("listProducts");
        var r = [];
        r.push(new o("Sctype", n.EQ, this.type));
        t.getBinding("items").filter(r);
      },
      onPressSepeteEkle: function(e) {
        var t = this.getView().byId("listProducts");
        var r = t.getSelectedItems();
        var i = [];
        if (r.length === 0) {
          s.error("Lütfen sepete eklemek istediğiniz kalemleri seçiniz.");
          return;
        }
        for (var a = 0; a < r.length; a++) {
          i.push({
            Prodid: r[a].getBindingContext().getObject().Prodid,
            Prodtx: r[a].getBindingContext().getObject().Prodtx,
            Categtx: r[a].getBindingContext().getObject().Categtx,
          });
        }
        this.postSepeteEkle(i);
      },
      postSepeteEkle: function(e) {
        sap.ui.core.BusyIndicator.show();
        var t = this.getOwnerComponent().getModel();
        var r = this.getView().byId("listProducts");
        var i = this.getView();
        var a = this;
        var o = this.getView().getModel("viewModel");
        var n = o.getData()["TopCategories"][0]["Partner"];
        if (this.belgeNumarasi && this.belgeNumarasi != "") {
          var u = { IvDokod: this.type, IvScnum: this.belgeNumarasi };
        } else {
          var u = { IvDokod: this.type };
        }
        var g = [];
        g.push({ Type: "" });
        var l = [];
        for (var d = 0; d < e.length; d++) {
          l.push({
            Prodi: e[d].Prodid,
            Updkz: "I",
            Prodtx: e[d].Prodtx,
            Lifnr: n,
          });
        }
        u.NavReturn = g;
        u.NavItem = l;
        t.create("/TemporaryUpdateSet", u, {
          success: function(e, t) {
            var i = e.NavReturn.results;
            if (i.length !== 0) {
              a.openErrorList(i);
            } else {
              a.sepetSayisiniGuncelle();
              r.removeSelections();
              s.success(
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
        var r = this;
        var i = [];
        i.push(
          new sap.ui.model.Filter(
            "Dokod",
            sap.ui.model.FilterOperator.EQ,
            this.type
          )
        );
        if (this.belgeNumarasi) {
          i.push(
            new sap.ui.model.Filter(
              "Scnum",
              sap.ui.model.FilterOperator.EQ,
              this.belgeNumarasi
            )
          );
        }
        t.setBusy(true);
        e.read("/TemporaryItemSet", {
          filters: i,
          success: function(e, t) {
            var i = e.results;
            var a = i.length;
            var s = r.getView();
            var o = s.getModel("viewModel");
            o.getData().cartCount = a;
            o.refresh(true);
            s.setBusy(false);
          },
          error: function(e, r) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            t.setBusy(false);
          },
        });
      },
      getSearchFields: function(e) {
        var t = this.getView().byId("searchInput").getValue();
        if (t.length > 2) {
          var r = this.getOwnerComponent().getModel();
          var i = this;
          var a = new sap.ui.model.json.JSONModel();
          var s = [];
          s.push(
            new sap.ui.model.Filter(
              "ArananKelime",
              sap.ui.model.FilterOperator.EQ,
              t
            )
          );
          r.read("/HizliAramaSet", {
            filters: s,
            success: function(e, t) {
              var r = e.results;
              a.setData(r);
              i.getView().setModel(a, "helperSearchModel");
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
      getCategories: function() {
        sap.ui.core.BusyIndicator.show();
        var e = this.getOwnerComponent().getModel();
        var t = this;
        e.read("/KategoriHiyerarsiSet", {
          success: function(e, r) {
            var i = e.results;
            var a = new sap.ui.model.json.JSONModel();
            a.setData(i);
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
                  i.Dock.BeginTop,
                  i.Dock.BeginBottom,
                  t
                );
              }.bind(this)
            );
        } else {
          this._menu.open(
            this._bKeyboard,
            t,
            i.Dock.BeginTop,
            i.Dock.BeginBottom,
            t
          );
        }
      },
      handleMenuItemPress: function(e) {
        var t = e.getParameter("item").getText();
        var r = this.getView().getModel("kategoriModel").getData();
        var i = r.find(function(e) {
          return e.KategoriAdi === t;
        });
        var a = i.MalGrubu;
        var s = sap.ui.core.UIComponent.getRouterFor(this);
        s.navTo("Products", { category: a });
      },
      handleTextFieldItemPress: function(e) {
        t.show("'" + e.getParameter("item").getValue() + "' entered");
      },
      handlePressSearchCategory: function(e) {
        var t = this.getView().byId("searchInput").getValue();
        sap.ui.core.BusyIndicator.show();
        var r = this;
        var i = this.getOwnerComponent().getModel();
        var a = [];
        if (t == "" && this.categoryFilter.length == 0) {
          return;
        }
        if (this.categoryFilter) {
          for (let e = 0; e < this.categoryFilter.length; e++) {
            const t = $.extend(true, {}, this.categoryFilter[e]);
            a.push(new o("Categid", n.EQ, t.oValue1));
          }
        }
        if (t != "") {
          a.push(new o("SearchString", n.EQ, t));
        }
        var s = this.getView().byId("listProducts");
        var u = this.getView().byId("prodObjItem");
        s.bindAggregation("items", {
          path: "/ExtMaterialSet",
          template: u,
          filters: a,
          events: {
            dataReceived: function(e) {
              sap.ui.core.BusyIndicator.hide();
            },
          },
        });
      },
      onPressKategoriGridView: function(e) {
        this.getView().byId("gridProducts").setVisible(true);
        this.getView().byId("listProducts").setVisible(false);
      },
      onPressKategoriListView: function(e) {
        this.getView().byId("gridProducts").setVisible(false);
        this.getView().byId("listProducts").setVisible(true);
      },
      onPressGrid: function(e) {
        var t = e.getSource().getBindingContext().getObject().Prodid;
        var r = e.getSource().getBindingContext().getObject().belgeNumarasi;
        var i = sap.ui.core.UIComponent.getRouterFor(this);
        i.navTo("Details", { prodId: t, type: this.type });
      },
      onClickSepet: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        if (this.belgeNumarasi && this.belgeNumarasi != "") {
          t.navTo("Cart_Catalog", {
            type: this.type,
            belgeNumarası: this.belgeNumarasi,
          });
        } else {
          t.navTo("Cart", { type: this.type });
        }
      },
      onDetayliArama: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        t.navTo("DetailSearch", { type: this.type, searchText: "#" });
      },
      onNavBack: function(e) {
        var t, r;
        t = u.getInstance();
        r = t.getPreviousHash();
        if (r !== undefined) {
          window.history.go(-1);
        } else {
          this.getOwnerComponent().getRouter().navTo("Menu", true);
        }
      },
      onClickHome: function(e) {
        this.getOwnerComponent().getRouter().navTo("Menu");
      },
      openErrorList: function(e) {
        var t = "";
        for (var r = 0; r < e.length; r++) {
          t += e[r].Message + "\n";
        }
        s.error(t);
      },
      toManuelSepet: function() {
        var e = this.getView();
        var t = this.getOwnerComponent().getModel();
        var r = {};
        var i = [];
        r.IvCreWithTemp = true;
        r.IvType = "CREATE";
        r.IvDokod = this.type;
        var a = [];
        a.push({ Message: "" });
        var o = [];
        r.NavItem = o;
        r.NavReturn = a;
        r.NavHeader = i;
        var n = this;
        e.setBusy(true);
        t.create("/DocCreateSet", r, { success: u, error: g });
        function u(t, r) {
          if (t.NavReturn.results.length == 0) {
            s.success(t.EvScnum + " numaralı belgeniz oluşturulmuştur.", {
              onClose: function(e) {
                n
                  .getOwnerComponent()
                  .getRouter()
                  .navTo("Goruntule", { BelgeNumarasi: t.EvScnum });
              },
            });
          } else {
            var i = t.NavReturn.results;
            e.setBusy(false);
            n.openErrorList(i);
          }
        }
        function g(t) {
          s.error(
            "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
          );
          e.setBusy(false);
        }
      },
    });
  }
);
