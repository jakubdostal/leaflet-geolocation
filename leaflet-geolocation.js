L.GeoLocation = L.extend({
    getLocalPosition: function (callback_success, callback_error, option_enableHighAccuracy, option_timeout, option_maximumAge) {
        var options = {
            enableHighAccuracy: option_enableHighAccuracy || true,
            timeout: option_timeout || 100,
            maximumAge: option_maximumAge || 0
        };

        var onLocalPosition = function LocalPositionSuccess(position) {
            var result = L.latLng(position.coords.latitude, position.coords.longitude);

            if (callback_success !== undefined) {
                callback_success(result);
            }
        };

        var onLocalPositionError = function LocalPositionError(error) {
            console.log("Leaflet.GeoLocation.getLocalPosition failed with code " + error.code + " and message: " + error.message);
            if (callback_error !== undefined) {
                callback_error(error);
            }
        };

        //if we can use the local positioning (e.g. GPS or WiFi based) through the browser itself
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onLocalPosition, onLocalPositionError, options);
        }

    },

    getGeoIPPosition: function () {
        var result = L.latLng(0, 0);
        var url = "http://freegeoip.net/json/";

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                var geoip_response = JSON.parse(xhr.responseText);
                result.lat = geoip_response.latitude;
                result.lng = geoip_response.longitude;
            } else {
                console.log("Leaflet.GeoLocation.getGeoIPPosition failed because its XMLHttpRequest got this response: " + xhr.status);
            }
        };
        xhr.send();
        return result;
    },

    centerMapOnPosition: function (map, option_timeout) {
        var timeout = option_timeout || 1000;

        var onSuccess = function LocalPositionSuccess(position) {
            map.setView(position);
        }

        var onError = function LocalPositionError(error) {
            console.log("Leaflet.GeoLocation.centerMapOnPosition: falling back on GeoIP position");
            map.setView(L.GeoLocation.getGeoIPPosition());
        }

        L.GeoLocation.getLocalPosition(onSuccess, onError, true, timeout, 0);

    }
});