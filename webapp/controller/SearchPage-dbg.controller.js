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
  function(e, t, i, r, s, a, o, n, u, l) {
    "use strict";
    return e.extend("com.tupras.zsrmscp.controller.SearchPage", {
      formatter: l,
      onInit: function() {
        var e = this.getOwnerComponent().getRouter();
        e.getRoute("SearchPage").attachMatched(this._onRouteMatched, this);
        e
          .getRoute("SearchPage_Catalog")
          .attachMatched(this._onRouteMatched, this);
        e
          .getRoute("SearchPageNotRefresh")
          .attachMatched(this._onRouteMatchedNotRefresh, this);
        this.bindView();
      },
      _onRouteMatched: function(e) {
        var t = e.getParameter("name");
        var i = e.getParameter("arguments");
        this.type = i.type;
        this.belgeNumarasi = i.belgeNumarasi;
        this.sepetSayisiniGuncelle();
        var r = this.getView().byId("categoryList");
        this.getTreeData();
      },
      _onRouteMatchedNotRefresh: function(e) {
        var t = e.getParameter("name");
        var i = e.getParameter("arguments");
        this.type = i.type;
        this.getTreeData();
      },
      bindView: function() {
        var e = new s();
        var t = { cartCount: 0 };
        e.setData(t);
        this.getView().setModel(e, "viewModel");
      },
      getTreeData: function() {
        var e = this;
        var t = this.getOwnerComponent().getModel();
        var i = this.getView();
        var e = this;
        var r = [];
        r.push(
          new sap.ui.model.Filter(
            "Dokod",
            sap.ui.model.FilterOperator.EQ,
            this.type
          )
        );
        i.setBusy(true);
        t.read("/CategoryTreeSet", {
          filters: r,
          success: function(t, i) {
            var r = e.getView();
            var s = r.getModel("viewModel");
            var a = e.setTreeStructure(t.results);
            s.setProperty("/CategoryTreeSet", a);
            s.refresh(true);
            r.setBusy(false);
          },
          error: function(e, t) {
            sap.m.MessageBox.error(
              "Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
            );
            i.setBusy(false);
          },
        });
      },
      setTreeStructure: function(e) {
        var t = [];
        for (let i = 0; i < e.length; i++) {
          const r = e[i];
          const s = [];
          const a = { text: r.Matkl, descr: r.Categtx, ref: "", nodes: [] };
          for (let t = 0; t < e.length; t++) {
            const i = {
              text: e[t].Matkl,
              descr: e[t].Categtx,
              ref: "",
              nodes: [],
            };
            if (r.Matkl == e[t].TopMatkl) {
              a["nodes"].push(i);
            }
          }
          t.push(a);
        }
        for (let i = 0; i < e.length; i++) {
          const r = e[i];
          for (let e = t.length; e > 0; e--) {
            const i = t[e - 1];
            if (r.TopMatkl !== "" && i.text == r.Matkl) {
              t.splice(e - 1, 1);
            }
          }
        }
        return t;
      },
      handlePressCategoryItem: function(e) {
        var t = this.getView().getModel("viewModel");
        var i = e.getSource("viewModel").getSelectedContextPaths()[0];
        var r = t.getProperty(i);
        this.filterCategoryList(r);
      },
      filterCategoryList: function(e) {
        var t = [];
        var i = this.getView().byId("listProducts");
        var r = this.getView().byId("prodObjItem");
        this.categoryFilter = [];
        if (e["nodes"].length == 0) {
          t.push(new o("Categid", n.EQ, e["text"]));
        } else {
          e["nodes"].forEach(e => {
            var i = e["text"];
            t.push(new o("Categid", n.EQ, i));
          });
        }
        this.categoryFilter = t;
        i.bindAggregation("items", {
          path: "/CatProdListSet",
          template: r,
          filters: t,
        });
      },
      beforeListData: function() {
        var e = this.getView();
        var t = e.byId("listProducts");
        var i = [];
        i.push(new o("Sctype", n.EQ, this.type));
        t.getBinding("items").filter(i);
      },
      onPressSepeteEkle: function(e) {
        var t = this.getView().byId("listProducts");
        var i = t.getSelectedItems();
        var r = [];
        if (i.length === 0) {
          a.error("Lütfen sepete eklemek istediğiniz kalemleri seçiniz.");
          return;
        }
        for (var s = 0; s < i.length; s++) {
          r.push({
            Prodid: i[s].getBindingContext().getObject().Prodid,
            Prodtx: i[s].getBindingContext().getObject().Prodtx,
            Categtx: i[s].getBindingContext().getObject().Categtx,
          });
        }
        this.postSepeteEkle(r);
      },
      postSepeteEkle: function(e) {
        sap.ui.core.BusyIndicator.show();
        var t = this.getOwnerComponent().getModel();
        var i = this.getView().byId("listProducts");
        var r = this.getView();
        var s = this;
        if (this.belgeNumarasi && this.belgeNumarasi != "") {
          var o = { IvDokod: this.type, IvScnum: this.belgeNumarasi };
        } else {
          var o = { IvDokod: this.type };
        }
        var n = [];
        n.push({ Type: "" });
        var u = [];
        for (var l = 0; l < e.length; l++) {
          u.push({ Prodi: e[l].Prodid, Updkz: "I", Prodtx: e[l].Prodtx });
        }
        o.NavReturn = n;
        o.NavItem = u;
        t.create("/TemporaryUpdateSet", o, {
          success: function(e, t) {
            var r = e.NavReturn.results;
            if (r.length !== 0) {
              s.openErrorList(r);
            } else {
              s.sepetSayisiniGuncelle();
              i.removeSelections();
              a.success(
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
        if (this.belgeNumarasi) {
          r.push(
            new sap.ui.model.Filter(
              "Scnum",
              sap.ui.model.FilterOperator.EQ,
              this.belgeNumarasi
            )
          );
        }
        t.setBusy(true);
        e.read("/TemporaryItemSet", {
          filters: r,
          success: function(e, t) {
            var r = e.results;
            var s = r.length;
            var a = i.getView();
            var o = a.getModel("viewModel");
            o.getData().cartCount = s;
            o.refresh(true);
            a.setBusy(false);
          },
          error: function(e, i) {
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
          var i = this.getOwnerComponent().getModel();
          var r = this;
          var s = new sap.ui.model.json.JSONModel();
          var a = [];
          a.push(
            new sap.ui.model.Filter(
              "ArananKelime",
              sap.ui.model.FilterOperator.EQ,
              t
            )
          );
          i.read("/HizliAramaSet", {
            filters: a,
            success: function(e, t) {
              var i = e.results;
              s.setData(i);
              r.getView().setModel(s, "helperSearchModel");
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
          success: function(e, i) {
            var r = e.results;
            var s = new sap.ui.model.json.JSONModel();
            s.setData(r);
            t.getView().setModel(s, "kategoriModel");
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
          i
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
        var t = e.getParameter("item").getText();
        var i = this.getView().getModel("kategoriModel").getData();
        var r = i.find(function(e) {
          return e.KategoriAdi === t;
        });
        var s = r.MalGrubu;
        var a = sap.ui.core.UIComponent.getRouterFor(this);
        a.navTo("Products", { category: s });
      },
      handleTextFieldItemPress: function(e) {
        t.show("'" + e.getParameter("item").getValue() + "' entered");
      },
      handlePressSearchCategory: function(e) {
        var t = this.getView().byId("searchInput").getValue();
        sap.ui.core.BusyIndicator.show();
        var i = this;
        var r = this.getOwnerComponent().getModel();
        var s = [];
        if (t == "" && this.categoryFilter.length == 0) {
          return;
        }
        if (this.categoryFilter) {
          for (let e = 0; e < this.categoryFilter.length; e++) {
            const t = $.extend(true, {}, this.categoryFilter[e]);
            s.push(new o("Categid", n.EQ, t.oValue1));
          }
        }
        if (t != "") {
          s.push(new o("SearchString", n.EQ, t));
        }
        var a = this.getView().byId("listProducts");
        var u = this.getView().byId("prodObjItem");
        a.bindAggregation("items", {
          path: "/CatProdListSet",
          template: u,
          filters: s,
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
        var i = sap.ui.core.UIComponent.getRouterFor(this);
        if (this.belgeNumarasi && this.belgeNumarasi != "") {
          i.navTo("Details", {
            prodId: t,
            belgeNumarasi: this.belgeNumarasi,
            type: this.type,
          });
        } else {
          i.navTo("Details", {
            prodId: t,
            belgeNumarasi: "000000000",
            type: this.type,
          });
        }
      },
      onClickSepet: function(e) {
        var t = sap.ui.core.UIComponent.getRouterFor(this);
        if (this.belgeNumarasi && this.belgeNumarasi != "") {
          t.navTo("Cart_Catalog", {
            type: this.type,
            belgeNumarasi: this.belgeNumarasi,
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
        var t, i;
        t = u.getInstance();
        i = t.getPreviousHash();
        if (i !== undefined) {
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
        for (var i = 0; i < e.length; i++) {
          t += e[i].Message + "\n";
        }
        a.error(t);
      },
    });
  }
);
