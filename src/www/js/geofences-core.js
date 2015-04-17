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
                console.log('Geofence transition detected', geo);
            });
        };
    }

    var getTransition = function(events) {
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

    var enable = function(geofences) {
        Geofence.addOrUpdate(geofences)
        .then(function() {
            console.log('Geofence successfully added');
        }, function(reason) {
            console.error('Adding geofence failed', reason);
        });
    };

    var disable = function(geofences) {
        var geofencesIds;

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
                    transitionType: getTransition(properties.events),
                    notification: {
                        id: notification.id,
                        title: notification.title,
                        text: notification.text,
                        openAppOnClick: true
                    }
                };
            break;
            default:
                // TODO: cover a polygon with geofences
        }

        return geofence;
    };

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
