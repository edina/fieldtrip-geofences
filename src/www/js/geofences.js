'use strict';

define(function(require) {
    var records = require('records');
    var utils = require('./utils');
    var geofence = window.geofence;

    // Check for the presence of the cordova plugin
    if (geofence === undefined) {
        console.warn('Geofence plugin not installed');
        console.warn('Please include com.cowbell.cordova.geofence in your project');
        return;
    }

    // Initialize cordova plugin
    geofence.initialize();

    /**
     * Extract the geofences from the editor markup
     * implements the records.processEditor interface
     * @param editorName name of the editor
     * @param html html content of the editor
     * @param group from records.EDITOR_GROUP
     * @param online boolean value if the processing is held online
     */
    var extractGeofences = function(editorName, html, group, online) {
        var $form = $(html);
        var geofence;
        var geofences;

        $form
            .find('[data-geofences]')
            .each(function(i, el) {
                var geofenceFile;
                var geofenceName;

                geofenceFile = $(el).data('geofences');
                geofenceName = geofenceFile.match(/(.*)\.json$/)[1];
                geofence = {};
                geofence[geofenceName] = geofenceFile;

                geofences = utils.getLocalItem('geofences');
                // Initialize the geofences as empty object if null
                if (geofences === null) {
                    geofences = {};
                }

                geofences[editorName] = geofences[editorName] || [];
                geofences[editorName].push(geofence);

                utils.setLocalItem('geofences', geofences);
            });
    };

    // Add the plugin editor process to the pipeline
    records.addProcessEditor(extractGeofences);
});
