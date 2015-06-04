/*
Copyright (c) 2015, EDINA
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this
  list of conditions and the following disclaimer in the documentation and/or
  other materials provided with the distribution.
* Neither the name of EDINA nor the names of its contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY EDINA ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL EDINA BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/

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
