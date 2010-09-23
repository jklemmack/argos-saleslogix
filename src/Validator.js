﻿/// <reference path="../ext/ext-core-debug.js"/>
/// <reference path="../platform/Application.js"/>
/// <reference path="../sdata/SDataService.js"/>

Ext.namespace("Mobile.SalesLogix");

/// common frequently used templates
Mobile.SalesLogix.Validator = (function() {     
    return {                
        notEmpty: {
            test: /.+/,
            message: "'{1}' cannot be empty."
        },
        hasText: {
            test: /\w+/,
            message: "'{1}' cannot be empty."
        },
        isInteger: {
            test: /^\d+$/,
            message: "'{0}' is not an integer."
        },
        isDecimal: {
            test: /^[\d,.]+$/,
            message: "'{0}' is not a decimal."
        },
        isCurrency: {
            test: /^[\d,]+(\.\d{1,2})?$/,
            message: "'{0}' is not a valid currency number."
        },
        isPhoneNumber: {
            fn: function(phoneNumber) {
                var phoneRegExp = /^[\w\d)( ]+$/i;
                if (!phoneNumber) return false;
                if (!phoneRegExp.test(phoneNumber) || /(?:x{2,})|(?:x\d+x)/i.test(phoneNumber)) {
                    return "'{0}' is not a valid phone number."
                }
                return false;
            }
        },
        notFalse: {
            fn: function(Address) {
                if (Address === false)
                {
                    return "'{1}' cannot be empty.";
                }

                return false;
            }
        }
    };
})();    


