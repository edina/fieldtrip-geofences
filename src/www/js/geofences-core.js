'use strict';

define(function(require) {
    var Geofence = window.geofence;
    var geofenceTransitionType = window.TransitionType;

    // Check for the presence of the cordova plugin
    if (Geofence === undefined) {
        console.warn('Geofence plugin not installed');
        console.warn('Please include com.cowbell.cordova.geofence in your project');
    }
    else {
        // Initialize cordova plugin
        Geofence.initialize();
        Geofence.receiveTransition = function(geofences) {
            geofences.forEach(function(geo) {
                console.debug('Geofence transition detected', geo);
            });
        };
    }

    /**
     * Transform the events to transition number
     * @param events and array with ENTER/EXIT/DWELL events as string
     * @returns a transition number
     */
    var parseTransitions = function(events) {
        var transition = 0;
        for (var i = 0, len = events.length; i < len; i++) {
            switch (events[i]) {
                case 'ENTER':
                    transition += geofenceTransitionType.ENTER;
                break;
                case 'EXIT':
                    transition += geofenceTransitionType.EXIT;
                break;
                case 'DWELL':
                    console.debug('Currently DWELL is not supported');
                break;
            }
        }

        return transition;
    };

    /**
     * Enable a list of geofences
     * @param list of geofences
     */
    var enable = function(geofences) {
        if (geofences === undefined) {
            console.debug('No geofences to enable ->' + geofences);
            return;
        }

        Geofence.addOrUpdate(geofences)
        .then(function() {
            console.log('Geofence successfully added');
        }, function(reason) {
            console.error('Adding geofence failed', reason);
        });
    };

    /**
     * Disable a list of geofences
     * @param list of geofences
     */
    var disable = function(geofences) {
        var geofencesIds;
        if (geofences === undefined) {
            console.debug('No geofences to disable ->' + geofences);
            return;
        }

        geofencesIds = geofences.map(function(geofences) {
            return geofences.id;
        });

        Geofence.remove(geofencesIds)
        .then(function() {
            console.log('Geofence sucessfully removed');
        }, function(reason) {
            console.log('Removing geofence failed', reason);
        });
    };

    /**
     * Parse a geojson feature into a geofence
     * @param feature a geojson feature
     * @returns a geofence
     */
    var parseGeoJSONFeature = function(feature) {
        var geofence = null;
        var properties;
        var notification;
        var geometry = feature.geometry;

        switch (geometry.type) {
            case 'Point':
                properties = feature.properties;
                notification = properties.notification;
                geofence = {
                    id: properties.id,
                    latitude: geometry.coordinates[1],
                    longitude: geometry.coordinates[0],
                    radius: properties.radius,
                    transitionType: parseTransitions(properties.events),
                    notification: {
                        id: notification.id,
                        title: notification.title,
                        text: notification.text,
                        data: {
                            action: notification.action
                        },
                        openAppOnClick: true
                    }
                };
            break;
            default:
                // TODO: cover a polygon with geofences
        }

        return geofence;
    };

    /**
     * Parse a geojson
     * @param a geojson object
     * @returns a list of geofences
     */
    var parseGeoJSON = function(geojson) {
        var geofences = [];
        var geofence;

        if (geojson.type === 'FeatureCollection') {
            for (var i = 0, len = geojson.features.length; i < len; i++) {
                geofence = parseGeoJSONFeature(geojson.features[i]);
                if (geofence !== null) {
                    geofences.push(geofence);
                }
            }
        }
        else {
            geofence = parseGeoJSONFeature(geojson);
            if (geofence !== null) {
                geofences.push(geofence);
            }
        }

        return geofences;
    };

    /**
     * Get active geofencces
     * @returns a list of active geofences in the device
     */
    var getActive = function() {
        var deferred = $.Deferred();

        Geofence
            .getWatched()
            .then(function(geofencesStr) {
                var activeGeofences = JSON.parse(geofencesStr);
                deferred.resolve(activeGeofences);
            })
            .catch(function(err) {
                deferred.reject(err);
            });

        return deferred.promise();
    };

    return {
        disable: disable,
        enable: enable,
        getActive: getActive,
        parseGeoJSON: parseGeoJSON
    };
});
