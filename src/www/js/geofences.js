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

    templates.groupItem = _.template(
        '<li data-role="list-divider" data-divider-theme="b">' +
            '<h2><%- groupName %></h2>' +
        '</li>'
    );

    templates.geofenceItem = _.template(
        '<li>' +
            '<a href="<%= geofenceUrl %>">' +
                '<h2><%- geofenceName %></h2>' +
            '</a>' +
        '</li>'
    );

    templates.geofenceDetail = _.template(
        '<h2><%- geofenceName %></h2>' +
        '<div class="geofence-switch-container">' +
            '<input type="checkbox" class="geofence-switch" data-role="flipswitch">' +
        '</div>'
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
                geofence = {};
                geofence.filename = $(el).data('geofences');
                geofence.name = geofence.filename.match(/(.*)\.json$/)[1];

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
        var _geofences = utils.getLocalItem('geofences');
        var geofences;
        var html = '';

        for (var group in _geofences) {
            if (_geofences.hasOwnProperty(group)) {
                html += templates.groupItem({
                    groupName: group
                });

                geofences = _geofences[group];

                for (var i = 0, len = geofences.length; i < len; i++) {
                    html += templates.geofenceItem({
                        geofenceName: geofences[i].name,
                        geofenceUrl: GEOFENCE_PAGE + '?group=' + group + '&id=' + i
                    });
                }
            }
        }
        $('#geofences-group-list')
            .html(html)
            .listview('refresh');
    });

    $(document).on('pagebeforeshow', '#geofences-detail-page', function() {
        var params = utils.paramsFromURL($(this).data('url'));
        var geofences = utils.getLocalItem('geofences');
        var geofence = geofences[params.group][params.id];
        var html = '';

        html += templates.geofenceDetail({
            geofenceName: geofence.name,
            geofenceFilename: geofence.filename
        });

        $('#geofence-detail-container')
            .html(html)
            .find('.geofence-switch')
            .flipswitch();
    });

    // Inject the plugin styles
    $('head').prepend('<link rel="stylesheet" href="' + PLUGIN_PATH + '/css/style.css" type="text/css" />');
});
