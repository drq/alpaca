(function($) {

    var Alpaca = $.alpaca;

    Alpaca.Fields.AddressField = Alpaca.Fields.ObjectField.extend(
    /**
     * @lends Alpaca.Fields.AddressField.prototype
     */
    {
        /**
         * @constructs
         * @augments Alpaca.Fields.ObjectField
         *
         * @class A combo field for rendering a standard US address. It also comes up with support for Google Map
         * which would requires including Google Map JS file for the form that uses this class.
         *
         * @param {Object} container Field container.
         * @param {Any} data Field data.
         * @param {Object} options Field options.
         * @param {Object} schema Field schema.
         * @param {Object|String} view Field view.
         * @param {Alpaca.Connector} connector Field connector.
         * @param {Function} errorCallback Error callback.
         */
        constructor: function(container, data, options, schema, view, connector,errorCallback) {
            this.base(container, data, options, schema, view, connector,errorCallback);
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#setup
         */
        setup: function() {
            this.base();

            this.schema = {
                "title": "Home Address",
                "type": "object",
                "properties": {
                    "street": {
                        "title": "Street",
                        "type": "array",
                        "items": {
                            "type": "string",
                            "maxLength": 30,
                            "minItems": 0,
                            "maxItems": 3
                        }
                    },
                    "city": {
                        "title": "City",
                        "type": "string"
                    },
                    "state": {
                        "title": "State",
                        "type": "string",
                        "enum": ["AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FM", "FL", "GA", "GU", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MH", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "MP", "OH", "OK", "OR", "PW", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VI", "VA", "WA", "WV", "WI", "WY"]
                    },
                    "zip": {
                        "title": "Zip Code",
                        "type": "string",
                        "pattern": /^(\d{5}(-\d{4})?)?$/
                    }
                }
            };
            Alpaca.merge(this.options, {
                "fields": {
                    "zip": {
                        "maskString": "99999",
                        "size": 5
                    },
                    "state": {
                        "optionLabels": ["ALABAMA", "ALASKA", "AMERICANSAMOA", "ARIZONA", "ARKANSAS", "CALIFORNIA", "COLORADO", "CONNECTICUT", "DELAWARE", "DISTRICTOFCOLUMBIA", "FEDERATEDSTATESOFMICRONESIA", "FLORIDA", "GEORGIA", "GUAM", "HAWAII", "IDAHO", "ILLINOIS", "INDIANA", "IOWA", "KANSAS", "KENTUCKY", "LOUISIANA", "MAINE", "MARSHALLISLANDS", "MARYLAND", "MASSACHUSETTS", "MICHIGAN", "MINNESOTA", "MISSISSIPPI", "MISSOURI", "MONTANA", "NEBRASKA", "NEVADA", "NEWHAMPSHIRE", "NEWJERSEY", "NEWMEXICO", "NEWYORK", "NORTHCAROLINA", "NORTHDAKOTA", "NORTHERNMARIANAISLANDS", "OHIO", "OKLAHOMA", "OREGON", "PALAU", "PENNSYLVANIA", "PUERTORICO", "RHODEISLAND", "SOUTHCAROLINA", "SOUTHDAKOTA", "TENNESSEE", "TEXAS", "UTAH", "VERMONT", "VIRGINISLANDS", "VIRGINIA", "WASHINGTON", "WESTVIRGINIA", "WISCONSIN", "WYOMING"]
                    }
                }
            });

            if (Alpaca.isEmpty(this.options.addressValidation)) {
                this.options.addressValidation = true;
            }
        },

        /**
         * Returns address in a single line string.
         *
         * @returns {String} Address as a single line string.
         */
        getAddress: function() {
            var value = this.getValue();
            if (this.view.type == "view") {
                value = this.data;
            }
            var address = "";
            if (value) {
                if (value.street) {
                    $.each(value.street, function(index, value) {
                        address += value + " ";
                    });
                }
                if (value.city) {
                    address += value.city + " ";
                }
                if (value.state) {
                    address += value.state + " ";
                }
                if (value.zip) {
                    address += value.zip;
                }
            }
            return address;
        },

        /**
         * @see Alpaca.Field#renderField
         */
        renderField: function(onSuccess) {
            this.base();
            var _this = this;
            // apply additional css
            $(this.fieldContainer).addClass("alpaca-addressfield");

            if (this.options.addressValidation) {
                $('<div style="clear:both;"></div>').appendTo(this.fieldContainer);
                var mapButton = $('<div class="alpaca-form-button">Google Map</div>').appendTo(this.fieldContainer);
                if (mapButton.button) {
                    mapButton.button({
                        text: true
                    });
                }
                mapButton.click(
                        function() {
                            if (google && google.maps) {
                                var geocoder = new google.maps.Geocoder();
                                var address = _this.getAddress();
                                if (geocoder) {
                                    geocoder.geocode({
                                        'address': address
                                    }, function(results, status) {
                                        if (status == google.maps.GeocoderStatus.OK) {
                                            var mapCanvasId = _this.getId() + "-map-canvas";
                                            if ($('#' + mapCanvasId).length == 0) {
                                                $("<div id='" + mapCanvasId + "' class='alpaca-controlfield-address-mapcanvas'></div>").appendTo(_this.fieldContainer);
                                            }
                                            var map = new google.maps.Map(document.getElementById(_this.getId() + "-map-canvas"), {
                                                "zoom": 10,
                                                "center": results[0].geometry.location,
                                                "mapTypeId": google.maps.MapTypeId.ROADMAP
                                            });
                                            var marker = new google.maps.Marker({
                                                map: map,
                                                position: results[0].geometry.location
                                            });
                                        } else {
                                            _this.displayMessage("Geocoding failed: " + status);
                                        }
                                    });
                                }
                            } else {
                                _this.displayMessage("Google Map API is not installed.");
                            }
                        }).wrap('<small/>');
            }

            if (onSuccess) {
                onSuccess();
            }
        },//__BUILDER_HELPERS

        /**
         * @see Alpaca.Field#isContainer
         */
        isContainer: function() {
            return false;
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#getSchemaOfOptions
         */
        getSchemaOfOptions: function() {
            return Alpaca.merge(this.base(), {
                "properties": {
                    "validateAddress": {
                        "title": "Address Validation",
                        "description": "Enable address validation if true",
                        "type": "boolean",
                        "default": true
                    }
                }
            });
        },

        /**
         * @private
         * @see Alpaca.Fields.ObjectField#getOptionsForOptions
         */
        getOptionsForOptions: function() {
            return Alpaca.merge(this.base(), {
                "fields": {
                    "validateAddress": {
                        "helper": "Address validation if checked",
                        "rightLabel": "Enable Google Map for address validation?",
                        "type": "checkbox"
                    }
                }
            });
        },
        /**
         * @see Alpaca.Fields.ObjectField#getTitle
         */
        getTitle: function() {
            return "Address";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getDescription
         */
        getDescription: function() {
            return "Standard US Address with Street, City, State and Zip. Also comes with support for Google map.";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getType
         */
        getType: function() {
            return "any";
        },

        /**
         * @see Alpaca.Fields.ObjectField#getFieldType
         */
        getFieldType: function() {
            return "address";
        }//__END_OF_BUILDER_HELPERS
    });

    Alpaca.registerFieldClass("address", Alpaca.Fields.AddressField);
})(jQuery);
