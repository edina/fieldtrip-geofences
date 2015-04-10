'use strict';

define(function(require) {
    var records = require('records');
    var utils = require('./utils');
    var _ = require('underscore');

    var geofence = window.geofence;
    var PLUGIN_PATH = 'plugins/geofences';
    var GEOFENCE_PAGE = 'geofences-detail-page.html';

    // Check for the presence of the cordova plugin
    if (geofence === undefined) {
        console.warn('Geofence plugin not installed');
        console.warn('Please include com.cowbell.cordova.geofence in your project');
        //return;
    }
    else {
        // Initialize cordova plugin
        geofence.initialize();
    }

    var templates = {};

    templates.editorItem = _.template(
        '<li>' +
            '<a href="<%= geofenceUrl %>">' +
                '<h2><%- editorName %></h2>' +
            '</a>' +
        '</li>'
    );

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

    $(document).on('vclick', '.geofences-page-button', function(event) {
        event.preventDefault();
        $('body').pagecontainer('change', 'geofences-main-page.html');
    });

    $(document).on('pagebeforeshow', '#geofences-main-page', function() {
        var geofences = utils.getLocalItem('geofences');
        var html = '';
        for (var editorName in geofences) {
            if (geofences.hasOwnProperty(editorName)) {
                html += templates.editorItem({
                    editorName: editorName,
                    geofenceUrl: GEOFENCE_PAGE + '?editor=' + editorName
                });
            }
        }
        $('#geofences-editor-list')
            .html(html)
            .listview('refresh');
    });

    $(document).on('pagebeforeshow', '#geofences-detail-page', function() {
        var params = utils.paramsFromURL($(this).data('url'));
        console.debug(params);
    });

    // Inject the plugin styles
    $('head').prepend('<link rel="stylesheet" href="' + PLUGIN_PATH + '/css/style.css" type="text/css" />');
});
