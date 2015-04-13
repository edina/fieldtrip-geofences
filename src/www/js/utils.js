'use strict';

define(function(require) {
    /*
     * Get an item from localStorage and returns a json object
     * @param key where the object is stored
     * @returns the object or null
     */
    var getLocalItem = function(key) {
        var object = null;
        var string = localStorage.getItem(key);
        if (string) {
            try {
                object = JSON.parse(string);
            }
            catch (ex) {
                console.warn('Invalid json stored in the key: ' + key);
            }
        }

        return object;
    };

    /*
     * Save a json object as a string in localStorage
     * @param key where to store the object
     * @param object the object
     */
    var setLocalItem = function(key, object) {
        var string;
        string = JSON.stringify(object);

        localStorage.setItem(key, string);
    };

    /*
     * Extract the parameters from an url
     * @param urlString a url string in the form of ?name1=value1&name2=value2
     * @returns an object with {name1: value1, name2: value2}
     */
    var paramsFromURL = function(urlString) {
        var paramsObject = {};
        var parts = urlString.match(/\?(?:(.+?)=(.+?))(?:\&(.+?)=(.+?))*\&?$/);
        var key, value;

        if (parts !== null) {
            for (var i = 0, len = parts.length; i < len; i += 2) {
                key = parts[i + 1];
                value = parts[i + 2];
                if (key !== undefined) {
                    paramsObject[key] = value;
                }
            }
        }

        return paramsObject;
    };

    return {
        getLocalItem: getLocalItem,
        setLocalItem: setLocalItem,
        paramsFromURL: paramsFromURL
    };
});
