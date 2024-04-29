sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/model/Sorter",
		"sap/ui/Device",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"com/tupras/zsrmscp/model/formatter",
	],
	function (
		Controller,
		History,
		Sorter,
		Device,
		MessageBox,
		Filter,
		JSONModel,
		MessageToast,
		formatter
	) {
		"use strict";

		return Controller.extend("com.tupras.zsrmscp.controller.Cart", {
			formatter: formatter,

			onInit: function () {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.getRoute("Cart").attachMatched(this._onRouteMatched, this);
				oRouter
					.getRoute("Cart_Catalog")
					.attachMatched(this._onRouteMatched, this);
			},
			_onRouteMatched: function (oEvent) {
				var sRouteName = oEvent.getParameter("name");
				var oArgs = oEvent.getParameter("arguments");
				this.type = oArgs.type;
				this.belgeNumarasi = oArgs.belgeNumarası;

				this.getItemList();
			},
			getItemList: function () {
				var oDataModel = this.getOwnerComponent().getModel();
				var oView = this.getView();
				var that = this;

				var aFilters = [];
				aFilters.push(
					new sap.ui.model.Filter(
						"Dokod",
						sap.ui.model.FilterOperator.EQ,
						this.type
					)
				);

				if (this.belgeNumarasi && this.belgeNumarasi != "") {
					aFilters.push(
						new sap.ui.model.Filter(
							"Scnum",
							sap.ui.model.FilterOperator.EQ,
							this.belgeNumarasi
						)
					);
				}

				oView.setBusy(true);
				oDataModel.read("/TemporaryItemSet", {
					filters: aFilters,
					success: function (data, response) {
						var cartEntries = data.results;
						var oCartModel = new sap.ui.model.json.JSONModel();
						var oViewModel = new sap.ui.model.json.JSONModel();
						oCartModel.setData(cartEntries);
						oViewModel.setData({
							itemCount: cartEntries.length,
						});

						that.getView().setModel(oCartModel, "cartProducts");
						that.getView().setModel(oViewModel, "viewModel");

						oView.setBusy(false);

						that.checkQuantity(that);
					},
					error: function (data, response) {
						sap.m.MessageBox.error(
							"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
						);
						oView.setBusy(false);
					},
				});
			},
			onSepetAktar: function (oEvent) {
				var that = this;
				MessageBox.show("Kalemleri aktarmak istediğinizden emin misiniz?", {
					title: "Kalem aktar",
					actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction !== MessageBox.Action.OK) {
							return;
						}
						that.postAktar();
					},
				});
			},
			postAktar: function () {
				var oView = this.getView();
				var oDataModel = this.getOwnerComponent().getModel();
				var items = oView.getModel("cartProducts").getData();
				var requestHeader = {};

				var requestBaslik = [];

				//catalog gelen kalem aktar�l�yorken..
				if (this.belgeNumarasi && this.belgeNumarasi != "") {
					requestHeader.EvScnum = this.belgeNumarasi;
					requestHeader.IvCreWithTemp = false;
					requestHeader.IvType = "CAT_CHANGE";

					requestBaslik.push({
						Dokod: this.type,
						Tmpid: this.belgeNumarasi,
						Scnum: this.belgeNumarasi,
					});
				} else {
					requestHeader.IvCreWithTemp = true;
					requestHeader.IvType = "CREATE";
				}

				requestHeader.IvDokod = this.type;

				var requestReturn = [];
				requestReturn.push({
					Message: "",
				});

				var requestItems = [];
				for (var m = 0; m < items.length; m++) {
					requestItems.push({
						Itmno: items[m].Itmno,
						Prodi: items[m].Prodi,
						Menge: items[m].Menge,
					});
				}
				requestHeader.NavItem = requestItems;
				requestHeader.NavReturn = requestReturn;
				requestHeader.NavHeader = requestBaslik;

				var that = this;
				oView.setBusy(true);
				oDataModel.create("/DocCreateSet", requestHeader, {
					success: mySuccessHandler,
					error: myErrorHandler,
				});

				function mySuccessHandler(data, response) {
					// oView.setBusy(false);

					if (data.NavReturn.results.length == 0) {
						//Belge ba�ar�l� bir �ekilde olu�tu
						MessageBox.success(
							data.EvScnum +
							" numaralı belgeniz başarılı bir şekilde aktarılmıştır.", {
								onClose: function (oEvent) {
									that
										.getOwnerComponent()
										.getRouter()
										.navTo("Goruntule", {
											BelgeNumarasi: data.EvScnum
										});
								},
							}
						);
					} else {
						//Hata var
						var returnList = data.NavReturn.results;
						oView.setBusy(false);
						that.openErrorList(returnList);
					}
				}

				function myErrorHandler(oError) {
					MessageBox.error(
						"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
					);
					oView.setBusy(false);
				}
			},
			handleChangeMiktar: function (oEvent) {
				sap.ui.core.BusyIndicator.show();
				var oDataModel = this.getOwnerComponent().getModel();
				var miktar = oEvent
					.getSource()
					.getBindingContext("cartProducts")
					.getObject().Menge;
				var prodi = oEvent
					.getSource()
					.getBindingContext("cartProducts")
					.getObject().Prodi;
				var prodtx = oEvent
					.getSource()
					.getBindingContext("cartProducts")
					.getObject().Prodtx;
				var itemNo = oEvent
					.getSource()
					.getBindingContext("cartProducts")
					.getObject().Itmno;

				var that = this;
				var requestHeader = {
					IvDokod: this.type,
				};
				var requestReturn = [];
				requestReturn.push({
					Type: "",
				});
				var item = [];
				item.push({
					Prodi: prodi,
					Updkz: "U",
					Prodtx: prodtx,
					Menge: parseInt(miktar).toString(),
					Itmno: itemNo,
				});

				requestHeader.NavReturn = requestReturn;
				requestHeader.NavItem = item;
				oDataModel.create("/TemporaryUpdateSet", requestHeader, {
					success: function (data, response) {
						var hataListesi = data.NavReturn.results;
						if (hataListesi.length !== 0) {
							that.openErrorList(hataListesi);
						} else {
							//Hata yoktur
							MessageToast.show("Miktar güncellenmiştir.");
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (data, response) {
						MessageBox.error(
							"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
						);
						sap.ui.core.BusyIndicator.hide();
					},
				});
			},
			onCartEntriesDelete: function (oEvent) {
				var oBindingContext = oEvent
					.getParameter("listItem")
					.getBindingContext("cartProducts");
				var sKalemNo = oBindingContext.getObject().KalemNo;
				var oDataModel = this.getOwnerComponent().getModel();
				var that = this;
				MessageBox.show("Kalemi silmek istediğinizden emin misiniz?", {
					title: "Kalem silme",
					actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
					onClose: function (oAction) {
						if (oAction !== MessageBox.Action.DELETE) {
							return;
						}
						that._deleteProduct(oBindingContext);
					},
				});
			},
			_deleteProduct: function (oBindingContext) {
				var selectedObj = oBindingContext.getObject();
				var oDataModel = this.getOwnerComponent().getModel();
				var oView = this.getView();
				var that = this;

				var requestHeader = {
					IvDokod: this.type,
					IvScnum: selectedObj.Scnum,
				};
				var requestReturn = [];
				requestReturn.push({
					Type: "",
				});
				var prodi = selectedObj.Prodid;
				if (prodi == "") {
					prodi = selectedObj.Prodi;
				}
				var item = [{
					Prodi: prodi,
					Updkz: "D",
					Itmno: selectedObj.Itmno,
				}, ];

				requestHeader.NavReturn = requestReturn;
				requestHeader.NavItem = item;
				sap.ui.core.BusyIndicator.show();
				oDataModel.create("/TemporaryUpdateSet", requestHeader, {
					success: function (data, response) {
						var hataListesi = data.NavReturn.results;
						if (hataListesi.length !== 0) {
							that.openErrorList(hataListesi);
						} else {
							MessageBox.success(
								"Seçilen kalem başarılı bir şekilde silinmiştir."
							);
							that.getItemList();
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (data, response) {
						sap.m.MessageBox.error(
							"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
						);
						sap.ui.core.BusyIndicator.hide();
					},
				});
			},

			onDeleteAllCarts: function () {
				var that = this;

				MessageBox.show(
					"Sepetteki kalemleri silmek istediğinize emin misiniz?", {
						title: "Onay",
						actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
						onClose: function (oAction) {
							if (oAction !== MessageBox.Action.OK) {
								return;
							}
							that.onSubmitDeleteAllCarts();
						},
					}
				);
			},
			onSubmitDeleteAllCarts: function () {
				var carts = this.getView().getModel("cartProducts").getData();
				var oDataModel = this.getOwnerComponent().getModel();
				var oView = this.getView();
				var that = this;

				var requestHeader = {
					IvDokod: this.type,
				};
				var requestReturn = [];
				requestReturn.push({
					Type: "",
				});

				var items = carts.map(function name(params) {
					var item = {
						Prodi: params.Prodi,
						Updkz: "D",
						Itmno: params.Itmno,
					};

					return item;
				});

				// carts.array.forEach(element => {
				//     var item = [{
				//         Prodi: element.Prodid,
				//         Updkz: "D",
				//         Itmno: element.Itmno
				//     }];
				// });

				requestHeader.NavReturn = requestReturn;
				requestHeader.NavItem = items;

				sap.ui.core.BusyIndicator.show();

				oDataModel.create("/TemporaryUpdateSet", requestHeader, {
					success: function (data, response) {
						var hataListesi = data.NavReturn.results;
						if (hataListesi.length !== 0) {
							that.openErrorList(hataListesi);
						} else {
							MessageBox.success("Kalemler başarılı bir şekilde silinmiştir.");
							that.getItemList();
						}

						sap.ui.core.BusyIndicator.hide();
					},
					error: function (data, response) {
						sap.m.MessageBox.error(
							"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
						);
						sap.ui.core.BusyIndicator.hide();
					},
				});
			},

			onNavBack: function (oEvent) {
				var oHistory, sPreviousHash;
				oHistory = History.getInstance();
				sPreviousHash = oHistory.getPreviousHash();
				var oModel = this.getView().getModel("productsModel");
				if (oModel) {
					oModel.setData("");
				}
				this.getView().unbindElement();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					this.getOwnerComponent()
						.getRouter()
						.navTo("SearchPage", {
							type: this.type
						}, true /*no history*/ );
				}
			},
			openErrorList: function (logListesi) {
				var messageTxt = "";
				for (var n = 0; n < logListesi.length; n++) {
					messageTxt += logListesi[n].Message + "\n";
				}

				MessageBox.error(messageTxt);
			},

			checkQuantity(that) {
				if (that.getSource) {
					that = this;
				}

				var oDataModel = that.getOwnerComponent().getModel();
				var oView = that.getView();
				var that = that;
				var viewModel = that.getView().getModel("viewModel");
				var viewData = viewModel.getData();
				var oModel = that.getView().getModel("cartProducts");
				var carts = oModel.getData();

				var items = carts.map(function name(params) {
					var item = {
						Prodi: params.Prodi,
						Unit: params.Meins,
					};

					return item;
				});
				var aFilters = [];
				items.forEach(element => {
					aFilters.push(
						new sap.ui.model.Filter(
							"Prodi",
							sap.ui.model.FilterOperator.EQ,
							element.Prodi
						)
					);
					aFilters.push(
						new sap.ui.model.Filter(
							"Unit",
							sap.ui.model.FilterOperator.EQ,
							element.Unit
						)
					);
				});

				oView.setBusy(true);
				oDataModel.read("/QuantityCheckSet", {
					filters: aFilters,
					success: function (data, response) {
						carts.forEach(function (element, i) {
							if (data.results[i]) {
								element.Quantity = data.results[i].Quantity;
							}
						});
						oModel.refresh();

						viewData.visibleCheck = false;

						carts.forEach(element => {
							if (
								element.Quantity &&
								element.Quantity != null &&
								element.Quantity != ""
							) {
								viewData.visibleCheck = true;
							}
						});
						viewModel.refresh();
						oView.setBusy(false);
					},
					error: function (data, response) {
						sap.m.MessageBox.error(
							"Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz."
						);
						oView.setBusy(false);
					},
				});
			},
		});
	}
);