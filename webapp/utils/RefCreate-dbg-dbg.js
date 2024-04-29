sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
], function (
    ManagedObject,
    BusyIndicator,
    MessageBox
) {
    "use strict";

    return ManagedObject.extend("com.tupras.zsrmscp.utils.RefCreate", {



        createRef: function (oEvent, that) {
            var selectedIndex = oEvent.getSource().getParent().getParent().getTable().getSelectedIndex();
            var selectedItem = oEvent.getSource().getParent().getParent().getTable().getContextByIndex(selectedIndex).getPath().substring(12, 22)

            var oDataModel = that.getOwnerComponent().getModel();

            // var aFilters = [];
            // aFilters.push(new Filter("Scnum", FilterOperator.EQ, selectedItem));
            if (selectedItem != "") {
                BusyIndicator.show();
                var uriSet = "/ReferanceCreateSet('" + selectedItem + "')";

                oDataModel.read(uriSet, {
                    async: true,
                    success: function (oData, oResponse) {

                        
                        that._refCreate.toRequest(that, oData.Scnum);
                        BusyIndicator.hide();

                    },
                    error: function (oError) {
                        BusyIndicator.hide();

                    }
                });
            }


        },
        deleteRef: function (oEvent, that) {
            
            var table = oEvent.getSource().getParent().getParent().getTable();
            var selectedIndex = table.getSelectedIndex();
            var selectedPath = table.getContextByIndex(selectedIndex).getPath();

            var selectedItem = selectedPath.substring(12, 22)
            var statu = table.getModel().getProperty(selectedPath)["Dstat"];
            if (statu == "TSL") {
                var oDataModel = that.getOwnerComponent().getModel();

                // var aFilters = [];
                // aFilters.push(new Filter("Scnum", FilterOperator.EQ, selectedItem));
                if (selectedItem != "") {
                    BusyIndicator.show();
                    var uriSet = "/DeleteRefSet('" + selectedItem + "')";

                    oDataModel.read(uriSet, {
                        async: true,
                        success: function (oData, oResponse) {

                            
                            MessageBox.success("Belge Silindi.");
                            that.getView().getModel().refresh();
                            BusyIndicator.hide();

                        },
                        error: function (oError) {
                            BusyIndicator.hide();

                        }
                    });
                }
            } else {
                MessageBox.error("Sadece Taslak Kaydedildi Stat�s�ndeki Belgeler Silinebilir.");
            }

        },
        //G�rev Talebine Git
        toRequest: function (that, objectId) {


            // this._filter.setGlobalMissionNo(this);
            // var oView = this.getView();
            var i18n = that.oView.getModel("i18n").getResourceBundle();

            if (sap.ushell) {
                var systemId = sap.ushell.Container.getLogonSystem("system").getName();
            } else {
                var systemId = "TGD";
            }

            if (systemId == "TGD") {
                var url = i18n.getText("requestDev");
                url = url + objectId;
            } else if (systemId == "TGQ") {
                var url = i18n.getText("requestDev");
            } else if (systemId == "TGP") {
                var url = i18n.getText("requestDev");
            } else {
                var url = i18n.getText("requestDev");
                url = url + objectId;
            }

            sap.ui.require(["sap/m/library"], ({ URLHelper }) => URLHelper.redirect(url, true));
        }
    });
});