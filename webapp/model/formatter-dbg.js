sap.ui.define(
  ["sap/ui/core/format/NumberFormat", "sap/ui/core/format/DateFormat"],
  function(e, r) {
    "use strict";
    return {
      removeLeadingZeroes: function(e) {
        if (e) {
          return e.replace(/^0+/, "");
        } else {
          return "";
        }
      },
      dateFormat: function(e) {
        if (e) {
          var t = r.getDateTimeInstance({ pattern: "dd.MM.yyyy" });
          return t.format(new Date(e));
        } else {
          return e;
        }
      },
      timeFormat: function(e) {
        if (e != null) {
          if (e.ms != 0) {
            var r = sap.ui.core.format.DateFormat.getTimeInstance({
              pattern: "HH:mm",
            });
            var t = new Date(0).getTimezoneOffset() * 60 * 1e3;
            return r.format(new Date(e.ms + t));
          } else {
            return "";
          }
        }
      },
      typeCellInput: function(e) {
        if (e === "input") {
          return true;
        } else {
          return false;
        }
      },
      typeCellCheckBox: function(e) {
        if (e === "checkbox") {
          return true;
        } else {
          return false;
        }
      },
      typeCellComboBox: function(e) {
        if (e === "combobox") {
          return true;
        } else {
          return false;
        }
      },
      typeValueComboBox: function(e) {
        if (e === "") {
          return false;
        } else if (e === true) {
          return true;
        } else {
          return false;
        }
      },
      malzemeTanimEditable: function(e, r, t, u) {
        if (e === false) {
          return false;
        } else {
          if (u == true) {
            return true;
          }
          if (t === true) {
            if (r !== undefined && r !== null) {
              if (r.trim() === "") {
                return true;
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        }
      },
      quantityMeins: function(e) {
        if (!e || e == null || e == "") {
          return false;
        } else {
          return true;
        }
      },
      visibleCheck: function(e) {
        var r = false;
        if (e && e.length != 0) {
          e.forEach(e => {
            if (e.quantity && e.quantity != null && e.quantity != "") {
              r = true;
            }
          });
        }
        return r;
      },
      kalemHatasi: function(e) {
        if (e === true) {
          return true;
        } else {
          return false;
        }
      },
      logoFormatter: function() {
        var e = jQuery.sap.getModulePath("com.tupras.zsrmscp");
        return e + "/images/" + "logo.png";
      },
      enableFormat: function(e, r) {
        if (e === true) {
          if (r === true || r === undefined) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      enableFormatPYP: function(e, r, t, u) {
        if (e === true) {
          if (r === true || r === undefined) {
            if (u == "DT_16_30_2" && t == "2") {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      HizmetEnableFormat: function(e, r, t) {
        if (t == true) {
          return false;
        }
        if (e === true) {
          if (r === true || r === undefined) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      reverseHizmetEnableFormat: function(e, r, t) {
        if (e === true) {
          if (t == true) {
            return true;
          }
          if (r === true || r === undefined) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      trueFalseFormat: function(e) {
        if (e === "true" || e === true) {
          return true;
        } else {
          return false;
        }
      },
      visibleEHFormat: function(e, r) {
        if (e === true || e === "true" || e === undefined) {
          if (r === "E") {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
      visibleTesvik: function(e) {
        var r = false;
        if (e && e.length != 0) {
          e.forEach(e => {
            if (e.ZzTesdrm == "TEVAR") {
              r = true;
            }
          });
        }
        return r;
      },
      reverseFormat: function(e) {
        if (e == true) {
          return false;
        } else {
          return true;
        }
      },
      stokFormat: function(e) {
        if (e == true) {
          return "Mevcut";
        } else {
          return "Mevcut Değil";
        }
      },
      visiblePyp: function(e, r, t) {
        if (e == true && r == "2" && t == "DT_16_30_2") {
          return false;
        } else {
          return e;
        }
      },
      visibleFromBwart: function(e, r) {
        if (e == true && r != "311") {
          return true;
        } else {
          return false;
        }
      },
    };
  }
);
