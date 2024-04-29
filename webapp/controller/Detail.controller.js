sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/ui/core/routing/History",
	"com/tupras/zsrmscp/model/formatter", "com/tupras/zsrmscp/utils/CustomizeScreen", "sap/m/MessageBox", "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator", "sap/ui/core/BusyIndicator", "sap/ui/core/Core", "sap/ui/core/format/DateFormat"
], function (e, t, i, a, r, s, l, n, o, d, g) {
	"use strict";
	return e.extend("com.tupras.zsrmscp.controller.Detail", {
		formatter: a,
		onInit: function () {
			var e = this.getOwnerComponent().getRouter();
			this.Router = sap.ui.core.UIComponent.getRouterFor(this);
			this._customizeScreen = new r;
			this.getView().bindElement("/SmartfieldSet('1')");
			this.setMessagePopover(this);
			e.getRoute("Olustur").attachMatched(this._onRouteMatched, this);
			e.getRoute("Goruntule").attachMatched(this._onRouteMatched, this)
		},
		_onRouteMatched: function (e) {
			var i = e.getParameter("name");
			var a = e.getParameter("arguments").BelgeTipi;
			var r = this.getView().byId("idTableNotlar");
			r.setVisible(false);
			this.type = a;
			this.oDataView = {};
			this.hataListesi = [];
			this.destroyHataListesi();
			var s = new t;
			s.setData({
				VisibleOnaylaReddetButon: false,
				VisibleOlusturButton: false,
				VisibleTaslakButton: false,
				VisibleDegistirButton: false,
				VisibleIptalButton: false,
				VisibleSepettenButton: false,
				VisibleMalzemeDetay: false,
				VisibleHizmettenButton: false,
				textData: {
					approveDocument: ""
				}
			});
			this.getView().setModel(s, "visibleModel");
			this.oDataView.headerData = {
				editable: false,
				materialButtons: true,
				routeName: i,
				belgeTipi: a,
				comboBelgeTipi: a,
				Tmpid: ""
			};
			this.oDataView.baslikBilgileri = {
				Scnum: "",
				DstatTx: "",
				CreDate: "",
				Htotal: "",
				CreName: "",
				HeaderNote: ""
			};
			this.oDataView.malzemeBilgileri = [];
			this.oDataView.hesapTayiniBilgileri = [];
			this.oDataView.configBilgileri = [];
			this.oDataView.tayinTipleri = [];
			this.oDataView.kalemNotlari = [];
			this.oDataView.baslikEkAlanlari = {
				ZzSecalm: "",
				ZzSecndn: "",
				ZzTesdrm: false,
				ZzAltur: "",
				ZzTlpedn: "",
				ZzTlpmdr: "",
				ZzMuthno: ""
			};
			this.oDataView.fileList = [];
			if (i === "Olustur") {
				this.getView().getModel("visibleModel").getData().VisibleOlusturButton = true;
				this.getView().getModel("visibleModel").getData().VisibleOlusturButton = true;
				this.getView().getModel("visibleModel").getData().VisibleTaslakButton = true;
				this.getView().getModel("visibleModel").getData().VisibleDegistirButton = true;
				this.getView().getModel("visibleModel").refresh(true);
				this.oDataView.headerData.editable = true;
				this.oDataView.headerData.comboBelgeTipiEditable = false;
				this.getDocTypes(i);
				this.getTempid();
				this.oDataView.headerData.belgeTipi = a;
				this.bindView();
				this.getScreenConfig(this.oDataView.headerData.belgeTipi);
				this.getHesapTayinTipleri(a);
				this.getUserInfo()
			}
			if (i === "Goruntule") {
				var l = e.getParameter("arguments").BelgeNumarasi;
				this.bindView();
				this.getDocumentDetail(l)
			}
		},
		setInitialTextData: function (e, t) {
			var i = e.getView().getModel("visibleModel");
			var a = i.getData()["textData"];
			const r = e.getView().getModel("i18n").getResourceBundle();
			if (t.substring(0, 5) == "DT_20") {
				a["approveDocument"] = r.getText("reservationDocument")
			} else {
				a["approveDocument"] = r.getText("approveDocument")
			}
			i.refresh()
		},
		getDocTypes: function (e) {
			return new Promise(i => {
				var a = this.getOwnerComponent().getModel("odata_service");
				var r = this;
				sap.ui.core.BusyIndicator.show();
				a.read("/DocSubTypesSet", {
					success: function (a, s) {
						var l = a.results;
						var n = new t(l);
						r.getView().setModel(n, "subMenuModel");
						if (e === "Olustur") {
							r.belgeTipKontrolEt(r.oDataView.headerData.belgeTipi);
							r.setVisibleButtons()
						} else if (!r.type && r.oDataView.headerData.Tmpid !== "") {
							r.type = r.oDataView.headerData.belgeTipi
						}
						sap.ui.core.BusyIndicator.hide();
						i(true)
					},
					error: function (e, t) {
						sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
						sap.ui.core.BusyIndicator.hide();
						i(true)
					}
				})
			})
		},
		onChangeBelgeTipi: function (e) {
			var t = this.oDataView.headerData.comboBelgeTipi;
			var i = this;

			function a(e) {
				if (e == "OK") {
					i.getOwnerComponent().getRouter().navTo("Olustur", {
						BelgeTipi: t
					})
				} else {
					i.oDataView.headerData.comboBelgeTipi = i.oDataView.headerData.belgeTipi;
					i.bindView();
					i.getScreenConfig(i.oDataView.headerData.belgeTipi);
					i.getHesapTayinTipleri(i.oDataView.headerData.belgeTipi);
					return
				}
			}
			s.confirm("Girilen veriler kaybolacak. Devam etmek istediğinizden emin misiniz?", a, "Uyarı")
		},
		belgeTipKontrolEt: function (e) {
			var t = this.getView();
			var i = this;
			var a = t.getModel("subMenuModel");
			var r = t.getModel("detailModel");
			var l = r.getData();
			var n = a.getData();
			var o = false;
			for (var d = 0; d < n.length; d++) {
				if (n[d].Sutyp === e) {
					o = true;
					break
				}
			}
			if (o === false) {
				l.headerData.comboBelgeTipi = "";
				r.refresh(true);
				s.error("Belge tipi bulunamadı.Lütfen doğru belge tipi girdidiğinizden emin olunuz")
			}
		},
		bindView: function () {
			var e = new t;
			e.setData({
				VisibleZZ_SECALM: false,
				VisibleZZ_SECNDN: false,
				VisibleZZ_ALTUR: false,
				VisibleZZ_BWART: false,
				VisibleZZ_TLPEDN: false,
				VisibleZZ_TLPMDR: false,
				VisibleZZ_KULYER: false,
				VisibleZZ_MUTHNO: false,
				VisibleZZ_INCOTRM: false,
				VisibleZZ_INCOPLA: false,
				VisibleZZ_LIFNR: false,
				VisibleZZ_CEVREB: false,
				baslikBilgileri: this.oDataView.baslikBilgileri,
				baslikEkAlanlari: this.oDataView.baslikEkAlanlari,
				malzemeBilgileri: this.oDataView.malzemeBilgileri,
				hesapTayiniBilgileri: this.oDataView.hesapTayiniBilgileri,
				fileList: this.oDataView.fileList,
				onaycilar: this.oDataView.onaycilar,
				headerData: this.oDataView.headerData,
				kalemNotlari: [],
				tayinTipleri: this.oDataView.tayinTipleri
			});
			this.getView().setModel(e, "detailModel")
		},
		getUserInfo: function () {
			var e = this.getOwnerComponent().getModel("odata_service");
			var t = this.getView();
			var i = t.getModel("detailModel").getData();
			o.show();
			var a = "/UserInfoSet('')";
			e.read(a, {
				success: function (e) {
					o.hide();
					i.baslikEkAlanlari.ZzTlpedn = e.Uname;
					i.baslikEkAlanlari.ZzTlpedntext = e.Ename;
					i.baslikEkAlanlari.ZzTlpmdr = e.Mudkd;
					i.baslikEkAlanlari.ZzTlpmdrtext = e.MudkdTx;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					o.hide();
					s.error("Kullanıcı bilgilerinin alınması sırasında bir sorun oluştu. Lütfen sistem yöneticiniz ile iletişime geçiniz.")
				}
			})
		},
		internalUpdateItem: function (e, t) {
			if (e) {
				var i = e.split("/")[2];
				var a = this;
				var r = g.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				});
				var l = {};
				var n = [];
				var o = [];
				var d = [];
				var u = this.getNoteToService();
				var h = this.getView();
				var m = h.getModel("detailModel");
				var p = m.getData();
				var f = this.getView().getModel("detailModel").getProperty(e);
				var c = [];
				c = this.getHeaderToService("");
				o = this.getAccountItemsToService();
				n = this.getItemToService();
				var h = this.getView();
				var v = this.getOwnerComponent().getModel("odata_service");
				n.forEach(function (e, t) {
					if (e["Eeind"] != null) {
						var i = e["Eeind"].match(/(\d+)/g);
						var a = new Date(i[0], i[1] - 1, i[2]);
						e["Eeind"] != null ? r.format(a) : null
					}
					e["Updkz"] = "U";
					delete e.NotSayisi;
					delete e.KalemHatasi;
					if (e.MeinsTx) {
						delete e.MeinsTx
					}
				});
				l.IvChgColumnText = t;
				l.NavHeader = c;
				l.NavItem = n;
				l.NavConfig = d;
				l.NavAccount = o;
				l.NavApprovers = [];
				l.NavNote = u;
				var a = this;
				h.setBusy(true);
				var y = v.getChangeGroups();
				y.NavApprovers = {
					groupId: "NavApprovers"
				};
				v.setChangeGroups(y);
				var M = v.getDeferredGroups();
				M.push("NavApprovers");
				v.setDeferredGroups(M);
				v.create("/InternalUpdateSet", l, {
					success: S,
					error: b
				});

				function S(t, r) {
					h.setBusy(false);
					var s = t.NavItem.results[i];
					var l = s.Itmno;
					var n = a.notSayisiniDondur(m.getData(), l);
					s.NotSayisi = n;
					m.setProperty(e, s);
					a.changeScreenConfig(t.NavConfig.results);
					m.setProperty("/onaycilar", t.NavApprovers.results);
					m.setProperty("/hesapTayiniBilgileri", t.NavAccount.results);
					a.kalemToplamHesapla(s);
					m.refresh(true)
				}

				function b(e) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					h.setBusy(false)
				}
			}
		},
		internalDeleteItem: function (e) {
			if (e) {
				var t = this;
				var i = g.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				});
				var a = {};
				var r = [];
				var l = [];
				var n = [];
				var o = this.getView();
				var d = o.getModel("detailModel");
				var u = d.getData();
				var h = [];
				h = this.getHeaderToService("");
				l = this.getAccountItemsToService();
				r = this.getItemToService();
				var o = this.getView();
				var m = this.getOwnerComponent().getModel("odata_service");
				var p = [];
				r.forEach(function (t, i) {
					e.forEach(function (e, i) {
						if (t["Itmno"] == e["Itmno"]) {
							t["Updkz"] = "D";
							delete t.NotSayisi;
							delete t.KalemHatasi;
							if (t.MeinsTx) {
								delete t.MeinsTx
							}
							p.push(t)
						}
					})
				});
				a.NavHeader = h;
				a.NavItem = r;
				a.NavConfig = n;
				a.NavAccount = l;
				a.NavApprovers = [];
				var t = this;
				o.setBusy(true);
				var f = m.getChangeGroups();
				f.NavApprovers = {
					groupId: "NavApprovers"
				};
				m.setChangeGroups(f);
				var c = m.getDeferredGroups();
				c.push("NavApprovers");
				m.setDeferredGroups(c);
				m.create("/InternalUpdateSet", a, {
					success: v,
					error: y
				});

				function v(i, a) {
					o.setBusy(false);
					t.changeScreenConfig(i.NavConfig.results);
					d.setProperty("/onaycilar", i.NavApprovers.results);
					d.setProperty("/hesapTayiniBilgileri", i.NavAccount.results);
					e.forEach(function (e, i) {
						t._kalemSil(e)
					});
					t.setHeaderToplamFiyat();
					d.refresh(true)
				}

				function y(e) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					o.setBusy(false)
				}
			}
		},
		internalUpdateKalemEkle: function (e, t, i, a) {
			var r = this.getView();
			var l = r.getModel("detailModel");
			var n = e;
			var r = this.getView();
			var o = this.getOwnerComponent().getModel("odata_service");
			var d = l.getData().headerData.belgeTipi;
			var g = JSON.stringify(n);
			n = JSON.parse(g);
			n.Updkz = "I";
			n.PriceUnit = "1";
			if (a == true) {
				n.Hizmet = true
			}
			var u = {};
			var h = [];
			var m = [];
			var p = [];
			var f = [];
			var c = [];
			delete n.NotSayisi;
			p.push({
				Dokod: l.getData().headerData.belgeTipi
			});
			h.push(n);
			m.push([]);
			u.NavHeader = p;
			u.NavItem = h;
			u.NavAccount = m;
			u.NavConfig = f;
			u.NavNote = c;
			u.NavApprovers = [];
			var v = this;
			r.setBusy(true);
			o.create("/InternalUpdateSet", u, {
				success: y,
				error: M
			});

			function y(e, a) {
				r.setBusy(false);
				var s = e.NavItem.results[0];
				var n = e.NavAccount.results[0];
				s.NotSayisi = "0";
				if (e.NavConfig && e.NavConfig.results.length != 0) {
					v.changeScreenConfig(e.NavConfig.results)
				}
				t.push(s);
				i.push(n);
				v.getCostCenterDetail(n, n.Kostl);
				l.setProperty("/onaycilar", e.NavApprovers.results);
				v._setRowNumbers(t);
				v._setRowNumbers(i);
				var o = s.Itmno;
				var g = e.NavNote.results;
				g.forEach(function (e, t) {
					e.Itmno = o;
					l.getData().kalemNotlari.push(e)
				});
				var u = v.notSayisiniDondur(l.getData(), o);
				s.NotSayisi = g.length;
				v.getScreenConfig(d);
				l.refresh(true)
			}

			function M(e) {
				s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				r.setBusy(false)
			}
		},
		getHesapTayinTipleri: function (e) {
			var t = this;
			var i = this.getView();
			var a = this.getOwnerComponent().getModel("odata_service");
			var r = i.getModel("detailModel");
			var n = r.getData();
			i.setBusy(true);
			a.read("/AccountCategListSet", {
				filters: [new l("Dokod", sap.ui.model.FilterOperator.EQ, e)],
				success: function (e) {
					var t = e.results;
					n.tayinTipleri = t;
					i.setBusy(false)
				},
				error: function (e) {
					i.setBusy(false);
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.")
				}
			})
		},
		getScreenConfig: function (e) {
			var t = this;
			var i = this.getView();
			var a = this.getOwnerComponent().getModel("odata_service");
			var r = i.getModel("detailModel");
			a.read("/ScreenConfigValuesSet", {
				filters: [new l("Dokod", sap.ui.model.FilterOperator.EQ, e)],
				success: function (e) {
					var t = e.results;
					if (t && t.length != 0) {
						for (var a = 0; a < t.length; a++) {
							var s = t[a];
							if (s.Field == "PYPNO") {}
							var l = "/Visible" + s.Field;
							var n = s.Visible;
							var o = "/Enable" + s.Field;
							var d = s.Enabled;
							var g = "/Required" + s.Field;
							var u = s.Required;
							r.setProperty(l, n);
							r.setProperty(o, d);
							r.setProperty(g, u)
						}
					}
					if (r.getProperty("/VisiblePRODTX") === true) {
						i.byId("idTableMalzeme").setFixedColumnCount(3)
					}
					var h = r.getProperty("/malzemeBilgileri");
					h.forEach(function (e, t) {
						if (e["ExternalSystem"] != "") {
							e["EnableMENGE"] = r.getProperty("/EnableMENGE");
							e["EnablePRICE"] = false;
							e["EnablePRICE_UNIT"] = false;
							e["EnableMEINS"] = false;
							e["EnableIWAER"] = false
						} else {
							e["EnableMENGE"] = r.getProperty("/EnableMENGE");
							e["EnablePRICE"] = r.getProperty("/EnablePRICE");
							e["EnablePRICE_UNIT"] = r.getProperty("/EnablePRICE_UNIT");
							e["EnableMEINS"] = r.getProperty("/EnableMEINS");
							e["EnableIWAER"] = r.getProperty("/EnableIWAER")
						}
					});
					r.refresh(true)
				},
				error: function (e) {
					i.setBusy(false);
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.")
				}
			})
		},
		changeScreenConfig: function (e) {
			var t = this.getView();
			var i = t.getModel("detailModel");
			var e = i.getProperty("/scrConfigs");
			if (e && e.length != 0) {
				for (var a = 0; a < e.length; a++) {
					var r = e[a];
					if (r.Field == "PYPNO") {}
					var s = "/Visible" + r.Field;
					var l = r.Visible;
					var n = "/Enable" + r.Field;
					var o = r.Enabled;
					var d = "/Required" + r.Field;
					var g = r.Required;
					i.setProperty(s, l);
					i.setProperty(n, o);
					i.setProperty(d, g)
				}
			}
			var u = i.getProperty("/malzemeBilgileri");
			u.forEach(function (e, t) {
				if (e["ExternalSystem"] != "") {
					e["EnableMENGE"] = i.getProperty("/EnableMENGE");
					e["EnablePRICE"] = false;
					e["EnablePRICE_UNIT"] = false;
					e["EnableMEINS"] = false;
					e["EnableIWAER"] = false
				} else {
					e["EnableMENGE"] = i.getProperty("/EnableMENGE");
					e["EnablePRICE"] = i.getProperty("/EnablePRICE");
					e["EnablePRICE_UNIT"] = i.getProperty("/EnablePRICE_UNIT");
					e["EnableMEINS"] = i.getProperty("/EnableMEINS");
					e["EnableIWAER"] = i.getProperty("/EnableIWAER")
				}
			});
			i.refresh(true)
		},
		setVisibleButtons: function () {
			var e = this.getView().getModel("visibleModel").getData();
			var t = this.getView().getModel("detailModel").getData();
			var i = this.getView().getModel("subMenuModel");
			var a = i.getData();
			var r = {};
			var s = false;
			var l = false;
			var n = false;
			var o = false;
			var d = t["headerData"]["belgeTipi"];
			for (var g = 0; g < a.length; g++) {
				if (a[g].Sutyp === d) {
					r = a[g];
					s = a[g]["Reservation"];
					l = a[g]["Stoklu"];
					n = a[g]["Hizmet"];
					o = a[g]["ExtCatalogInd"]
				}
			}
			var u = t.baslikBilgileri.Dstat;
			if (this.oDataView.headerData.routeName === "Goruntule") {
				e.VisibleOnaylaReddetButon = false;
				e.VisibleIptalButton = false;
				if (u === "SPT") {
					e.VisibleOlusturButton = true;
					e.VisibleTaslakButton = true;
					e.VisibleDegistirButton = true;
					e.VisibleIptalButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					if (o == true) {
						e.VisibleSepettenButton = true
					}
					if (n == true) {
						e.VisibleHizmettenButton = true
					}
				} else if (u === "TSL") {
					e.VisibleOlusturButton = true;
					e.VisibleTaslakButton = true;
					e.VisibleDegistirButton = true;
					e.VisibleIptalButton = false;
					e.VisibleSepettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					if (n == true) {
						e.VisibleHizmettenButton = true
					}
				} else if (u === "TMP") {
					e.VisibleOlusturButton = true;
					e.VisibleTaslakButton = true;
					e.VisibleDegistirButton = true;
					t.headerData.editable = true;
					e.VisibleIptalButton = false;
					e.VisibleSepettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					e.VisibleHizmettenButton = false
				} else if (u === "OGN") {
					e.VisibleOlusturButton = false;
					e.VisibleTaslakButton = false;
					e.VisibleDegistirButton = false;
					t.headerData.editable = false;
					e.VisibleIptalButton = true;
					e.VisibleSepettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					e.VisibleHizmettenButton = false
				} else if (u === "OBA") {
					e.VisibleOnaylaReddetButon = false;
					e.VisibleDegistirButton = false;
					e.VisibleOlusturButton = false;
					e.VisibleIptalButton = true;
					e.VisibleSepettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					e.VisibleHizmettenButton = false
				} else if (u === "ONA") {
					e.VisibleOnaylaReddetButon = false;
					e.VisibleDegistirButton = false;
					e.VisibleOlusturButton = false;
					e.VisibleIptalButton = false;
					t.headerData.editable = false;
					e.VisibleTaslakButton = false;
					e.VisibleSepettenButton = false;
					e.VisibleHizmettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
				} else if (u !== "TSL") {
					e.VisibleOnaylaReddetButon = false;
					e.VisibleDegistirButton = false;
					e.VisibleOlusturButton = false;
					e.VisibleIptalButton = false;
					e.VisibleSepettenButton = false;
					e.VisibleHizmettenButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
				} else {
					e.VisibleOlusturButton = true;
					e.VisibleTaslakButton = true;
					e.VisibleDegistirButton = true;
					e.VisibleIptalButton = false;
					if (l == true) {
						e.VisibleMalzemeDetay = true
					}
					if (o == true) {
						e.VisibleSepettenButton = true
					}
					if (n == true) {
						e.VisibleHizmettenButton = true
					}
				}
			} else {
				if (o == true) {
					e.VisibleSepettenButton = true
				}
				if (n == true) {
					e.VisibleHizmettenButton = true
				}
				if (l == true) {
					e.VisibleMalzemeDetay = true
				}
			}
			if (s) {
				e.VisibleIptalButton = false
			}
			this.getView().getModel("visibleModel").refresh(true);
			this.getView().getModel("detailModel").refresh()
		},
		handlePressOlustur: function (e) {
			var t = "";
			var i = this;
			var a = this.getView();
			a.setBusy(true);
			var r = async() => {
				var e = await i._checkForm(t);
				if (!e) {
					a.setBusy(false);
					return
				}
				var r = await i.prePostSave("TSL");
				if (!r) {
					a.setBusy(false);
					return
				}

				function l(e) {
					if (e == "OK") {
						i._postOnayaGonder("OGN")
					} else {
						a.setBusy(false)
					}
				}
				s.confirm("Belgeyi onaya göndermek istediğinize emin misiniz?", l, "Uyarı")
			};
			r()
		},
		handlePressRejectDocument: function () {
			var e = this;

			function t(t) {
				if (t == "OK") {
					e.openOnayNotuDialog("")
				}
			}
			s.confirm("Belge onayını iptal etmek istediğinize emin misiniz?", t, "Uyarı")
		},
		handlePressTaslakKaydet: function (e) {
			this._postOnayaGonder("TSL")
		},
		handlePressSepetten: function () {
			this._postOnayaGonder("SPT")
		},
		handlePressKontrolEt: function (e) {
			var t = this;
			var i = "Test";
			var a = async() => {
				await t._checkForm(i);
				return true
			};
			a()
		},
		prePostSave: function (e) {
			return new Promise(t => {
				var i = this.getOwnerComponent().getModel();
				var a = this.getView().getModel("detailModel").getData();
				var r = this.getView();
				var l = this;
				var n = "";
				if (a.baslikBilgileri.Scnum !== "") {
					n = "CHANGE"
				} else {
					n = "CREATE"
				}
				var o = sap.ui.core.format.NumberFormat.getFloatInstance({
					maxFractionDigits: 2,
					groupingEnabled: false
				});
				var d = g.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				});
				var u = {};
				var h = [];
				var m = [];
				var p = [];
				var f = [];
				u.IvType = n;
				var c = [];
				c.push({
					Message: ""
				});
				m = this.getHeaderToService(e);
				h = this.getItemToService();
				p = this.getAccountItemsToService();
				f = this.getNoteToService();
				u.NavHeader = m;
				u.NavItem = h;
				u.NavAccount = p;
				u.NavReturn = c;
				u.NavNote = f;
				var l = this;
				r.setBusy(true);
				i.create("/DocCreateSet", u, {
					success: v,
					error: y
				});

				function v(e, i) {
					var a;
					e.NavReturn.results.forEach(function (e, t) {
						if (e.Type === "E") {
							a = true
						}
					});
					if (a) {
						var r = e.NavReturn.results;
						l.setMessageInitModel(l, r);
						t(false)
					} else {
						l.setDocumentNumber(l, i.data.EvScnum);
						t(true)
					}
				}

				function y(e) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					t(false)
				}
			})
		},
		_postOnayaGonder: function (e, t, i) {
			var a = this.getOwnerComponent().getModel();
			var r = this.getView().getModel("detailModel").getData();
			var l = this.getView();
			var n = this;
			var o = "";
			var d = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				groupingEnabled: false
			});
			var u = g.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			if (e == "OGN") {
				o = "START_WF"
			} else if (e == "PRE_OGN") {
				o = "PRE_START_WF";
				e = "TSL"
			} else if (r.baslikBilgileri.Scnum !== "") {
				o = "CHANGE"
			} else {
				o = "CREATE"
			}
			var h = {};
			var m = [];
			var p = [];
			var f = [];
			var c = [];
			var v = [];
			h.IvType = o;
			var y = [];
			y.push({
				Message: ""
			});
			p = this.getHeaderToService(e);
			m = this.getItemToService();
			f = this.getAccountItemsToService();
			c = this.getNoteToService();
			v = this.getApproversToService();
			h.NavHeader = p;
			h.NavItem = m;
			h.NavAccount = f;
			h.NavReturn = y;
			h.NavNote = c;
			h.NavApprovers = v;
			var n = this;
			l.setBusy(true);
			a.create("/DocCreateSet", h, {
				success: M,
				error: S
			});

			function M(a, d) {
				l.setBusy(false);
				let g = false;
				a.NavReturn.results.forEach(function (e, t) {
					if (e.Type === "E") {
						g = true
					}
				});
				if (!g) {
					if (t === "AUTO" && (i && i != "")) {
						n.getOwnerComponent().getRouter().navTo("SearchPage_Catalog", {
							type: n.oDataView.headerData.belgeTipi,
							belgeNumarasi: n.oDataView.headerData.Tmpid
						})
					} else if (t === "AUTO") {
						n.getOwnerComponent().getRouter().navTo("SearchPage", {
							type: n.oDataView.headerData.belgeTipi
						})
					} else if (o === "CREATE") {
						s.success(a.EvScnum + " numaralı belgeniz başarılı bir şekilde oluşturulmuştur.", {
							onClose: function (e) {
								n.getOwnerComponent().getRouter().navTo("Goruntule", {
									BelgeNumarasi: a.EvScnum
								})
							}
						})
					} else if (o === "START_WF") {
						n.getDocumentDetail(r.baslikBilgileri.Scnum);
						s.success("Belge onaya gönderildi", {
							onClose: function (e) {
								n.getOwnerComponent().getRouter().navTo("Goruntule", {
									BelgeNumarasi: r.baslikBilgileri.Scnum
								})
							}
						})
					} else if (o === "PRE_START_WF") {} else {
						if (e == "SPT") {
							n.getOwnerComponent().getRouter().navTo("CatalogPage", {
								type: p[0]["Dokod"],
								belgeNumarasi: r.baslikBilgileri.Scnum
							})
						} else {
							s.success("Belgeniz başarılı bir şekilde güncellenmiştir.");
							n.getDocumentDetail(r.baslikBilgileri.Scnum)
						}
					}
				} else {
					var u = a.NavReturn.results;
					n.setMessageInitModel(n, u)
				}
			}

			function S(e) {
				s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				l.setBusy(false)
			}
		},
		getDocumentDetail: function (e) {
			var t = this;
			var i = this.getOwnerComponent().getModel();
			var a = [];
			a.push(new l("IvScnum", n.EQ, e));
			o.show();
			i.read("/DocDetailSet", {
				filters: a,
				urlParameters: {
					$expand: "NavHeader,NavItem,NavAccount,NavNote,NavTask,NavAttach,NavApprovers,NavReturn"
				},
				success: function (e) {
					var i = e.results[0].NavHeader.results[0];
					var a = e.results[0].NavItem.results;
					var r = e.results[0].NavAccount.results;
					var s = e.results[0].NavApprovers.results;
					var l = e.results[0].NavAttach.results;
					var n = e.results[0].NavNote.results;
					t._setRowNumbers(a);
					t._setRowNumbers(r);
					t._setRowNumbersNote(n);
					var d = t.getView().getModel("detailModel").getData();
					d.baslikBilgileri = i;
					d.baslikEkAlanlari = i;
					d.malzemeBilgileri = a;
					d.hesapTayiniBilgileri = r;
					d.onaycilar = s;
					d.fileList = l;
					d.headerData.Tmpid = i.Scnum;
					d.headerData.belgeTipi = i.Dokod;
					d.headerData.comboBelgeTipi = i.Dokod;
					d.headerData.BackendDoc = i.BackendDoc;
					d.headerData.comboBelgeTipiEditable = false;
					t.type = i.Dokod;
					t.setInitialTextData(t, i.Dokod);
					a.forEach(function (e, t) {
						var i = false;
						n.forEach(function (t, a) {
							if (e.Itmno == t.Itmno) {
								i = true
							}
						});
						if (!i) {
							n.push({
								Itmno: e.Itmno,
								Notur: "01",
								Noturtx: "Satıcı Metni",
								Descr: ""
							});
							n.push({
								Itmno: e.Itmno,
								Notur: "02",
								Noturtx: "Dahili Not",
								Descr: ""
							})
						}
					});
					d.kalemNotlari = n;
					var g = async() => {
						await t.getDocTypes(i.Dokod);
						t.setVisibleButtons();
						t.setSmartFieldValues(t)
					};
					g();
					t.getHesapTayinTipleri(i.Dokod);
					t.getScreenConfig(i.Dokod);
					t._changeNotSayisi(d);
					t._getFileList(i.Scnum);
					t.getView().getModel("detailModel").refresh(true);
					o.hide();
					t.setHeaderToplamFiyat()
				},
				error: function (e) {
					o.hide();
					s.error("Bir sorun oluştu. Lütfen sistem yöneticiniz ile iletişime geçiniz")
				}
			})
		},
		_checkForm: function (e) {
			return new Promise(t => {
				var i = this;
				var r = this.getView().getModel("detailModel").getData();
				var l = true;
				this.hataListesi = [];
				var n = false;
				var o = 0;
				var d = false;
				if ((r.baslikEkAlanlari.ZzSecalm === "" || r.baslikEkAlanlari.ZzSecalm === undefined) && r.RequiredZZ_SECALM === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzSecalm = "Error"
				} else {
					r.ValueStateZzSecalm = "None"
				}
				if ((r.baslikEkAlanlari.ZzSecndn === "" || r.baslikEkAlanlari.ZzSecndn === undefined) && r.RequiredZZ_SECNDN === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzSecndn = "Error"
				} else {
					r.ValueStateZzSecndn = "None"
				}
				if ((r.baslikEkAlanlari.ZzAltur === "" || r.baslikEkAlanlari.ZzAltur === undefined) && r.RequiredZZ_ALTUR === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzAltur = "Error"
				} else {
					r.ValueStateZzAltur = "None"
				}
				if ((r.baslikEkAlanlari.ZzBwart === "" || r.baslikEkAlanlari.ZzBwart === undefined) && r.RequiredZZ_BWART === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzBwart = "Error"
				} else {
					r.ValueStateZzBwart = "None"
				}
				if ((r.baslikEkAlanlari.FieldWerks === "" || r.baslikEkAlanlari.FieldWerks === undefined) && r.RequiredFIELD_WERKS === true && r
					.baslikEkAlanlari.Zzbwart == "301") {
					n = true;
					o = o + 1;
					r.ValueStateFieldWerks = "Error"
				} else {
					r.ValueStateFieldWerks = "None"
				}
				if ((r.baslikEkAlanlari.FieldLgort === "" || r.baslikEkAlanlari.FieldLgort === undefined) && r.RequiredFIELD_LGORT === true) {
					n = true;
					o = o + 1;
					r.ValueStateFieldLgort = "Error"
				} else {
					r.ValueStateFieldLgort = "None"
				}
				if ((r.baslikEkAlanlari.ZzTlpedn === "" || r.baslikEkAlanlari.ZzTlpedn === undefined) && r.RequiredZZ_TLPEDN === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzTlpedn = "Error"
				} else {
					r.ValueStateZzTlpedn = "None"
				}
				if ((r.baslikEkAlanlari.ZzTlpmdr === "" || r.baslikEkAlanlari.ZzTlpmdr === undefined) && r.RequiredZZ_TLPMDR === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzTlpmdr = "Error"
				} else {
					r.ValueStateZzTlpmdr = "None"
				}
				if ((r.baslikEkAlanlari.ZzKulyer === "" || r.baslikEkAlanlari.ZzKulyer === undefined) && r.RequiredZZ_KULYER === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzKulyer = "Error"
				} else {
					r.ValueStateZzKulyer = "None"
				}
				if ((r.baslikEkAlanlari.ZzMuthno === "" || r.baslikEkAlanlari.ZzMuthno === undefined) && r.RequiredZZ_MUTHNO === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzMuthno = "Error"
				} else {
					r.ValueStateZzMuthno = "None"
				}
				if ((r.baslikEkAlanlari.ZzIncotrm === "" || r.baslikEkAlanlari.ZzIncotrm === undefined) && r.RequiredZZ_INCOTRM === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzIncotrm = "Error"
				} else {
					r.ValueStateZzIncotrm = "None"
				}
				if ((r.baslikEkAlanlari.ZzIncopla === "" || r.baslikEkAlanlari.ZzIncopla === undefined) && r.RequiredZZ_INCOPLA === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzIncopla = "Error"
				} else {
					r.ValueStateZzIncopla = "None"
				}
				if ((r.baslikEkAlanlari.ZzLifnr === "" || r.baslikEkAlanlari.ZzLifnr === undefined) && r.RequiredZZ_LIFNR === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzLifnr = "Error"
				} else {
					r.ValueStateZzLifnr = "None"
				}
				if ((r.baslikEkAlanlari.ZzCevreb === "" || r.baslikEkAlanlari.ZzCevreb === undefined) && r.RequiredZZ_CEVREB === true) {
					n = true;
					o = o + 1;
					r.ValueStateZzCevreb = "Error"
				} else {
					r.ValueStateZzCevreb = "None"
				}
				this.getView().getModel("detailModel").refresh(true);
				if (n === true) {
					l = false;
					this.hataListesi.push({
						Message: "Lütfen başlıktaki tüm zorunlu alanları doldurunuz.",
						Category: "Başlık"
					})
				}
				if (r.malzemeBilgileri.length === 0) {
					l = false;
					this.hataListesi.push({
						Message: "Lütfen en az 1 adet malzeme ekleyiniz.",
						Category: "Başlık"
					})
				}
				for (var g = 0; g < r.malzemeBilgileri.length; g++) {
					var u = r.malzemeBilgileri[g];
					var h = a.removeLeadingZeroes(u.Itmno);
					var m = false;
					if ((u.Prodi === "" || u.Prodi === undefined) && r.RequiredPRODI === true && !u.Hizmet) {
						u.ValueStateMalzemeKodu = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde malzeme numarası girişi yapınız.",
							MessageKalem: "Malzeme numarası girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateMalzemeKodu = "None"
					}
					if ((u.Prodtx === "" || u.Prodtx === undefined) && r.RequiredPRODTX === true) {
						u.ValueStateMalzemeTanimi = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde malzeme tanımı girişi yapınız.",
							MessageKalem: "Malzeme tanımı girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateMalzemeTanimi = "None"
					}
					if (u.ExternalSystemMaterialNo === "" && u === "1700") {
						m = true;
						l = false;
						this.hataListesi.push({
							Message: h + " nolu kalemde Üretim yeri 1700 olamaz.",
							MessageKalem: "Üretim Yerini Değiştiriniz.",
							ItemNo: h,
							Category: "Malzeme"
						});
						u.ValueStateUretimYeri = "Error"
					} else {
						u.ValueStateUretimYeri = "None"
					}
					if ((u.Matkl === "" || u.Matkl === undefined) && r.RequiredMATKL === true) {
						u.ValueStateMalGrubu = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde mal grubu girişi yapınız.",
							MessageKalem: "Mal grubu girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateMalGrubu = "None"
					}
					if ((u.Werks === "" || u.Werks === undefined) && r.RequiredWERKS === true) {
						u.ValueStateUretimYeri = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde Üretim yeri girişi yapınız.",
							MessageKalem: "Üretim yeri girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateUretimYeri = "None"
					}
					if ((u.Lgort === "" || u.Lgort === undefined) && r.RequiredLGORT === true) {
						u.ValueStateDepoYeri = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde depo yeri girişi yapınız.",
							MessageKalem: "Depo yeri girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateDepoYeri = "None"
					}
					if ((u.Menge == "" || u.Menge === undefined || u.Menge == "0" || u.Menge === "0.00" || u.Menge == "0.000" || u.Menge == "0.0") &&
						r.RequiredMENGE === true) {
						u.ValueStateMiktar = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde miktar girişi yapınız.",
							MessageKalem: "Miktar girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateMiktar = "None"
					}
					if ((u.Meins === "" || u.Meins === undefined) && r.RequiredMEINS === true) {
						u.ValueStateBirim = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde Ölçü birimi girişi yapınız.",
							MessageKalem: "Ölçü birimi girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateBirim = "None"
					}
					if ((u.Price === "" || u.Price === 0 || u.Price === "0.00" || u.Price === undefined) && r.RequiredPRICE === true) {
						u.ValueStateBirimFiyat = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde birim fiyat girişi yapınız.",
							MessageKalem: "Birim fiyat girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateBirimFiyat = "None"
					}
					if ((u.PriceUnit === "" || u.PriceUnit === "0" || u.PriceUnit === "0.00" || u.PriceUnit === "0,00" || u.PriceUnit === undefined) &&
						r.RequiredPRICE_UNIT === true) {
						u.ValueStateFiyatBirimi = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde fiyat birimi girişi yapınız.",
							MessageKalem: "Fiyat birimi girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateFiyatBirimi = "None"
					}
					if ((u.Iwaer === "" || u.Iwaer === "0" || u.Iwaer === "0.00" || u.Iwaer === undefined) && r.RequiredIWAER === true) {
						u.ValueStateParaBirimi = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde para birimi girişi yapınız.",
							MessageKalem: "Para birimi girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateParaBirimi = "None"
					}
					if ((u.Taxbr === "" || u.Taxbr === undefined) && r.RequiredTAXBR === true) {
						u.ValueStateVergiOrani = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde vergi oranı girişi yapınız.",
							MessageKalem: "Vergi oranı girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateVergiOrani = "None"
					}
					if ((u.Taxtu === "" || u.Taxtu === 0 || u.Taxtu === undefined) && r.RequiredTAXTU === true) {
						u.ValueStateVergiTutari = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde vergi tutarı girişi yapınız.",
							MessageKalem: "Vergi tutarı girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateVergiTutari = "None"
					}
					if ((u.Eeind === "" || u.Eeind === undefined || u.Eeind === null) && r.RequiredEEIND === true) {
						u.ValueStateTeslimatTarihi = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde teslimat tarihi girişi yapınız.",
							MessageKalem: "Teslimat tarihi girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateTeslimatTarihi = "None"
					}
					if ((u.Ekgrp === "" || u.Ekgrp === undefined) && r.RequiredEKGRP === true) {
						u.ValueStateSaGrubu = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde satınalma grubu girişi yapınız.",
							MessageKalem: "satınalma grubu girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateSaGrubu = "None"
					}
					if ((u.Ekorg === "" || u.Ekorg === undefined) && r.RequiredEKORG === true) {
						u.ValueStateSaOrg = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde satınalma organizasyonu girişi yapınız.",
							MessageKalem: "satınalma organizasyonu girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateSaOrg = "None"
					}
					if ((u.Rsnum === "" || u.Rsnum === undefined) && r.RequiredRSNUM === true) {
						u.ValueStateRsnum = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu kalemde Rezarvasyon no girişi yapınız.",
							MessageKalem: "Rezarvasyon no girişi yapınız.",
							ItemNo: h,
							Category: "Malzeme"
						})
					} else {
						u.ValueStateRsnum = "None"
					}
					if (m === true) {
						u.KalemHatasi = true
					} else {
						u.KalemHatasi = false
					}
				}
				for (var g = 0; g < r.hesapTayiniBilgileri.length; g++) {
					var p = r.hesapTayiniBilgileri[g];
					var h = a.removeLeadingZeroes(p.Itmno);
					var m = false;
					if (p.Hstyp === "" || p.Hstyp === undefined) {
						p.ValueStateTayinTipi = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde hesap tayin tipi girişi yapınız.",
							MessageKalem: "Hesap tayin tipi girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateTayinTipi = "None"
					}
					if ((p.Pypno === "" || p.Pypno === undefined) && r.RequiredPYPNO === true && (p.Hstyp != "2" && r.BelgeNumarasi != "DT_16_30_2")) {
						p.ValueStatePyp = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde pyp no girişi yapınız.",
							MessageKalem: "Pyp no girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStatePyp = "None"
					}
					if ((p.Kostl === "" || p.Kostl === undefined) && r.RequiredKOSTL === true) {
						p.ValueStateMasrafYeri = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde masraf yeri girişi yapınız.",
							MessageKalem: "Masraf yeri girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateMasrafYeri = "None"
					}
					if ((p.Aufnr === "" || p.Aufnr === undefined) && r.RequiredAUFNR === true) {
						p.ValueStateSiparisNo = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde Sipariş no girişi yapınız.",
							MessageKalem: "Sipariş no girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateSiparisNo = "None"
					}
					if ((p.Kokrs === "" || p.Kokrs === undefined) && r.RequiredKNTTP === true) {
						p.ValueStateKontrolKodu = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde kontrol kodu girişi yapınız.",
							MessageKalem: "Kontrol kodu girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateKontrolKodu = "None"
					}
					if ((p.Saknr === "" || p.Saknr === undefined) && r.RequiredSAKNR === true) {
						p.ValueStateAnaHesap = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde anahesap girişi yapınız.",
							MessageKalem: "Anahesap girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateAnaHesap = "None"
					}
					if ((p.Gsber === "" || p.Gsber === undefined) && r.RequiredGSBER === true) {
						p.ValueStateIsAlani = "Error";
						m = true;
						l = false;
						this.hataListesi.push({
							Message: "Lütfen " + h + " nolu hesap tayininde iç alanı girişi yapınız.",
							MessageKalem: "İç alanı girişi yapınız.",
							ItemNo: h,
							Category: "HesapTayini"
						})
					} else {
						p.ValueStateIsAlani = "None"
					}
					if (m === true) {
						p.KalemHatasi = true
					} else {
						p.KalemHatasi = false
					}
				}
				var f = r["headerData"]["belgeTipi"];
				var c;
				var v = this.getView().getModel("subMenuModel");
				var y = v.getData();
				for (var M = 0; M < y.length; M++) {
					if (y[M].Sutyp === f) {
						c = y[M]["Reservation"]
					}
				}
				if (r.onaycilar.length === 0 && c == false) {
					this.hataListesi.push({
						Message: "Talebe Ekli Onaycı Bulunamadı. Talep Onaya Gönderilemez. ",
						Category: "Onayci"
					});
					d = true;
					l = false
				} else {
					d = false
				}
				this.getView().getModel("detailModel").refresh(true);
				if (l === false) {
					this._openItemErrorList(this.hataListesi, o);
					t(false);
					return false
				} else {
					this.hataListesi = [];
					this._openItemErrorList(this.hataListesi);
					let a = new Promise(function (e, t) {
						i.checkPrBapi(e, t)
					});
					a.then(function (i) {
						if (e == "Test") {
							s.success("Belgede hata bulunmadı.")
						}
						t(true);
						return true
					}, function (e) {
						t(false);
						return false
					})
				}
			})
		},
		checkPrBapi: function (e, t) {
			var i = this.getOwnerComponent().getModel();
			var a = this.getView().getModel("detailModel").getData();
			var r = this.getView();
			var l = this;
			var n = "";
			var o = g.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			n = "PR_CHECK";
			var d = {};
			var u = [];
			var h = [];
			var m = [];
			var p = [];
			var f = [];
			f.push({
				Message: ""
			});
			h = this.getHeaderToService("");
			d.IvType = n;
			d.IvTest = true;
			u = this.getItemToService();
			m = this.getAccountItemsToService();
			d.NavHeader = h;
			d.NavItem = u;
			d.NavAccount = m;
			d.NavReturn = f;
			d.NavNote = p;
			var l = this;
			r.setBusy(true);
			i.create("/DocCreateSet", d, {
				success: c,
				error: v
			});

			function c(i, a) {
				r.setBusy(false);
				let s = false;
				i.NavReturn.results.forEach(function (e, t) {
					if (e.Type === "E") {
						s = true
					}
				});
				if (!s) {
					e();
					r.setBusy(false)
				} else {
					var n = i.NavReturn.results;
					l.setMessageInitModel(l, n);
					t();
					r.setBusy(false)
				}
			}

			function v(e) {
				s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				r.setBusy(false);
				t()
			}
		},
		handlePressKalemEkle: function (e) {
			var t = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			var i = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var a = this.getView().getModel("detailModel").getData().headerData.belgeTipi;
			var r = this.getView().getModel("subMenuModel").getData();
			var s = this.getView().getModel("detailModel").getData().baslikBilgileri.Scnum;
			var l = null;
			for (var n = 0; n < r.length; n++) {
				if (r[n].Sutyp === a) {
					l = r[n].Navi;
					break
				}
			}
			if (l === "Catalog") {
				this._postOnayaGonder("TSL", "AUTO", s)
			} else {
				this.internalUpdateKalemEkle({}, t, i)
			}
		},
		handlePressKalemSil: function (e) {
			var t = this.getView().byId("idTableMalzeme").getSelectedIndices();
			var i = this.getView().byId("idTableMalzeme");
			var a = this;
			if (t.length === 0) {
				s.error("Lütfen silinecek kalemi seçiniz.");
				return
			}
			var r = [];
			for (var l = 0; l < t.length; l++) {
				var n = i.getContextByIndex(t[l]).getObject();
				r.push(n)
			}

			function o(e) {
				if (e == "OK") {
					a.internalDeleteItem(r)
				}
			}
			s.confirm("Seçilen kalemleri silmek istediğinizden emin misiniz?", o, "Uyarı")
		},
		_kalemSil: function (e) {
			var t = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			var i = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var a = this.getView().getModel("detailModel").getData().kalemNotlari;
			var r = this.getView().byId("idTableMalzeme");
			for (var s = 0; s < t.length; s++) {
				if (t[s].Itmno === e.Itmno) {
					t.splice(s, 1);
					r.setSelectedIndex(-1);
					break
				}
			}
			for (var l = 0; l < i.length; l++) {
				if (i[l].Itmno === e.Itmno) {
					i.splice(l, 1);
					break
				}
			}
			for (var l = a.length; l > 0; l--) {
				if (a[l - 1].Itmno === e.Itmno) {
					a.splice(l - 1, 1)
				}
			}
			this._setRowNumbers(t);
			this._setRowNumbers(i);
			this._setRowNumbersNote(a);
			var n = this.getView().byId("idTableNotlar");
			n.setVisible(false);
			this.getView().getModel("detailModel").refresh(true)
		},
		handlePressKalemKopyala: function (e) {
			var t = this.getView().byId("idTableMalzeme").getSelectedIndices();
			var i = this.getView().byId("idTableMalzeme");
			if (t.length === 0) {
				s.error("Lütfen kopyalanacak kalemi seçiniz.");
				return
			} else if (t.length > 1) {
				s.error("Lütfen 1 adet kalem seçiniz.");
				return
			}
			var a = i.getContextByIndex(t[0]).getObject();
			var r = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			var l = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var n = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var o = jQuery.extend(true, {}, a);
			r.push(o);
			var d = {};
			for (var g = 0; g < l.length; g++) {
				if (l[g].Itmno === a.Itmno) {
					d = l[g];
					break
				}
			}
			l.push({
				Acino: d.Acino,
				Aufnr: d.Aufnr,
				Gsber: d.Gsber,
				Hstyp: d.Hstyp,
				Itmno: d.Itmno,
				Kokrs: d.Kokrs,
				Kostl: d.Kostl,
				Pypno: d.Pypno,
				Saknr: d.Saknr,
				Scnum: d.Scnum,
				Scvrs: d.Scvrs
			});
			this._setRowNumbers(r);
			this._setRowNumbers(l);
			this.getView().getModel("detailModel").refresh(true)
		},
		handlePressKalemDetay: function (e) {
			var i = this.getView().byId("idTableMalzeme").getSelectedIndices();
			var a = this.getView().byId("idTableMalzeme");
			if (i.length === 0) {
				s.error("Lütfen kalem seçimi yapınız.");
				return
			} else if (i.length > 1) {
				s.error("Lütfen 1 adet kalem seçiniz.");
				return
			}
			var r = a.getContextByIndex(i[0]).getObject();
			if (!this.oMalzemeDetay) {
				this.oMalzemeDetay = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.MalzemeDetay", this);
				this.getView().addDependent(this.oMalzemeDetay)
			}
			var l = this;
			var n = this.getOwnerComponent().getModel();
			var o = this.getView();
			var l = this;
			var d = [];
			d.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, r.Prodi));
			o.setBusy(true);
			var g = new t({
				MalzemeNumarasi: r.Prodi,
				SozlesmeNumarasi: r.Prodi,
				TemelVerilerMetni: "",
				OrtakTanimMetni: "",
				SiparisMetni: "",
				Karekteristikler: []
			});
			this.oMalzemeDetay.setModel(g, "malzemeDetay");
			n.read("/MaterialCharListSet", {
				filters: d,
				success: function (e, t) {
					g.setProperty("/Karekteristikler", e.results);
					g.refresh(true);
					l.setMaterialOrderText(l, r, g)
				},
				error: function (e, t) {
					sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					o.setBusy(false)
				}
			})
		},
		setMaterialOrderText: function (e, t, i, a) {
			var r = this.getOwnerComponent().getModel();
			var s = this.getView();
			var l = [];
			l.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, t.Prodi));
			if (t.Werks != "") {
				l.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, t.Werks))
			}
			r.read("/MaterialReadTextSet", {
				filters: l,
				success: function (t, a) {
					var r = "";
					var l = "";
					var n = "";
					t.results.forEach(function (e, t) {
						if (e.Tdid == "BEST") {
							r = r + " " + e.Tdline + "\n"
						} else if (e.Tdid == "GRUN") {
							l = l + " " + e.Tdline + "\n"
						} else if (e.Tdid == "ST") {
							n = n + " " + e.Tdline + "\n"
						}
					});
					i.setProperty("/SiparisMetni", r);
					i.setProperty("/TemelVerilerMetni", l);
					i.setProperty("/OrtakTanimMetni", n);
					i.refresh(true);
					e.oMalzemeDetay.open();
					s.setBusy(false)
				},
				error: function (e, t) {
					sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					s.setBusy(false)
				}
			})
		},
		handlePressKapatMalzemeDetay: function (e) {
			this.oMalzemeDetay.close()
		},
		_setRowNumbers: function (e) {
			var t = e.length;
			var i = "";
			if (t > 0) {
				for (var a = 0; a < t; a++) {
					if (i >= e[a].Itmno) {
						e[a].Itmno = "000000"
					} else {
						i = e[a].Itmno
					}
					if (e[a].Itmno == "000000" && a != 0) {
						var r = parseInt(e[a - 1].Itmno) + 10;
						e[a].Itmno = ("00000" + r).slice(-6).toString()
					} else if (e[a].Itmno == "000000") {
						e[a].Itmno = "000010"
					}
					i = e[a].Itmno
				}
			}
		},
		_setRowNumbersNote: function (e) {},
		handlePressHesapTayini: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getObject();
			var i = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var r = this.getView().byId("idTableHesapTayin");
			var s = this.getView().byId("idTextHesapTayini");
			var o = this.byId("idPageLayoutForm");
			var d = this.byId("idPageSectionHesapTayini");
			this.getView().byId("idButtonNextHesapTayini").setEnabled(true);
			this.getView().byId("idButtonBackHesapTayini").setEnabled(true);
			s.setText(a.removeLeadingZeroes(t.Itmno) + " nolu kalem hesap tayini");
			for (var g = 0; g < i.length; g++) {
				if (t.Itmno === i[g].Itmno) {
					break
				}
			}
			if (g === 0) {
				this.getView().byId("idButtonNextHesapTayini").setEnabled(true);
				this.getView().byId("idButtonBackHesapTayini").setEnabled(false)
			}
			if (i.length - 1 === g) {
				this.getView().byId("idButtonNextHesapTayini").setEnabled(false);
				this.getView().byId("idButtonBackHesapTayini").setEnabled(true)
			}
			if (i.length === 1) {
				this.getView().byId("idButtonBackHesapTayini").setEnabled(false);
				this.getView().byId("idButtonNextHesapTayini").setEnabled(false)
			}
			var u = [];
			r.setVisible(true);
			u.push(new l("Itmno", n.EQ, t.Itmno));
			r.getBinding("rows").filter(u);
			o.setSelectedSection(d)
		},
		handlePressNot: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/kalemNotlari");
			var r = e.getSource().getBindingContext("detailModel").getObject();
			t.setProperty("/selectedItem", r);
			var s = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			var o = this.getView().byId("idTableNotlar");
			var d = this.getView().byId("idTextNotlar");
			var g = this.byId("idPageLayoutForm");
			var u = this.byId("idPageSectionNotlar");
			this.getView().byId("idButtonNext").setEnabled(true);
			this.getView().byId("idButtonBack").setEnabled(true);
			d.setText(a.removeLeadingZeroes(r.Itmno) + " nolu kalem notları");
			for (var h = 0; h < s.length; h++) {
				if (r.Itmno === s[h].Itmno) {
					break
				}
			}
			if (h === 0) {
				this.getView().byId("idButtonNext").setEnabled(true);
				this.getView().byId("idButtonBack").setEnabled(false)
			}
			if (s.length - 1 === h) {
				this.getView().byId("idButtonNext").setEnabled(false);
				this.getView().byId("idButtonBack").setEnabled(true)
			}
			if (s.length === 1) {
				this.getView().byId("idButtonBack").setEnabled(false);
				this.getView().byId("idButtonNext").setEnabled(false)
			}
			var m = [];
			o.setVisible(true);
			m.push(new l("Itmno", n.EQ, r.Itmno));
			o.getBinding("items").filter(m);
			g.setSelectedSection(u)
		},
		handlePressNotDegistir: function (e) {
			this._openNotDialog(e)
		},
		_openNotDialog: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getObject();
			this.oNotDialog = new sap.m.Dialog({
				title: t.Noturtx,
				contentWidth: "680px",
				contentHeight: "450px",
				resizable: false,
				draggable: true,
				content: new sap.m.TextArea("idTextAciklama", {
					value: t.Descr,
					width: "94%",
					height: "400px",
					editable: this.getView().getModel("detailModel").getData().headerData.editable
				}).addStyleClass("sapUiSmallMargin"),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Güncelle",
					enabled: this.getView().getModel("detailModel").getData().headerData.editable,
					press: function () {
						t.Descr = d.byId("idTextAciklama").getValue();
						this.getView().getModel("detailModel").refresh(true);
						this._changeNotSayisi(this.getView().getModel("detailModel").getData());
						this.oNotDialog.destroy()
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Kapat",
					press: function () {
						this.oNotDialog.destroy()
					}.bind(this)
				})
			});
			this.oNotDialog.addStyleClass("sapUiSizeCompact");
			this.getView().addDependent(this.oNotDialog);
			this.oNotDialog.open()
		},
		_changeNotSayisi: function (e) {
			for (var t = 0; t < e.malzemeBilgileri.length; t++) {
				var i = 0;
				for (var a = 0; a < e.kalemNotlari.length; a++) {
					if (e.kalemNotlari[a].Itmno === e.malzemeBilgileri[t].Itmno) {
						if (e.kalemNotlari[a].Descr.trim() !== "") {}
						i++
					}
				}
				e.malzemeBilgileri[t].NotSayisi = i
			}
			this.getView().getModel("detailModel").refresh(true)
		},
		notSayisiniDondur: function (e, t) {
			var i = null;
			for (var a = 0; a < e.malzemeBilgileri.length; a++) {
				if (t === e.malzemeBilgileri[a].Itmno) {
					i = e.malzemeBilgileri[a];
					break
				}
			}
			return i.NotSayisi
		},
		notBackHesapTayini: function (e) {
			var t = this.getView().byId("idTableHesapTayin").getRows();
			var i = t[0].getBindingContext("detailModel").getObject().Itmno;
			var r = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			this.getView().byId("idButtonNextHesapTayini").setEnabled(true);
			var s = null;
			for (var o = 0; o < r.length; o++) {
				if (r[o].Itmno === i) {
					s = r[o - 1];
					break
				}
			}
			if (o === 1) {
				e.getSource().setEnabled(false)
			}
			if (s !== undefined) {
				var d = this.getView().byId("idTableHesapTayin");
				var g = this.getView().byId("idTextHesapTayini");
				g.setText(a.removeLeadingZeroes(s.Itmno) + " nolu kalem hesap tayini");
				var u = [];
				u.push(new l("Itmno", n.EQ, s.Itmno));
				d.getBinding("rows").filter(u)
			}
		},
		notBack: function (e) {
			var t = this.getView().byId("idTableNotlar").getItems();
			if (t.length == 0) {
				return
			}
			var i = this.getView().getModel("detailModel");
			var r = i.getProperty("/selectedItem");
			var s = r.Itmno;
			var o = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			this.getView().byId("idButtonNext").setEnabled(true);
			var r = null;
			for (var d = 0; d < o.length; d++) {
				if (o[d].Itmno === s) {
					r = o[d - 1];
					break
				}
			}
			if (d === 1) {
				e.getSource().setEnabled(false)
			}
			if (r !== undefined) {
				var g = this.getView().byId("idTableNotlar");
				var u = this.getView().byId("idTextNotlar");
				u.setText(a.removeLeadingZeroes(r.Itmno) + " nolu kalem notları");
				var h = [];
				h.push(new l("Itmno", n.EQ, r.Itmno));
				g.getBinding("items").filter(h);
				i.setProperty("/selectedItem", r)
			} else {}
		},
		notNext: function (e) {
			var t = this.getView().byId("idTableNotlar").getItems();
			var i = this.getView().getModel("detailModel");
			var r = i.getProperty("/selectedItem");
			var s = r.Itmno;
			var o = i.getData().malzemeBilgileri;
			this.getView().byId("idButtonBack").setEnabled(true);
			for (var d = 0; d < o.length; d++) {
				if (o[d].Itmno === s) {
					r = o[d + 1];
					break
				}
			}
			if (d + 2 === o.length) {
				e.getSource().setEnabled(false)
			}
			if (r !== undefined) {
				var g = this.getView().byId("idTableNotlar");
				var u = this.getView().byId("idTextNotlar");
				u.setText(a.removeLeadingZeroes(r.Itmno) + " nolu kalem notları");
				var h = [];
				h.push(new l("Itmno", n.EQ, r.Itmno));
				g.getBinding("items").filter(h);
				i.setProperty("/selectedItem", r)
			} else {}
		},
		addNewNote: function () {
			var e = this.getView().getModel("detailModel").getProperty("/selectedItem");
			this.oNotDialog = new sap.m.Dialog({
				title: e.KategoriText,
				contentWidth: "680px",
				contentHeight: "450px",
				resizable: false,
				draggable: true,
				content: new sap.m.TextArea("idTextAciklama", {
					value: e.Tanim,
					width: "94%",
					height: "400px",
					editable: this.getView().getModel("detailModel").getData().headerData.editable
				}).addStyleClass("sapUiSmallMargin"),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Güncelle",
					enabled: this.getView().getModel("detailModel").getData().headerData.editable,
					press: function () {
						e.Tanim = d.byId("idTextAciklama").getValue();
						this.getView().getModel("detailModel").refresh(true);
						this._changeNotSayisi(this.getView().getModel("detailModel").getData());
						this.oNotDialog.destroy()
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Kapat",
					press: function () {
						this.oNotDialog.destroy()
					}.bind(this)
				})
			});
			this.oNotDialog.addStyleClass("sapUiSizeCompact");
			this.getView().addDependent(this.oNotDialog);
			this.oNotDialog.open()
		},
		notNextHesapTayini: function (e) {
			var t = this.getView().byId("idTableHesapTayin").getRows();
			var i = t[0].getBindingContext("detailModel").getObject().Itmno;
			var r = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			this.getView().byId("idButtonBackHesapTayini").setEnabled(true);
			var s = null;
			for (var o = 0; o < r.length; o++) {
				if (r[o].Itmno === i) {
					s = r[o + 1];
					break
				}
			}
			if (o + 2 === r.length) {
				e.getSource().setEnabled(false)
			}
			if (s !== undefined) {
				var d = this.getView().byId("idTableHesapTayin");
				var g = this.getView().byId("idTextHesapTayini");
				g.setText(a.removeLeadingZeroes(s.Itmno) + " nolu kalem hesap tayini");
				var u = [];
				u.push(new l("Itmno", n.EQ, s.Itmno));
				d.getBinding("rows").filter(u)
			}
		},
		tayinTumunuGoster: function (e) {
			var t = this.getView().byId("idTableHesapTayin");
			t.getBinding("rows").filter([]);
			this.getView().byId("idButtonBackHesapTayini").setEnabled(true);
			this.getView().byId("idButtonNextHesapTayini").setEnabled(true);
			var i = this.getView().byId("idTextHesapTayini");
			i.setText("Tümü")
		},
		_openItemErrorList: function (e, t) {
			var i = this.getView().byId("idPanelErrorList");
			var a = this.byId("idPageLayoutForm");
			var r = this.byId("idPageSectionHatalar");
			var s = this;
			i.destroyContent();
			for (var l = 0; l < e.length; l++) {
				i.addContent(new sap.m.MessageStrip({
					text: e[l].Message,
					showCloseButton: true,
					showIcon: true,
					type: "Error",
					customData: [new sap.ui.core.CustomData({
						key: "Category",
						value: e[l].Category
					}), new sap.ui.core.CustomData({
						key: "oView",
						value: s.getView()
					})]
				}).addStyleClass("sapUiTinyMarginTop").setLink(new sap.m.Link({
					text: "Hatayı göster"
				}).attachPress(s.navigateErrorLink)))
			}
			var n = t + e.length - 1;
			if (e.length !== 0) {
				a.setSelectedSection(r);
				r.setTitle("Hata listesi (" + n + ")");
				r.setVisible(true)
			} else {
				r.setTitle("Hata listesi")
			}
		},
		navigateErrorLink: function (e) {
			var t = e.getSource().getParent().getCustomData()[1].getValue();
			var i = e.getSource().getParent().getCustomData()[2].getValue();
			var a = i.byId("idPageLayoutForm");
			var r = i.byId("idPageSectionMalzemeler");
			var s = i.byId("idPageSectionHesapTayini");
			var l = i.byId("idPageSectionBaslik");
			var n = i.byId("idPageSectionOnay");
			if (t === "Malzeme") {
				a.setSelectedSection(r)
			}
			if (t === "HesapTayini") {
				a.setSelectedSection(s)
			}
			if (t === "Onayci") {
				a.setSelectedSection(n)
			}
			if (t === "Başlık") {
				a.setSelectedSection(l)
			}
		},
		_removeErrorList: function () {
			var e = this.getView().byId("idPanelErrorList");
			var t = this.byId("idPageLayoutForm");
			var i = this.byId("idPageSectionHatalar");
			e.destroyContent();
			i.setVisible(false)
		},
		handlePressKalemHatasi: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getObject();
			var i = a.removeLeadingZeroes(t.Itmno);
			var r = this.hataListesi;
			var l = [];
			for (var n = 0; n < r.length; n++) {
				if (r[n].ItemNo === i) {
					l.push(r[n].MessageKalem)
				}
			}
			var o = "";
			for (var d = 0; d < l.length; d++) {
				o += l[d] + "\n"
			}
			s.error(o, {
				title: i + " Nolu kalem"
			})
		},
		handleChangeExpand: function (e) {
			var t = e.getSource();
			if (t.getExpanded() === true) {
				t.setHeaderText("Detaylar")
			} else {
				t.setHeaderText("Detayları görüntüle")
			}
		},
		malzemeNoDoldur: function (e) {
			var t = this.getView();
			var i = t.byId("idTableMalzeme");
			if (i.getSelectedItems().length === 0) {
				s.error("Lütfen kalem seçimi yapınız.")
			} else {
				var a = i.getSelectedContexts();
				for (var r = 0; r < a.length; r++) {
					a[r].getObject().Prodi = "1"
				}
			}
			i.getModel("detailModel").refresh(true)
		},
		handleValueHelpMasrafYeri: function (e) {
			this.selectedMasrafYeri = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oMasrafYeri) {
				this.oMasrafYeri = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.MasrafYeriSearchHelp", this);
				this.getView().addDependent(this.oMasrafYeri)
			}
			var i = new t({
				TitleMasrafYeri: "Masraf yeri arama yardımı",
				Kostl: "",
				Ktext: ""
			});
			this.oMasrafYeri.setModel(i);
			this.byId("idTableMasrafYerleri").getBinding("items").filter([]);
			this.oMasrafYeri.open()
		},
		handleSearchMasrafYeri: function () {
			var e = this.oMasrafYeri.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Kostl) {
				i.push(new l("Kostl", n.EQ, t.Kostl))
			}
			if (t.Ktext) {
				i.push(new l("Ktext", n.EQ, t.Ktext))
			}
			this.byId("idTableMasrafYerleri").getBinding("items").filter(i)
		},
		handlePressKapatMasrafYeri: function (e) {
			this.byId("idTableMasrafYerleri").getBinding("items").filter([]);
			this.oMasrafYeri.close()
		},
		handleSelectedMasrafYeri: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Kostl");
			this.selectedMasrafYeri.Kostl = s;
			this.getCostCenterDetail(this.selectedMasrafYeri, s);
			this.getView().getModel("detailModel").refresh(true);
			this.oMasrafYeri.close()
		},
		onSubmitMasrafYeri: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var l = "/CostCenterSet('" + r.Kostl + "')";
			if (r.Kostl == "") {
				return
			}
			t.setBusy(true);
			i.read(l, {
				success: function (e) {
					t.setBusy(false);
					r.Kostl = e.Kostl;
					t.getModel("detailModel").refresh(true);
					a.getCostCenterDetail(r, e.Kostl);
					s.info("Organizasyonunuzda bulunmayan bir masraf yeri seçtiniz.")
				},
				error: function (e) {
					t.setBusy(false);
					r.Kostl = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen masraf yeri bulunamadı.")
				}
			})
		},
		onSubmitHareket: function () {
			var e = this.getView().getModel("detailModel");
			var t = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Zzbwart"];
			e.getData()["baslikEkAlanlari"]["ZzBwart"] = t;
			e.refresh()
		},
		onSubmitFieldWerks: function () {
			var e = this.getView().getModel("detailModel");
			var t = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["FieldWerks"];
			e.getData()["baslikEkAlanlari"]["FieldWerks"] = t;
			e.getData()["baslikEkAlanlari"]["FieldLgort"] = "";
			var i = this.getView().getModel();
			i.setProperty("/SmartfieldSet('')/FieldLgort", "");
			i.refresh();
			e.refresh()
		},
		onSubmitFieldLgort: function () {
			var e = this.getView().getModel("detailModel");
			var t = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["FieldLgort"];
			e.getData()["baslikEkAlanlari"]["FieldLgort"] = t;
			e.refresh()
		},
		getCostCenterDetail: function (e, t) {
			var i = this.getView();
			i.setBusy(true);
			var a = this.getOwnerComponent().getModel("odata_service");
			var r = this;
			var l = "/CostCenterDetailSet('" + t + "')";
			if (e.Kostl === "") {
				i.setBusy(false);
				return
			}
			a.read(l, {
				success: function (t) {
					i.setBusy(false);
					e.Kokrs = t.Kokrs;
					e.Gsber = t.Gsber;
					i.getModel("detailModel").refresh(true)
				},
				error: function (t) {
					i.setBusy(false);
					e.Kostl = "";
					i.getModel("detailModel").refresh(true);
					s.error("Girilen masraf yeri bulunamadı.")
				}
			})
		},
		handleValueHelpPypNo: function (e) {
			this.selectedPypNo = e.getSource().getBindingContext("detailModel").getObject();
			var i = e.getSource().getParent().getBindingContext("detailModel").getPath().split("/")[2];
			var a = this.getView().getModel("detailModel").getData()["malzemeBilgileri"][i]["Werks"];
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Werks", a);
			if (!this.oPypNo) {
				this.oPypNo = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.PypNoSearchHelp", this);
				this.getView().addDependent(this.oPypNo)
			}
			var s = new t({
				TitlePypNo: "Pyp no arama yardımı",
				Pspnrx: "",
				Postu: ""
			});
			this.oPypNo.setModel(s);
			this.byId("idTablePypNo").getBinding("items").filter([]);
			this.oPypNo.open()
		},
		handleSearchPypNo: function () {
			var e = this.oPypNo.getModel();
			var t = e.getData();
			var i = [];
			var a = this.selectedWerks;
			i.push(new l("Filtered", n.EQ, true));
			if (t.Pspnrx) {
				i.push(new l("Pspnrx", n.EQ, t.Pspnrx))
			}
			if (a) {
				i.push(new l("Werks", n.EQ, a))
			}
			if (t.Postu) {
				i.push(new l("Postu", n.EQ, t.Postu))
			}
			this.byId("idTablePypNo").getBinding("items").filter(i)
		},
		handlePressKapatPypNo: function (e) {
			this.byId("idTablePypNo").getBinding("items").filter([]);
			this.oPypNo.close()
		},
		handleSelectedPypNo: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Pspnrx");
			this.selectedPypNo.Pypno = s;
			this.getView().getModel("detailModel").refresh(true);
			this.oPypNo.close()
		},
		onSubmitPypNo: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var l = "/PypListSet('" + r.Pypno + "')";
			if (r.Pypno === "") {
				return
			}
			t.setBusy(true);
			i.read(l, {
				success: function (i) {
					t.setBusy(false);
					r.Pypno = i.Pspnrx;
					t.getModel("detailModel").refresh(true);
					this.internalUpdateItem(e.getSource().getBindingContext("detailModel").sPath, "WERKS")
				},
				error: function (e) {
					t.setBusy(false);
					r.Pypno = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen pyp no bulunamadı.")
				}
			})
		},
		handleValueHelpMalgrubu: function (e) {
			var i = this.getView().getModel("odata_service");
			i.setSizeLimit(5e3);
			i.refresh();
			this.selectedMalgrubu = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oMalgrubu) {
				this.oMalgrubu = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.MalGrubuSearchHelp", this);
				this.getView().addDependent(this.oMalgrubu)
			}
			var a = new t({
				TitleMalgrubu: "Mal grubu arama yardımı",
				Matkl: "",
				Wgbez60: ""
			});
			this.oMalgrubu.setModel(a);
			var r = [];
			r.push(new l("Dokod", n.EQ, this.type));
			this.byId("idTableMalgrubu").getBinding("items").filter(r);
			this.oMalgrubu.open()
		},
		onSubmitMalgrubu: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var o = [];
			o.push(new l("Filtered", n.EQ, true));
			if (r.Matkl) {
				o.push(new l("Matkl", n.EQ, r.Matkl))
			}
			if (r.Wgbez60) {
				o.push(new l("Wgbez60", n.EQ, r.Wgbez60))
			}
			if (this.type) {
				o.push(new l("Dokod", n.EQ, this.type))
			} else if (this.oDataView.headerData.belgeTipi) {
				o.push(new l("Dokod", n.EQ, this.oDataView.headerData.belgeTipi))
			}
			var d = "/MaterialGroupSet";
			if (r.Matkl === "") {
				r.Matkltx = "";
				return
			}
			t.setBusy(true);
			i.read(d, {
				filters: o,
				success: function (e) {
					t.setBusy(false);
					r.Matkl = e.results[0].Matkl;
					r.Matkltx = e.results[0].Wgbez60;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					r.Matkl = "";
					r.Matkltx = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen mal grubu bulunamadı.")
				}
			})
		},
		handleSearchMalgrubu: function () {
			var e = this.oMalgrubu.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Matkl) {
				i.push(new l("Matkl", n.EQ, t.Matkl))
			}
			if (t.Wgbez60) {
				i.push(new l("Wgbez60", n.EQ, t.Wgbez60))
			}
			if (this.type) {
				i.push(new l("Dokod", n.EQ, this.type))
			} else if (this.oDataView.headerData.belgeTipi) {
				i.push(new l("Dokod", n.EQ, this.oDataView.headerData.belgeTipi))
			}
			this.byId("idTableMalgrubu").getBinding("items").filter(i)
		},
		handleSelectedMalgrubu: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Matkl");
			var l = r.getProperty("Wgbez60");
			this.selectedMalgrubu.Matkl = s;
			this.selectedMalgrubu.Matkltx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oMalgrubu.close()
		},
		handlePressKapatMalgrubu: function (e) {
			this.byId("idTableMalgrubu").getBinding("items").filter([]);
			this.oMalgrubu.close()
		},
		handleValueHelpTalepEden: function (e) {
			if (!this.oTalepEden) {
				this.oTalepEden = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.TalepEdenSearchHelp", this);
				this.getView().addDependent(this.oTalepEden)
			}
			var i = new t({
				TitleTalepEden: "Talep eden arama yardımı",
				Uname: "",
				Ename: "",
				Firstname: "",
				Lastname: ""
			});
			this.oTalepEden.setModel(i);
			this.byId("idTableTalepEden").getBinding("items").filter([]);
			this.oTalepEden.open()
		},
		onSubmitTalepEden: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = t.getModel("detailModel").getData();
			var r = this;
			var l = e.getSource().getValue();
			var n = "/UserListSet('" + l + "')";
			if (l === "") {
				a.baslikEkAlanlari.ZzTlpedn = "";
				a.baslikEkAlanlari.ZzTlpedntext = "";
				return
			}
			t.setBusy(true);
			i.read(n, {
				success: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzTlpedn = e.Uname;
					a.baslikEkAlanlari.ZzTlpedntext = e.Ename;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzTlpedn = "";
					a.baslikEkAlanlari.ZzTlpedntext = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen talep eden bulunamadı.")
				}
			})
		},
		handleSearchTalepEden: function () {
			var e = this.oTalepEden.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Uname) {
				i.push(new l("Uname", n.EQ, t.Uname))
			}
			if (t.Firstname) {
				i.push(new l("Firstname", n.EQ, t.Firstname))
			}
			if (t.Lastname) {
				i.push(new l("Lastname", n.EQ, t.Lastname))
			}
			this.byId("idTableTalepEden").getBinding("items").filter(i)
		},
		handleSelectedTalepEden: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Uname");
			var l = r.getProperty("Ename");
			a.getData().baslikEkAlanlari.ZzTlpedn = s;
			a.getData().baslikEkAlanlari.ZzTlpedntext = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oTalepEden.close()
		},
		handlePressKapatTalepEden: function (e) {
			this.byId("idTableTalepEden").getBinding("items").filter([]);
			this.oTalepEden.close()
		},
		handleValueHelpMudurluk: function (e) {
			if (!this.oTalepMudurluk) {
				this.oTalepMudurluk = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.TalepEdenMudurlukSearchHelp",
					this);
				this.getView().addDependent(this.oTalepMudurluk)
			}
			var i = new t({
				Title: "Talep eden müdürlük arama yardımı",
				Aufnr: "",
				Ktext: ""
			});
			this.oTalepMudurluk.setModel(i);
			this.byId("idTableMudurluk").getBinding("items").filter([]);
			this.oTalepMudurluk.open()
		},
		onSubmitMudurluk: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = t.getModel("detailModel").getData();
			var r = this;
			var l = e.getSource().getValue();
			var n = "/MudurlukListSet('" + l + "')";
			if (l === "") {
				a.baslikEkAlanlari.ZzTlpmdr = "";
				a.baslikEkAlanlari.ZzTlpmdrtext = "";
				return
			}
			t.setBusy(true);
			i.read(n, {
				success: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzTlpmdr = e.Aufnr;
					a.baslikEkAlanlari.ZzTlpmdrtext = e.Ktext;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzTlpmdr = "";
					a.baslikEkAlanlari.ZzTlpmdrtext = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen talep eden müdürlük bulunamadı.")
				}
			})
		},
		handleSearchMudurluk: function () {
			var e = this.oTalepMudurluk.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Aufnr) {
				i.push(new l("Aufnr", n.EQ, t.Aufnr))
			}
			if (t.Ktext) {
				i.push(new l("Ktext", n.EQ, t.Ktext))
			}
			this.byId("idTableMudurluk").getBinding("items").filter(i)
		},
		handleSelectedMudurluk: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Aufnr");
			var l = r.getProperty("Ktext");
			a.getData().baslikEkAlanlari.ZzTlpmdr = s;
			a.getData().baslikEkAlanlari.ZzTlpmdrtext = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oTalepMudurluk.close()
		},
		handlePressKapatMudurluk: function (e) {
			this.byId("idTableMudurluk").getBinding("items").filter([]);
			this.oTalepMudurluk.close()
		},
		handleValueHelpMuteahhit: function (e) {
			if (!this.oTalepMuteahhit) {
				this.oTalepMuteahhit = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.MuteahhitSearchHelp", this);
				this.getView().addDependent(this.oTalepMuteahhit)
			}
			var i = new t({
				Title: "Müteahhit arama yardımı",
				Lifnr: "",
				Name1: ""
			});
			this.oTalepMuteahhit.setModel(i);
			this.byId("idTableMuteahhit").getBinding("items").filter([]);
			this.oTalepMuteahhit.open()
		},
		onSubmitMuteahhit: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = t.getModel("detailModel").getData();
			var r = this;
			var l = e.getSource().getValue();
			var n = "/VendorListSet('" + l + "')";
			if (l === "") {
				a.baslikEkAlanlari.ZzMuthno = "";
				a.baslikEkAlanlari.ZzMuthTx = "";
				return
			}
			t.setBusy(true);
			i.read(n, {
				success: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzMuthno = e.Lifnr;
					a.baslikEkAlanlari.ZzMuthTx = e.Name1;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					a.baslikEkAlanlari.ZzMuthno = "";
					a.baslikEkAlanlari.ZzMuthTx = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen müteahhit bulunamadı.")
				}
			})
		},
		handleSearchMuteahhit: function () {
			var e = this.oTalepMuteahhit.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Lifnr) {
				i.push(new l("Lifnr", n.EQ, t.Lifnr))
			}
			if (t.Name1) {
				i.push(new l("Name1", n.EQ, t.Name1))
			}
			this.byId("idTableMuteahhit").getBinding("items").filter(i)
		},
		handleSelectedMuteahhit: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Lifnr");
			var l = r.getProperty("Name1");
			a.getData().baslikEkAlanlari.ZzMuthno = s;
			a.getData().baslikEkAlanlari.ZzMuthTx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oTalepMuteahhit.close()
		},
		handlePressKapatMuteahhit: function (e) {
			this.byId("idTableMuteahhit").getBinding("items").filter([]);
			this.oTalepMuteahhit.close()
		},
		handleValueHelpUretimyeri: function (e) {
			this.selectedUretimyeri = e.getSource().getBindingContext("detailModel").getObject();
			this.selectedUretimYeriPath = e.getSource().getBindingContext("detailModel").getPath();
			if (!this.oUretimyeri) {
				this.oUretimyeri = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.UretimYeriSearchHelp", this);
				this.getView().addDependent(this.oUretimyeri)
			}
			var i = new t({
				TitleUretimyeri: "Üretim yeri arama yardımı",
				Werks: "",
				Name1: ""
			});
			this.oUretimyeri.setModel(i);
			this.byId("idTableUretimyeri").getBinding("items").filter([]);
			this.oUretimyeri.open()
		},
		onSubmitUretimyeri: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this.getView().getModel("detailModel");
			var r = jQuery.extend({}, e);
			var l = this;
			var n = e.getSource().getBindingContext("detailModel").getObject();
			var o = e.getSource().getBindingContext("detailModel").sPath;
			var d = "/WerksListSet('" + n.Werks + "')";
			if (n.Werks === "") {
				n.Werkstx = "";
				n.Werks = "";
				n.Price = 0;
				a.setProperty(o, n);
				a.refresh(true);
				this.internalUpdateItem(e.getSource().getBindingContext("detailModel").sPath, "WERKS");
				this.kalemToplamHesapla(n);
				return
			}
			t.setBusy(true);
			i.read(d, {
				success: function (e) {
					t.setBusy(false);
					n.Werks = e.Werks;
					n.Werkstx = e.Name1;
					a.setProperty(o, n);
					a.refresh(true);
					l.internalUpdateItem(o, "WERKS");
					l.kalemToplamHesapla(n)
				},
				error: function (e) {
					t.setBusy(false);
					n.Werks = "";
					n.Werkstx = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen Üretim yeri bulunamadı.")
				}
			})
		},
		handleSearchUretimyeri: function () {
			var e = this.oUretimyeri.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Werks) {
				i.push(new l("Werks", n.EQ, t.Werks))
			}
			if (t.Name1) {
				i.push(new l("Name1", n.EQ, t.Name1))
			}
			this.byId("idTableUretimyeri").getBinding("items").filter(i)
		},
		handleSelectedUretimyeri: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Werks");
			var l = r.getProperty("Name1");
			this.selectedUretimyeri.Werks = s;
			this.selectedUretimyeri.Werkstx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oUretimyeri.close();
			this.internalUpdateItem(this.selectedUretimYeriPath, "WERKS")
		},
		handlePressKapatUretimyeri: function (e) {
			this.byId("idTableUretimyeri").getBinding("items").filter([]);
			this.oUretimyeri.close()
		},
		handleValueHelpDepoyeri: function (e) {
			this.selectedDepoyeri = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oDepoyeri) {
				this.oDepoyeri = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.DepoYeriSearchHelp", this);
				this.getView().addDependent(this.oDepoyeri)
			}
			var i = new t({
				Title: "Depo yeri arama yardımı",
				Werks: "",
				Lgort: "",
				Lgobe: ""
			});
			this.oDepoyeri.setModel(i);
			this.byId("idTableDepoyeri").getBinding("items").filter([]);
			this.oDepoyeri.open()
		},
		onSubmitDepoyeri: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var l = "/LgortListSet('" + r.Lgort + "')";
			if (r.Lgort === "") {
				r.Lgorttx = "";
				return
			}
			t.setBusy(true);
			i.read(l, {
				success: function (e) {
					t.setBusy(false);
					r.Lgort = e.Lgort;
					r.Lgorttx = e.Lgobe;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					r.Lgort = "";
					r.Lgorttx = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen depo yeri bulunamadı.")
				}
			})
		},
		handleSearchDepoyeri: function () {
			var e = this.oDepoyeri.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Werks) {
				i.push(new l("Werks", n.EQ, t.Werks))
			}
			if (t.Lgort) {
				i.push(new l("Lgort", n.EQ, t.Lgort))
			}
			if (t.Lgobe) {
				i.push(new l("Lgobe", n.EQ, t.Lgobe))
			}
			this.byId("idTableDepoyeri").getBinding("items").filter(i)
		},
		handleSelectedDepoyeri: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Lgort");
			var l = r.getProperty("Lgobe");
			this.selectedDepoyeri.Lgort = s;
			this.selectedDepoyeri.Lgorttx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oDepoyeri.close()
		},
		handlePressKapatDepoyeri: function (e) {
			this.byId("idTableDepoyeri").getBinding("items").filter([]);
			this.oDepoyeri.close()
		},
		handleValueHelpParaBirimi: function (e) {
			this.selectedParabirimi = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oParaBirimi) {
				this.oParaBirimi = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.ParaBirimiSearchHelp", this);
				this.getView().addDependent(this.oParaBirimi)
			}
			var i = new t({
				Title: "Para birimi arama yardımı",
				Waers: "",
				Ltext: ""
			});
			this.oParaBirimi.setModel(i);
			this.byId("idTableParabirimi").getBinding("items").filter([]);
			this.oParaBirimi.open()
		},
		onSubmitParaBirimi: function (e, t) {
			var i = this.getView();
			var a = this.getOwnerComponent().getModel("odata_service");
			var r = this;
			var l = e.getSource().getBindingContext("detailModel").getObject();
			if (e == "") {
				var n = t
			} else {
				var n = l.Iwaer
			}
			var o = "/CurrencyListSet('" + n + "')";
			if (n === "") {
				l.Iwaertx = "";
				return
			}
			if (e.getSource) {
				this.kalemToplamHesapla(e)
			} else {
				this.kalemToplamHesapla(l)
			}
			i.setBusy(true);
			a.read(o, {
				success: function (e) {
					i.setBusy(false);
					l.Iwaer = e.Waers;
					l.Iwaertx = e.Ltext;
					i.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					i.setBusy(false);
					l.Iwaer = "";
					l.Iwaertx = "";
					i.getModel("detailModel").refresh(true);
					s.error("Girilen para birimi bulunamadı.")
				}
			})
		},
		handleSearchParaBirimi: function () {
			var e = this.oParaBirimi.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Waers) {
				i.push(new l("Waers", n.EQ, t.Waers))
			}
			if (t.Ltext) {
				i.push(new l("Ltext", n.EQ, t.Ltext))
			}
			this.byId("idTableParabirimi").getBinding("items").filter(i)
		},
		handleSelectedParaBirimi: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Waers");
			var l = r.getProperty("Ltext");
			this.selectedParabirimi.Iwaer = s;
			this.selectedParabirimi.Iwaertx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oParaBirimi.close()
		},
		handlePressKapatParaBirimi: function (e) {
			this.byId("idTableParabirimi").getBinding("items").filter([]);
			this.oParaBirimi.close()
		},
		handleValueHelpOlcuBirimi: function (e) {
			this.selectedOlcubirimi = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oOlcuBirimi) {
				this.oOlcuBirimi = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.OlcuBirimiSearchHelp", this);
				this.getView().addDependent(this.oOlcuBirimi)
			}
			var i = new t({
				Title: "Ölçü birimi arama yardımı",
				Msehi: "",
				Msehl: ""
			});
			this.oOlcuBirimi.setModel(i);
			this.byId("idTableOlcubirimi").getBinding("items").filter([]);
			this.oOlcuBirimi.open();
			this.handleSearchOlcuBirimi()
		},
		onSubmitOlcuBirimi: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var l = "/MeasureListSet('" + r.Meins + "')";
			if (r.Meins === "") {
				r.Meinstx = "";
				r.Meins = "";
				r.Meinstx = "";
				t.getModel("detailModel").refresh(true);
				return
			}
			t.setBusy(true);
			i.read(l, {
				success: function (e) {
					t.setBusy(false);
					r.Meins = e.Msehi;
					r.Meinstx = e.Msehl;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					r.Meins = "";
					r.Meinstx = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen Ölçü birimi bulunamadı.")
				}
			})
		},
		handleSearchOlcuBirimi: function () {
			var e = this.oOlcuBirimi.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Msehi) {
				i.push(new l("Msehi", n.EQ, t.Msehi))
			}
			if (t.Msehl) {
				i.push(new l("Msehl", n.EQ, t.Msehl))
			}
			this.byId("idTableOlcubirimi").getBinding("items").filter(i)
		},
		handleSelectedOlcuBirimi: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Msehi");
			var l = r.getProperty("Msehl");
			this.selectedOlcubirimi.Meins = s;
			this.selectedOlcubirimi.Meinstx = l;
			this.getView().getModel("detailModel").refresh(true);
			this.oOlcuBirimi.close()
		},
		handlePressKapatOlcuBirimi: function (e) {
			this.byId("idTableOlcubirimi").getBinding("items").filter([]);
			this.oOlcuBirimi.close()
		},
		handleValueHelpAnaHesap: function (e) {
			this.selectedAnaHesap = e.getSource().getBindingContext("detailModel").getObject();
			if (!this.oAnaHesap) {
				this.oAnaHesap = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.AnaHesapSearchHelp", this);
				this.getView().addDependent(this.oAnaHesap)
			}
			var i = new t({
				TitleAnaHesap: "Anahesap arama yardımı",
				Saknr: "",
				Txt20: ""
			});
			this.oAnaHesap.setModel(i);
			this.byId("idTableAnaHesaplar").getBinding("items").filter([]);
			this.oAnaHesap.open()
		},
		handleSearchAnaHesap: function () {
			var e = this.oAnaHesap.getModel();
			var t = e.getData();
			var i = [];
			i.push(new l("Filtered", n.EQ, true));
			if (t.Saknr) {
				i.push(new l("Saknr", n.EQ, t.Saknr))
			}
			if (t.Txt20) {
				i.push(new l("Txt20", n.EQ, t.Txt20))
			}
			this.byId("idTableAnaHesaplar").getBinding("items").filter(i)
		},
		handlePressKapatAnaHesap: function (e) {
			this.byId("idTableAnaHesaplar").getBinding("items").filter([]);
			this.oAnaHesap.close()
		},
		handleSelectedAnaHesap: function (e) {
			var t = e.getParameter("selectedItem");
			var i = this.getView();
			var a = this.getView().getModel("detailModel");
			if (!t) {
				t = e.getSource()
			}
			var r = t.getBindingContext("odata_service");
			var s = r.getProperty("Saknr");
			this.selectedAnaHesap.Saknr = s;
			this.getView().getModel("detailModel").refresh(true);
			this.oAnaHesap.close()
		},
		onSubmitAnaHesap: function (e) {
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this;
			var r = e.getSource().getBindingContext("detailModel").getObject();
			var l = "/AccountListSet('" + r.Saknr + "')";
			if (r.Saknr === "") {
				return
			}
			t.setBusy(true);
			i.read(l, {
				success: function (e) {
					t.setBusy(false);
					r.Saknr = e.Saknr;
					t.getModel("detailModel").refresh(true)
				},
				error: function (e) {
					t.setBusy(false);
					r.Saknr = "";
					t.getModel("detailModel").refresh(true);
					s.error("Girilen ana hesap bulunamadı.")
				}
			})
		},
		handlePressDegistir: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getData();
			var a = this.docCanChange(this);
			if (a === true) {
				if (i.headerData.editable === true) {
					i.headerData.editable = false
				} else {
					i.headerData.editable = true
				}
				t.refresh(true)
			} else {
				s.error("Onaya Gönderilen Belgeler Değiştirilemez.")
			}
		},
		openAttachmentDialog: function () {
			if (!this._attachmentDialog) {
				this._attachmentDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.Attachment", this);
				this.getView().addDependent(this._attachmentDialog)
			}
			var e = [{
				Valtext: "BELGE",
				Value: "BELGE"
			}];
			var i = new t;
			i.setData({
				Aciklama: "",
				EkTurleri: e,
				Ektyp: "BELGE"
			});
			this._attachmentDialog.setModel(i, "attachmentModel");
			this._attachmentDialog.open()
		},
		openExcelDialog: function () {
			if (!this._excelDialog) {
				this._excelDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.ExcelUpload", this);
				this.getView().addDependent(this._excelDialog)
			}
			var e = [{
				Valtext: "BELGE",
				Value: "BELGE"
			}];
			var i = new t;
			i.setData({
				Aciklama: "",
				EkTurleri: e,
				Ektyp: "BELGE"
			});
			this._excelDialog.setModel(i, "excelModel");
			this._excelDialog.open()
		},
		close_excelDialog: function () {
			this._excelDialog.close()
		},
		handleUploadPress: function (e) {
			var t = d.byId("fileUploader");
			var i = this._attachmentDialog.getModel("attachmentModel").getData().Aciklama;
			var a = this._attachmentDialog.getModel("attachmentModel").getData().Ektyp;
			var r = this.getOwnerComponent().getModel("odata_service");
			var l = this.getView();
			var n = l.getModel("detailModel");
			var o = n.getData();
			var g = o.headerData.Tmpid;
			this._attachmentDialog.setBusy(true);
			if (t.getValue() == "") {
				this._attachmentDialog.setBusy(false);
				s.error("Lütfen yüklenecek dosyayı seçiniz.")
			} else {
				t.setUploadUrl("/sap/opu/odata/sap/ZMM_SCP_SRV/FileUploadHeaderSet('" + g + "|" + i + "|" + a + "')/NavFile");
				r.refreshSecurityToken();
				t.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "x-csrf-token",
					value: r.getHeaders()["x-csrf-token"]
				}));
				t.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "slug",
					value: encodeURIComponent(t.getValue())
				}));
				t.upload()
			}
		},
		handleExcelUploadPress: function (e) {
			var t = d.byId("excelUploader");
			var i = this._excelDialog.getModel("excelModel").getData().Aciklama;
			var a = this._excelDialog.getModel("excelModel").getData().Ektyp;
			var r = this.getOwnerComponent().getModel("odata_service");
			var l = this.getView();
			var n = l.getModel("detailModel");
			var o = n.getData();
			var g = n.getData()["headerData"]["comboBelgeTipi"];
			var u = n.getData()["headerData"]["Tmpid"];
			var h = o.headerData.Tmpid;
			this._excelDialog.setBusy(true);
			if (t.getValue() == "") {
				this._excelDialog.setBusy(false);
				s.error("Lütfen yüklenecek dosyayı seçiniz.")
			} else {
				t.setUploadUrl("/sap/opu/odata/sap/ZMM_SCP_SRV/FileUploadHeaderSet('" + g + "|" + u + "')/NavExcel");
				r.refreshSecurityToken();
				t.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "x-csrf-token",
					value: r.getHeaders()["x-csrf-token"]
				}));
				t.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
					name: "slug",
					value: encodeURIComponent(t.getValue())
				}));
				t.upload()
			}
		},
		handleUploadComplete: function (e) {
			var t = this.getView();
			var i = d.byId("fileUploader");
			i.destroyHeaderParameters();
			i.setValue("");
			var a = t.getModel("detailModel");
			var r = a.getData();
			var l = e.getParameter("status");
			if (l !== 201) {
				s.error("Bir sorun oluştu. Lütfen sistem yöneticiniz ile iletişime geçiniz.")
			} else {
				var n = e.getParameter("responseRaw");
				var o = new DOMParser;
				var g = o.parseFromString(n, "text/xml");
				if (g.getElementsByTagName("d:ErrorText")[0].childNodes[0] !== undefined) {
					var u = g.getElementsByTagName("d:ErrorText")[0].childNodes[0].nodeValue
				} else {
					var u = ""
				}
				if (u !== "") {
					s.error(u)
				} else {
					s.success("Dosyanız başalarılı bir şekilde yüklenmiştir")
				}
				this._getFileList(r.headerData.Tmpid)
			}
			this._attachmentDialog.close();
			this._attachmentDialog.setBusy(false)
		},
		handleExcelUploadComplete: function (e) {
			var t = this.getView();
			var i = d.byId("excelUploader");
			i.destroyHeaderParameters();
			i.setValue("");
			var a = t.getModel("detailModel");
			var r = a.getData();
			var l = e.getParameter("status");
			if (l !== 201) {
				s.error("Bir sorun oluştu. Lütfen sistem yöneticiniz ile iletişime geçiniz.")
			} else {
				var n = e.getParameter("responseRaw");
				var o = new DOMParser;
				var g = o.parseFromString(n, "text/xml");
				if (g.getElementsByTagName("d:ErrorText")[0].childNodes[0] !== undefined) {
					var u = g.getElementsByTagName("d:ErrorText")[0].childNodes[0].nodeValue
				} else {
					var u = ""
				}
				if (u !== "") {
					s.error(u)
				} else {
					s.success("Dosyanız başalarılı bir şekilde yüklenmiştir")
				}
				this._getFileList(r.headerData.Tmpid);
				this.getDocumentDetail(r.headerData.Tmpid)
			}
			this._excelDialog.close();
			this._excelDialog.setBusy(false)
		},
		_getFileList: function (e) {
			var t = this;
			var i = this.getView();
			var a = this.getOwnerComponent().getModel("odata_service");
			var r = i.getModel("detailModel");
			var n = r.getData();
			a.read("/FileListSet", {
				filters: [new l("Scnum", sap.ui.model.FilterOperator.EQ, e)],
				success: function (e) {
					n.fileList = e.results;
					r.refresh(true)
				},
				error: function (e) {
					i.setBusy(false);
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.")
				}
			})
		},
		onPressFileDownlaod: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getObject();
			var i = this.getOwnerComponent().getModel("odata_service").sServiceUrl;
			var a = i + "/FileDownloadSet(" + "IvGuid='" + t.Tguid + "')/$value";
			parent.window.open(a, "_blank")
		},
		_closeAttachmentDialog: function (e) {
			this._attachmentDialog.close()
		},
		_closeExcelDialog: function (e) {
			this._excelDialog.close()
		},
		onFileNameExceed: function (e) {
			s.error("Dosya ismi maximum 256 karakter olabilir.");
			return
		},
		removeAttachment: function (e) {
			var t = this.getView();
			var i = this.getView().byId("idAttachmentTable");
			if (i.getSelectedItem() === null) {
				s.error("Lütfen silmek istediğiniz dosyayı seçiniz");
				return
			}
			var a = i.getSelectedItem().getBindingContext("detailModel").getObject();
			var r = this.getOwnerComponent().getModel("odata_service");
			var l = t.getModel("detailModel").getData().headerData.Tmpid;
			var n = {};
			var o = [];
			n.IvUname = "";
			var d = [];
			d.push({
				Message: ""
			});
			o.push({
				IvGuid: a.Tguid
			});
			n.NavGuid = o;
			n.NavReturn = d;
			var g = this;
			t.setBusy(true);
			r.create("/FileDeleteSet", n, {
				success: u,
				error: h
			});

			function u(e, i) {
				t.setBusy(false);
				if (e.NavReturn.results.length == 0) {
					g._getFileList(l);
					s.success("Dosyanız başarılı bir şekilde silinmiştir.")
				} else {
					var a = e.NavReturn.results;
					g.setMessageInitModel(g, a)
				}
			}

			function h(e) {
				s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				t.setBusy(false)
			}
		},
		getTempid: function () {
			var e = this;
			var t = this.getView();
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this.oDataView.headerData;
			sap.ui.core.BusyIndicator.show();
			var r = "/InitialDataSet(TmpidX=" + true + ")";
			i.read(r, {
				success: function (e) {
					o.hide();
					a.Tmpid = e.Tmpid
				},
				error: function (e) {
					o.hide();
					s.error("Tempid alınması sırasında bir sorun oluştu.Lütfen sistem yöneticiniz ile iletişime geçiniz.")
				}
			})
		},
		destroyHataListesi: function () {
			var e = this.getView().byId("idPanelErrorList");
			e.destroyContent();
			var t = this.byId("idPageSectionHatalar");
			t.setVisible(false)
		},
		onClickHome: function (e) {
			this.getView().setBusy(false);
			this.getOwnerComponent().getRouter().navTo("Menu")
		},
		onNavBack: function (e) {
			var t, a;
			t = i.getInstance();
			a = t.getPreviousHash();
			if (a !== undefined) {
				window.history.go(-1)
			} else {
				this.getOwnerComponent().getRouter().navTo("Menu")
			}
		},
		openErrorList: function (e) {
			var t = "";
			for (var i = 0; i < e.length; i++) {
				t += e[i].Message + "\n"
			}
			s.error(t)
		},
		openOnayNotuDialogOnay: function (e) {
			if (!this.oOnayNotuFragment) {
				this.oOnayNotuFragment = sap.ui.xmlfragment(this.getView().getId(), "com.tupras.zsrmscp.view.Dialogs.OnayNotu", this);
				this.getView().addDependent(this.oOnayNotuFragment)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			this.oOnayNotuFragment.setModel(i);
			this.byId("onayNotuForm").bindElement({
				path: t
			});
			this.oOnayNotuFragment.open()
		},
		handlePressCloseOnayNotu: function (e) {
			this.oOnayNotuFragment.close()
		},
		onValueChangeLifnr: function (e) {
			var t = e.getSource().getBindingPath("value");
			var i = e.getParameter("value");
			var a = this.getView().getModel("detailModel");
			a.setProperty("/baslikEkAlanlari/ZzLifnr", i);
			a.refresh()
		},
		onValueChangeInco: function (e) {
			var t = e.getSource().getBindingPath("value");
			var i = e.getParameter("value");
			var a = this.getView().getModel("detailModel");
			a.setProperty("/baslikEkAlanlari/ZzIncotrm", i);
			a.refresh()
		},
		kalemToplamHesapla: function (e, t, i) {
			if (e.getSource) {
				var a = e.getSource().getBindingContext("detailModel").getObject()
			} else {
				var a = e
			}
			var r = a.Menge;
			if (r == 0) {
				s.information("Miktar Alanı 0 Girildiğinde Tutar Hesaplaması Yapılamamaktadır.");
				var t = e.getSource().getBindingContext("detailModel").sPath + "/Menge";
				var l = e.getSource().getBindingContext("detailModel").sPath + "/Ittot";
				var n = 1;
				this.getView().getModel("detailModel").setProperty(t, n);
				this.getView().getModel("detailModel").refresh();
				r = 1
			}
			var o = a.Price;
			var d = a.PriceUnit;
			var g = a.Iwaer;
			var u = 0;
			u = r * o / d;
			u = this.formatCurrencyToCalculate(u);
			if (isNaN(u) === false && u !== Infinity && u != "") {
				a.Ittot = u;
				this.getView().getModel("detailModel").setProperty(l, u);
				this.getView().getModel("detailModel").refresh(true);
				this.setHeaderToplamFiyat(e, t)
			} else if (r == 0) {}
		},
		setHeaderToplamFiyat: function (e, t) {
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty("/malzemeBilgileri");
			var r = e;
			var l = this;
			var n = 0;
			var l = this;
			var d = this.getView();
			var g = this.getOwnerComponent().getModel("odata_service");
			var u = this.oDataView.headerData;
			var h = "";
			if (r && r.getSource) {
				h = r.getSource().getBindingContext("detailModel").sPath
			} else if (r && !r.getSource && t && t != "") {
				h = t
			}
			sap.ui.core.BusyIndicator.show();
			var m = "/ConvertCurrencySet";
			g.read(m, {
				success: function (e) {
					o.hide();
					var t = e.results;
					a.forEach(function (e, i) {
						var a = 0;
						if (e.Iwaer == "TRY") {
							a = e.Menge * e.Price / e.PriceUnit
						} else {
							t.forEach(function (t, i) {
								if (e.Iwaer == t.Ktext) {
									a = e.Menge * e.Price * t.Waers / e.PriceUnit
								}
							})
						}
						n = n + l.formatCurrencyToCalculate(a)
					});
					n = Math.round(n * 100) / 100;
					i.setProperty("/baslikBilgileri/Hdtot", n);
					i.setProperty("/baslikBilgileri/Hwaer", "TRY");
					i.refresh(true);
					if (h != "") {
						l.internalUpdateItem(h, "Price")
					}
				},
				error: function (e) {
					o.hide();
					s.error("Tempid alınması sırasında bir sorun oluştu.Lütfen sistem yöneticiniz ile iletişime geçiniz.")
				}
			})
		},
		formatCurrencyToService: function (e, t) {
			if (!e) {
				return "0"
			}
			return e.toString()
		},
		formatCurrencyToCalculate: function (e) {
			var t = parseFloat(e);
			return t
		},
		getApprovers: function () {
			var e = this.getView();
			var t = this.getOwnerComponent().getModel("odata_service");
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty("/baslikBilgileri/Scnum");
			if (a === "") {
				return
			}
			var r = [];
			r.push(new l("Scnum", n.EQ, a));
			var o = this;
			var d = "/ApproversSet";
			e.setBusy(true);
			t.read(d, {
				filters: r,
				success: function (t, a) {
					e.setBusy(false);
					i.setProperty("/onaycilar", t.results);
					i.refresh(true)
				},
				error: function (t) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					e.setBusy(false)
				}
			})
		},
		setDocumentNumber: function (e, t) {
			e.setHeaderData(e, t);
			e.setItemData(e, t);
			e.setAccountData(e, t);
			e.setNoteData(e, t)
		},
		setHeaderData: function (e, t) {
			var i = e.getView().getModel("detailModel");
			i.setProperty("/baslikBilgileri/Scnum", t);
			i.refresh()
		},
		setItemData: function (e, t) {
			var i = e.getView().getModel("detailModel");
			var a = i.getProperty("/malzemeBilgileri");
			var r = a.map(function (e) {
				var i = {};
				i = e;
				i["Scnum"] = t;
				return i
			});
			i.setProperty("/malzemeBilgileri", r);
			i.refresh()
		},
		setAccountData: function (e, t) {
			var i = e.getView().getModel("detailModel");
			var a = i.getProperty("/hesapTayiniBilgileri");
			var r = a.map(function (e) {
				var i = {};
				i = e;
				i["Scnum"] = t;
				return i
			});
			i.setProperty("/hesapTayiniBilgileri", r);
			i.refresh()
		},
		setNoteData: function (e, t) {
			var i = e.getView().getModel("detailModel");
			var a = i.getProperty("/kalemNotlari");
			var r = a.map(function (e) {
				var i = {};
				i = e;
				i["Scnum"] = t;
				return i
			});
			i.setProperty("/kalemNotlari", r);
			i.refresh()
		},
		getHeaderToService: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getData();
			let a = [];
			if (!e) {
				e = ""
			}
			a.push({
				Dokod: i.headerData.belgeTipi,
				Dstat: e,
				Tmpid: i.headerData.Tmpid,
				Scnum: i.baslikBilgileri.Scnum,
				ZzSecalm: i.baslikEkAlanlari.ZzSecalm,
				ZzSecndn: i.baslikEkAlanlari.ZzSecndn,
				ZzAltur: i.baslikEkAlanlari.ZzAltur,
				ZzBwart: i.baslikEkAlanlari.ZzBwart,
				FieldWerks: i.baslikEkAlanlari.FieldWerks,
				FieldLgort: i.baslikEkAlanlari.FieldLgort,
				Hdtot: this.formatCurrencyToService(i.baslikBilgileri.Hdtot, ""),
				ZzTlpedn: i.baslikEkAlanlari.ZzTlpedn,
				ZzTlpedntext: i.baslikEkAlanlari.ZzTlpedntext,
				ZzTlpmdr: i.baslikEkAlanlari.ZzTlpmdr,
				ZzTlpmdrtext: i.baslikEkAlanlari.ZzTlpmdrtext,
				ZzKulyer: i.baslikEkAlanlari.ZzKulyer,
				ZzMuthno: i.baslikEkAlanlari.ZzMuthno,
				ZzIncotrm: i.baslikEkAlanlari.ZzIncotrm,
				ZzIncopla: i.baslikEkAlanlari.ZzIncopla,
				ZzLifnr: i.baslikEkAlanlari.ZzLifnr,
				ZzCevreb: i.baslikEkAlanlari.ZzCevreb,
				ZzBwart: i.baslikEkAlanlari.ZzBwart,
				Btext: i.baslikEkAlanlari.Btext,
				HeaderNote: i.baslikBilgileri.HeaderNote,
				BackendDoc: i.baslikBilgileri.BackendDoc
			});
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Btext", i.baslikEkAlanlari.Btext);
			r.setProperty("/SmartfieldSet('')/Zzbwart", i.baslikEkAlanlari.ZzBwart);
			r.setProperty("/SmartfieldSet('')/FieldWerks", i.baslikEkAlanlari.FieldWerks);
			r.setProperty("/SmartfieldSet('')/FieldLgort", i.baslikEkAlanlari.FieldLgort);
			return a
		},
		getItemToService: function () {
			var e = g.getDateInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});
			var t = this.getView().getModel("detailModel");
			var i = t.getData();
			let a = [];
			for (var r = 0; r < i.malzemeBilgileri.length; r++) {
				var s = i.malzemeBilgileri[r].Menge * i.malzemeBilgileri[r].Price / i.malzemeBilgileri[r].PriceUnit;
				a.push({
					Eeind: i.malzemeBilgileri[r].Eeind != null ? e.format(i.malzemeBilgileri[r].Eeind) : null,
					Scnum: i.malzemeBilgileri[r].Scnum,
					Updkz: i.malzemeBilgileri[r].Updkz,
					Itmno: i.malzemeBilgileri[r].Itmno,
					Scvrs: i.malzemeBilgileri[r].Scvrs,
					Matkl: i.malzemeBilgileri[r].Matkl,
					Matkltx: i.malzemeBilgileri[r].Matkltx,
					Prodi: i.malzemeBilgileri[r].Prodi,
					Prodtx: i.malzemeBilgileri[r].Prodtx,
					Menge: i.malzemeBilgileri[r].Menge.toString(),
					Werks: i.malzemeBilgileri[r].Werks,
					Werkstx: i.malzemeBilgileri[r].Werkstx,
					Meins: i.malzemeBilgileri[r].Meins,
					Meinstx: i.malzemeBilgileri[r].Meinstx,
					Lgort: i.malzemeBilgileri[r].Lgort,
					Lifnr: i.malzemeBilgileri[r].Lifnr,
					PriceUnit: i.malzemeBilgileri[r].PriceUnit.toString(),
					Price: i.malzemeBilgileri[r].Price.toString(),
					Ekgrp: i.malzemeBilgileri[r].Ekgrp,
					ZzTesdrm: i.malzemeBilgileri[r].ZzTesdrm,
					ZzTesbel: i.malzemeBilgileri[r].ZzTesbel,
					ZzTesino: i.malzemeBilgileri[r].ZzTesino,
					ZzTesyid: i.malzemeBilgileri[r].ZzTesyid,
					Ittot: s.toString(),
					Iwaer: i.malzemeBilgileri[r].Iwaer,
					Ekorg: i.malzemeBilgileri[r].Ekorg,
					Taxbr: i.malzemeBilgileri[r].Taxbr,
					Taxtu: i.malzemeBilgileri[r].Taxtu.toString(),
					Banfn: i.malzemeBilgileri[r].Banfn,
					Bnfpo: i.malzemeBilgileri[r].Bnfpo,
					Ebeln: i.malzemeBilgileri[r].Ebeln,
					ExternalSystem: i.malzemeBilgileri[r].ExternalSystem,
					ExternalSystemMaterialNo: i.malzemeBilgileri[r].ExternalSystemMaterialNo,
					Hizmet: i.malzemeBilgileri[r].Hizmet
				})
			}
			return a
		},
		getAccountItemsToService: function () {
			var e = this.getView().getModel("detailModel");
			var t = e.getData();
			let i = [];
			for (var a = 0; a < t.hesapTayiniBilgileri.length; a++) {
				i.push({
					Acino: t.hesapTayiniBilgileri[a].Acino,
					Aufnr: t.hesapTayiniBilgileri[a].Aufnr,
					Scnum: t.hesapTayiniBilgileri[a].Scnum,
					Itmno: t.hesapTayiniBilgileri[a].Itmno,
					Pypno: t.hesapTayiniBilgileri[a].Pypno,
					Scvrs: t.hesapTayiniBilgileri[a].Scvrs,
					Hstyp: t.hesapTayiniBilgileri[a].Hstyp,
					Kostl: t.hesapTayiniBilgileri[a].Kostl,
					Kokrs: t.hesapTayiniBilgileri[a].Kokrs,
					Saknr: t.hesapTayiniBilgileri[a].Saknr,
					Gsber: t.hesapTayiniBilgileri[a].Gsber
				})
			}
			return i
		},
		getNoteToService: function () {
			var e = this.getView().getModel("detailModel");
			var t = e.getProperty("/baslikBilgileri/Scnum");
			var i = e.getProperty("/baslikBilgileri/Scvrs");
			var a = e.getProperty("/kalemNotlari");
			let r = [];
			a.forEach(function (e, a) {
				r.push({
					Scnum: t,
					Scvrs: i,
					Itmno: e.Itmno,
					Seqnr: "",
					Notur: e.Notur,
					Noturtx: e.Noturtx,
					Descr: e.Descr
				})
			});
			return r
		},
		getApproversToService: function () {
			var e = this.getView().getModel("detailModel");
			var t = e.getProperty("/baslikBilgileri/Scnum");
			var i = e.getProperty("/baslikBilgileri/Scvrs");
			var a = e.getProperty("/onaycilar");
			let r = [];
			if (a && a.length != 0) {
				a.forEach(function (e, i) {
					r.push({
						Agent: e.Agent,
						ApprType: e.ApprType,
						ApprTypeText: e.ApprTypeText,
						Branch: e.Branch,
						Oname: e.Oname,
						Seqnr: e.Seqnr,
						Scnum: t
					})
				})
			}
			return r
		},
		materialDialogOpen: function (e) {
			if (!this._oMaterialDialog) {
				this._oMaterialDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.MaterialShDialog", this);
				this._oMaterialDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oMaterialDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oMaterialDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			this.prodiShFromDokod(this);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Matkl", a.Matkl);
			r.setProperty("/SmartfieldSet('')/Prodi", a.Prodi);
			r.setProperty("/SmartfieldSet('')/Prodit", a.Prodi);
			if (a.Prodi && a.Prodi != "") {
				r.setProperty("/SmartfieldSet('')/Prodtx", a.Prodtx)
			} else {
				r.setProperty("/SmartfieldSet('')/Prodtx", "")
			}
			r.refresh();
			this._oMaterialDialog.open()
		},
		prodiShFromDokod: function (e) {
			var t = e.getView().getModel("detailModel");
			var i = t.getData()["headerData"]["belgeTipi"];
			if (i == "DT_16_40_1") {
				t.setProperty("/VisibleProdiTSh", true)
			} else {
				t.setProperty("/VisibleProdiTSh", false)
			}
			t.refresh()
		},
		handlePressMaterialDialogClose: function () {
			this._oMaterialDialog.close()
		},
		onValueChangeMaterialSh: function (e) {},
		handlePressMaterialDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Prodi";
			var r = i + "/Prodtx";
			var s = i + "/Matkl";
			var l = i + "/Matkltx";
			var n = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Prodit"];
			var o = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Prodi"];
			var d = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Prodtx"];
			var g = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Matkl"];
			var u = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Matkltx"];
			if (n != "" && (o == "" || !o)) {
				o = n
			}
			t.setProperty(s, g);
			t.setProperty(a, o);
			t.setProperty(r, d);
			t.setProperty(l, u);
			t.refresh();
			this.handlePressMaterialDialogClose();
			this.internalUpdateItem(i, "PRODI")
		},
		approverDialogOpen: function (e) {
			if (!this._oApproverDialog) {
				this._oApproverDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.ApproverShDialog", this);
				this._oApproverDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oApproverDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oApproverDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Uname", "");
			r.refresh();
			this._oApproverDialog.open()
		},
		handlePressApproverDialogClose: function () {
			this._oApproverDialog.close()
		},
		handlePressApproverDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Agent";
			var r = i + "/Oname";
			var s = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["NameText"];
			var l = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Uname"];
			t.setProperty(a, l);
			t.setProperty(r, s);
			t.refresh();
			this.handlePressApproverDialogClose()
		},
		handleSubmitApproverSh: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = t.split("/")[2];
			var r = i.getData()["onaycilar"][a];
			var s = r["Agent"];
			var n = this.getOwnerComponent().getModel("odata_service");
			sap.ui.core.BusyIndicator.show();
			n.read("/ApproversFromFioriSet", {
				filters: [new l("Bname", sap.ui.model.FilterOperator.EQ, s)],
				success: function (e, t) {
					if (e.results && e.results.length != 0) {
						r["Oname"] = e.results[0]["NameText"];
						i.refresh()
					}
					sap.ui.core.BusyIndicator.hide()
				},
				error: function (e, t) {
					sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					sap.ui.core.BusyIndicator.hide()
				}
			})
		},
		aufnrDialogOpen: function (e) {
			if (!this._oAufnrDialog) {
				this._oAufnrDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.AufnrShDialog", this);
				this._oAufnrDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oAufnrDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oAufnrDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Aufnr", "");
			r.refresh();
			this._oAufnrDialog.open()
		},
		handlePressAufnrDialogClose: function () {
			this._oAufnrDialog.close()
		},
		handlePressAufnrDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Aufnr";
			var r = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Aufnr"];
			t.setProperty(a, r);
			t.refresh();
			this.handlePressAufnrDialogClose()
		},
		saknrDiyalogOpen: function (e) {
			if (!this._oSaknrDialog) {
				this._oSaknrDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.SaknrShDialog", this);
				this._oSaknrDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oSaknrDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSaknrDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Saknr", "");
			r.refresh();
			this._oSaknrDialog.open()
		},
		handlePressSaknrDialogClose: function () {
			this._oSaknrDialog.close()
		},
		handlePressSaknrDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Saknr";
			var r = i.split("/")[2];
			var s = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Saknr"];
			t.setProperty(a, s);
			t.refresh();
			this.handlePressSaknrDialogClose()
		},
		iwaerDiyalogOpen: function (e) {
			if (!this._oIwaerDialog) {
				this._oIwaerDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.IwaerShDialog", this);
				this._oIwaerDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oIwaerDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oIwaerDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Iwaer", "");
			r.refresh();
			this._oIwaerDialog.open()
		},
		handlePressIwaerDialogClose: function () {
			this._oIwaerDialog.close()
		},
		handlePressIwaerDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Iwaer";
			var r = i + "/Iwaertx";
			var l = i.split("/")[2];
			var n = this.getOwnerComponent().getModel("odata_service");
			var o = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Iwaer"];
			var d = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Iwaertx"];
			t.setProperty(a, o);
			t.setProperty(r, d);
			if (!d && o) {
				var g = "/CurrencyListSet('" + o + "')";
				var u = this.getView();
				u.setBusy(true);
				n.read(g, {
					success: function (e) {
						u.setBusy(false);
						t.setProperty(r, e.Ltext);
						t.refresh
					},
					error: function (e) {
						u.setBusy(false);
						s.error("Girilen para birimi bulunamadı.")
					}
				})
			}
			t.refresh();
			var h = t.getProperty(i);
			this.kalemToplamHesapla(h);
			this.handlePressIwaerDialogClose()
		},
		meinsDiyalogOpen: function (e) {
			if (!this._oMeinsDialog) {
				this._oMeinsDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.MeinsShDialog", this);
				this._oMeinsDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oMeinsDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oMeinsDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Meins", "");
			r.refresh();
			this._oMeinsDialog.open()
		},
		handlePressMeinsDialogClose: function () {
			this._oMeinsDialog.close()
		},
		handlePressMeinsDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Meins";
			var r = i.split("/")[2];
			var s = i + "/Meinstx";
			var l = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Meins"];
			var n = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Msehl"];
			t.setProperty(a, l);
			t.setProperty(s, n);
			t.refresh();
			this.handlePressMeinsDialogClose()
		},
		lgortDiyalogOpen: function (e) {
			if (!this._oLgortDialog) {
				this._oLgortDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.LgortShDialog", this);
				this._oLgortDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oLgortDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oLgortDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			var s = e.getSource().getParent().getBindingContext("detailModel").getPath().split("/")[2];
			var l = this.getView().getModel("detailModel").getData()["malzemeBilgileri"][s]["Werks"];
			r.setProperty("/SmartfieldSet('')/Werks", l);
			r.setProperty("/SmartfieldSet('')/Lgort", "");
			r.refresh();
			this._oLgortDialog.open()
		},
		handlePressLgortDialogClose: function () {
			this._oLgortDialog.close()
		},
		handlePressLgortDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Lgort";
			var r = i.split("/")[2];
			var s = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Lgort"];
			t.setProperty(a, s);
			t.refresh();
			this.handlePressLgortDialogClose()
		},
		werksDiyalogOpen: function (e) {
			if (!this._oWerksDialog) {
				this._oWerksDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.WerksShDialog", this);
				this._oWerksDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oWerksDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oWerksDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			i.setProperty("/shPath", t);
			i.refresh();
			var r = this.getView().getModel();
			r.setProperty("/SmartfieldSet('')/Werks", "");
			r.refresh();
			this._oWerksDialog.open()
		},
		handlePressWerksDialogClose: function () {
			this._oWerksDialog.close()
		},
		handlePressWerksDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Werks";
			var r = i.split("/")[2];
			var s = i + "/Werkstx";
			var l = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Werks"];
			var n = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["WerksDesc"];
			t.setProperty(a, l);
			t.setProperty(s, n);
			t.refresh();
			this.internalUpdateItem(i, "WERKS");
			this.handlePressWerksDialogClose();
			this.kalemToplamHesapla(t.getProperty(i))
		},
		onInnerControlsCreated: function (e) {
			if (e.getParameters()[0].setValueHelpOnly) {
				e.getParameters()[0].setValueHelpOnly(true)
			}
		},
		matklDiyalogOpen: function (e) {
			if (!this._oMatklDialog) {
				this._oMatklDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.MatklShDialog", this);
				this._oMatklDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oMatklDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oMatklDialog)
			}
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = i.getProperty(t);
			var r = i.getProperty(t + "/Hizmet");
			i.setProperty("/shPath", t);
			i.refresh();
			var s = this.getView().getModel();
			s.setProperty("/SmartfieldSet('')/Dokod", this.type);
			s.setProperty("/SmartfieldSet('')/Matkl", "");
			if (r && r != "" && r != false) {
				s.setProperty("/SmartfieldSet('')/Hizmet", "true")
			}
			s.refresh();
			this._oMatklDialog.open()
		},
		handlePressMatklDialogClose: function () {
			this._oMatklDialog.close()
		},
		handlePressMatklDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Matkl";
			var r = i.split("/")[2];
			var s = i + "/Matkltx";
			var l = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Matkl"];
			var n = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Matkltx"];
			t.setProperty(s, n);
			t.setProperty(a, l);
			t.refresh();
			this.handlePressMatklDialogClose()
		},
		pypDialogOpen: function (e) {
			if (!this._oPypDialog) {
				this._oPypDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.PypShDialog", this);
				this._oPypDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oPypDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oPypDialog)
			}
			var t = e.getSource().getParent().getBindingContext("detailModel").getPath().split("/")[2];
			var i = this.getView().getModel("detailModel").getData()["malzemeBilgileri"][t]["Werks"];
			var a = this.getView().getModel();
			a.setProperty("/SmartfieldSet('')/Werks", i);
			var r = e.getSource().getBindingContext("detailModel").getPath();
			var s = this.getView().getModel("detailModel");
			var l = s.getProperty(r);
			s.setProperty("/shPath", r);
			s.refresh();
			var a = this.getView().getModel();
			a.setProperty("/SmartfieldSet('')/Pyp", "");
			a.setProperty("/SmartfieldSet('')/Dokod", this.type);
			a.refresh();
			this._oPypDialog.open()
		},
		handlePressPypDialogClose: function () {
			this._oPypDialog.close()
		},
		handlePressPypDialogAdd: function (e) {
			debugger;

			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Pypno";
			var r = i + "/Saknr";
			var s = i + "/Gsber";
			var l = i.split("/")[2];
			var n = t.getData()["malzemeBilgileri"][l];
			var o = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Pyp"];
			var d = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["ZpsTbeln"];
			t.setProperty(a, o);
			if (d && d != "") {
				n["ZzTesdrm"] = "TEVAR"
			} else {
				n["ZzTesdrm"] = "TEYOK"
			}
			/*	if (o.charAt(0) == "D") {
					t.setProperty(r, "8888888888");
					if (o.charAt(1) == "2") {
						t.setProperty(s, "1002")
					} else if (o.charAt(1) == "7") {
						t.setProperty(s, "1007")
					}
				} else if (o.charAt(0) == "P") {
					t.setProperty(r, "8258000001");
					if (o.charAt(1) == "2") {
						t.setProperty(s, "1002")
					} else if (o.charAt(1) == "7") {
						t.setProperty(s, "1007")
					}
				}*/
			t.refresh();
			this.internalUpdateItem(i);
			this.handlePressPypDialogClose()
		},
		kostlDialogOpen: function (e) {
			if (!this._oKostlDialog) {
				this._oKostlDialog = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.KostlShDialog", this);
				this._oKostlDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this._oKostlDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oKostlDialog)
			}
			var t = e.getSource().getParent().getBindingContext("detailModel").getPath().split("/")[2];
			var i = this.getView().getModel("detailModel").getData()["malzemeBilgileri"][t]["Werks"];
			var a = this.getView().getModel();
			a.setProperty("/SmartfieldSet('')/Werks", i);
			var r = e.getSource().getBindingContext("detailModel").getPath();
			var s = this.getView().getModel("detailModel");
			var l = s.getProperty(r);
			s.setProperty("/shPath", r);
			s.refresh();
			var a = this.getView().getModel();
			a.setProperty("/SmartfieldSet('')/Kostl", "");
			a.refresh();
			this._oKostlDialog.open()
		},
		handlePressKostlDialogClose: function () {
			this._oKostlDialog.close()
		},
		handlePressKostlDialogAdd: function (e) {
			var t = this.getView().getModel("detailModel");
			var i = t.getProperty("/shPath");
			var a = i + "/Kostl";
			var r = i + "/Gsber";
			var s = i.split("/")[2];
			var l = t.getData()["malzemeBilgileri"][s];
			var n = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Gsber"];
			var o = this.getView().getElementBinding().getModel().getPendingChanges("SmartfieldSet")["SmartfieldSet('')"]["Kostl"];
			t.setProperty(a, o);
			t.setProperty(r, n);
			t.refresh();
			this.handlePressKostlDialogClose()
		},
		handleSubmitAufnrSh: function (e) {},
		openOnayNotuDialog: function (e) {
			if (!this._oRejectFragment) {
				this._oRejectFragment = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.IptalNotu", this);
				this.getView().addDependent(this._oRejectFragment)
			}
			var t = this.getView().getModel("detailModel");
			this._oRejectFragment.setModel(t);
			this._oRejectFragment.open()
		},
		closeOnayNotuDialog: function (e) {
			this._oRejectFragment.close()
		},
		handlePressSendNote: function () {
			var e = this;
			var t = {};
			var i = this.getOwnerComponent().getModel("odata_service");
			var a = this.getView();
			var r = this.getView().getModel("detailModel");
			a.setBusy(true);
			t["Scnum"] = r.getProperty("/baslikBilgileri/Scnum");
			t["CancelNote"] = r.getProperty("/rejectNote");
			var l = r.getProperty("/baslikBilgileri/Scnum");
			i.create("/RejectSet", t, {
				success: function (t) {
					s.success("Belge başarıyla iptal edildi");
					a.setBusy(false);
					e.closeOnayNotuDialog("");
					e.getDocumentDetail(l)
				},
				error: function (t) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					a.setBusy(false);
					e.closeOnayNotuDialog("");
					this.getDocumentDetail(l)
				}
			})
		},
		onMessagePopoverPress: function (e) {
			this._getMessagePopover(this).openBy(e.getSource())
		},
		setMessagePopover: function (e) {
			var t = sap.ui.getCore().getMessageManager();
			this.getView().setModel(t.getMessageModel(), "message");
			t.registerObject(this.getView(), true)
		},
		_getMessagePopover: function (e) {
			if (!e._oMessagePopover) {
				e._oMessagePopover = sap.ui.xmlfragment("com.tupras.zsrmscp.view.Dialogs.messagePopover", this);
				e.getView().addDependent(e._oMessagePopover)
			}
			return e._oMessagePopover
		},
		openMessagePopover: function (e) {
			e._getMessagePopover(e).openBy(e.getView().byId("btnMPopover"))
		},
		setMessageInitModel: function (e, t) {
			var i = [];
			t.forEach(function (e, t) {
				var a = "";
				if (e.Type === "S") {
					a = sap.ui.core.MessageType.Success
				} else if (e.Type === "I") {
					a = sap.ui.core.MessageType.Information
				} else if (e.Type === "W") {
					a = sap.ui.core.MessageType.Warning
				} else if (e.Type === "E") {
					a = sap.ui.core.MessageType.Error
				}
				var r = new sap.ui.core.message.Message({
					message: e["Message"],
					persistent: true,
					type: a
				});
				i.push(r)
			});
			sap.ui.getCore().getMessageManager().getMessageModel("message").setData(i);
			e.getView().getModel().setProperty("/visibleMessages", true);
			e.openMessagePopover(e)
		},
		docCanChange: function (e) {
			var t = e.getView().getModel("detailModel");
			var i = t.getData();
			if (i["baslikBilgileri"]["Dstat"] && i["baslikBilgileri"]["Dstat"] == "OGN") {
				return false
			} else {
				return true
			}
		},
		setSmartFieldValues: function (e) {
			var t = e.getView().getModel("detailModel");
			var i = e.getView().getModel();
			var a = t.getProperty("/baslikEkAlanlari");
			e.getView().getElementBinding().getModel()["mChangedEntities"]["SmartfieldSet('')"] = {};
			if (a.ZzBwart != "") {
				i.setProperty("/SmartfieldSet('')/Zzbwart", a.ZzBwart)
			}
			if (a.FieldWerks != "") {
				i.setProperty("/SmartfieldSet('')/FieldWerks", a.FieldWerks)
			}
			if (a.FieldLgort != "") {
				i.setProperty("/SmartfieldSet('')/FieldLgort", a.FieldLgort)
			}
			if (a.ZzIncotrm != "") {
				i.setProperty("/SmartfieldSet('')/ZzIncotrm", a.ZzIncotrm)
			}
			if (a.ZzLifnr != "") {
				i.setProperty("/SmartfieldSet('')/ZzLifnr", a.ZzLifnr)
			}
			i.setProperty("/SmartfieldSet('')/Dokod", e.type);
			e.getView().getElementBinding().getModel().refresh();
			i.refresh();
			t.refresh()
		},
		downloadExcel: function () {
			return new Promise(e => {
				var t = this.getOwnerComponent().getModel();
				var i = this.getView().getModel("detailModel").getData();
				var a = this.getView();
				var r = this;
				var l = "";
				var n = {};
				var o = [];
				var d = [];
				var g = [];
				var u = [];
				n.IvType = l;
				var h = [];
				h.push({
					Message: ""
				});
				d = this.getHeaderToService("SPT");
				o = this.getItemToService();
				g = this.getAccountItemsToService();
				u = this.getNoteToService();
				n.NavHeader = d;
				n.NavItem = o;
				n.NavAccount = g;
				n.NavReturn = h;
				n.NavNote = u;
				var r = this;
				a.setBusy(true);
				t.create("/ExcelUploadSet", n, {
					success: m,
					error: p
				});

				function m(e, t) {
					a.setBusy(false);
					var i = r.getOwnerComponent().getModel("odata_service").sServiceUrl;
					var s = i + "/ExcelDownloadSet(" + "IvGuid='" + e.IvType + "')/$value";
					parent.window.open(s, "_blank")
				}

				function p(t) {
					s.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
					e(false)
				}
			})
		},
		handleUpperApprover: function (e) {
			const t = this.getView().getModel("i18n").getResourceBundle();
			var i = t.getText("ManuelOnaycı");
			var a = this.byId("idOnayciTable").getSelectedContextPaths()[0];
			if (a && a != "") {} else {
				s.error("Lütfen Satır seçiniz.");
				return
			}
			var r = this.getView().getModel("detailModel");
			var l = r.getData()["onaycilar"];
			var n = this.getView().getModel("detailModel").getProperty(a);
			var o = n.Seqnr;
			var d = o - 1;
			var g = false;
			l.forEach(function (e, t) {
				if (e.Seqnr == d) {
					g = true;
					return
				}
			});
			if (g == true) {
				s.error("Eklemeye çalıştığınız Onay Adımı Daha önceden Eklenmiş.");
				return
			}
			var u = jQuery.extend(true, {}, n);
			u.Agent = "";
			u.ApprType = "";
			u.ApprTypeText = i;
			u.Branch = "";
			u.Oname = "";
			u.AdhocInd = true;
			u.Seqnr = "" + d;
			l.push(u);
			l.sort(function (e, t) {
				return e.Seqnr - t.Seqnr
			});
			r.refresh()
		},
		handleLowerApprover: function (e) {
			const t = this.getView().getModel("i18n").getResourceBundle();
			var i = t.getText("ManuelOnaycı");
			var a = this.byId("idOnayciTable").getSelectedContextPaths()[0];
			if (a && a != "") {} else {
				return
			}
			var r = this.getView().getModel("detailModel");
			var s = r.getData()["onaycilar"];
			var l = this.getView().getModel("detailModel").getProperty(a);
			var n = parseInt(l.Seqnr);
			var o = n + 1;
			var d = false;
			s.forEach(function (e, t) {
				if (e.Seqnr == o) {
					d = true;
					return
				}
			});
			if (d == true) {
				return
			}
			var g = jQuery.extend(true, {}, l);
			g.Agent = "";
			g.ApprType = "";
			g.ApprTypeText = i;
			g.Branch = "";
			g.Oname = "";
			g.Seqnr = "" + o;
			g.AdhocInd = true;
			s.push(g);
			s.sort(function (e, t) {
				return e.Seqnr - t.Seqnr
			});
			r.refresh()
		},
		handleDeleteApprover: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = this.getView().getModel("detailModel");
			var a = t.split("/")[2];
			var r = i.getData()["onaycilar"];
			r.splice(a, 1);
			i.refresh()
		},
		handlePressHizmetten: function () {
			var e = this.getView().getModel("detailModel");
			var t = e.getData()["malzemeBilgileri"];
			var i = e.getData()["hesapTayiniBilgileri"];
			var a = this.getView().getModel("detailModel").getData().malzemeBilgileri;
			var r = this.getView().getModel("detailModel").getData().hesapTayiniBilgileri;
			var s = this.getView().getModel("detailModel").getData().headerData.belgeTipi;
			var l = this.getView().getModel("subMenuModel").getData();
			var n = this.getView().getModel("detailModel").getData().baslikBilgileri.Scnum;
			var o = null;
			var d = jQuery.extend(true, {}, i[i.length - 1]);
			this.internalUpdateKalemEkle({}, a, r, true);
			e.refresh()
		},
		teslimatChange: function (e) {
			var t = e.getSource().getDateValue();
			var i = new Date;
			if (i - t - 864e5 > 0) {
				var a = e.getSource().getBindingContext("detailModel").getPath() + "/Eeind";
				this.getView().getModel("detailModel").setProperty(a, null);
				s.error("Geçmişe Yönelik Bir Tarih Girilemez!")
			}
		},
		changeHesapTayini: function (e) {
			var t = e.getSource().getBindingContext("detailModel").getPath();
			var i = t.split("/")[2];
			var a = t + "/Hstyp";
			var r = t + "/Saknr";
			var l = t + "/Pypno";
			var n = this.getView().getModel("detailModel");
			var o = n.getData()["malzemeBilgileri"][i];
			var d = e.getSource().getSelectedKey();
			if (this.type == "DT_16_30_2" && d == "2") {
				n.setProperty(r, "8888888888");
				n.setProperty(l, "")
			} else if (this.type == "DT_16_30_2") {
				n.setProperty(r, "8258000000")
			}
			if (o["Hizmet"] == true) {
				if (d == "2" || d == "5" || d == "6" || d == "7") {} else {
					s.error("Seçilen Hesap Tayini Hizmet Kaleminde Kullanılamaz!");
					n.setProperty(a, "");
					n.refresh()
				}
			}
		}
	})
});
//# sourceMappingURL=Detail.controller.js.map