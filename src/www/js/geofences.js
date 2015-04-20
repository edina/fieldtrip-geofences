'use strict';

define(function(require) {
    var records = require('records');
    var file = require('file');
    var utils = require('./utils');
    var geofencesCore = require('./geofences-core');
    var _ = require('underscore');

    var PLUGIN_PATH = 'plugins/geofences';
    var GEOFENCE_PAGE = 'geofences-detail-page.html';

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

    // Bind the click to navigate to the geofences page
    $(document).on('vclick', '.geofences-page-button', function(event) {
        event.preventDefault();
        $('body').pagecontainer('change', 'geofences-main-page.html');
    });

    // Render the groups of geofences a a list view
    $(document).on('pagebeforeshow', '#geofences-main-page', function() {
        var globalGeofences = utils.getLocalItem('geofences');
        var geofences;
        var html = '';

        for (var group in globalGeofences) {
            if (globalGeofences.hasOwnProperty(group)) {
                html += templates.groupItem({
                    groupName: group
                });

                geofences = globalGeofences[group];

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

    // Render the detail or a group of geofences
    $(document).on('pagebeforeshow', '#geofences-detail-page', function() {
        var params = utils.paramsFromURL($(this).data('url'));
        var globalGeofences = utils.getLocalItem('geofences');
        var geofences = globalGeofences[params.group][params.id];
        var parsedGeofences;
        var fetchAvailableGeofences;
        var fetchActiveGeofences;
        var $flipswitch;
        var html = '';

        html += templates.geofenceDetail({
            geofenceName: geofences.name,
            geofenceFilename: geofences.filename
        });

        $flipswitch = $('#geofence-detail-container')
            .html(html)
            .find('.geofence-switch')
            .flipswitch();

        $flipswitch.on('change', function(evt) {
            var target = evt.target;
            if (target.checked) {
                geofencesCore.enable(parsedGeofences);
            }
            else {
                geofencesCore.disable(parsedGeofences);
            }
        });

        // Fetch the geofences of this group ofe geofences
        fetchAvailableGeofences = file
            .readJSONFromFS(records.getEditorsDir(), geofences.filename)
            .then(function(json) {
                parsedGeofences = geofencesCore.parseGeoJSON(json);
                return parsedGeofences;
            })
            .fail(function(err) {
                console.error(err);
            });

        // Fetch the geofences active in the device
        fetchActiveGeofences = geofencesCore.getActive();

        // Pair active geofences with the geofences of this group
        $.when(fetchAvailableGeofences, fetchActiveGeofences)
            .done(function(availableGeofences, activeGeofences) {
                var checked = true;
                var activeIDs;

                activeIDs = activeGeofences.map(function(geofence) {
                    return geofence.id;
                });

                for (var i = 0, len = availableGeofences.length; i < len; i++) {
                    console.debug(availableGeofences[i].id);

                    if (activeIDs.indexOf(availableGeofences[i].id) < 0) {
                        checked = false;
                    }
                }

                $flipswitch
                    .prop('checked', checked)
                    .flipswitch('refresh');
            });

    });

    // Inject the plugin styles
    $('head').prepend('<link rel="stylesheet" href="' + PLUGIN_PATH + '/css/style.css" type="text/css" />');
});
