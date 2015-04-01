'use strict';

define(function() {
    var geofence = window.geofence;

    if (geofence === undefined) {
        console.error('Geofence plugin not installed');
        console.error('Please include com.cowbell.cordova.geofence in your project');
        return;
    }

    geofence.initialize();
});
