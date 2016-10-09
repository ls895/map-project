/* global google, VM, ko, $ */

// Google Map API
var map;

var gmap = {};

// Initiate Google Map, view model and apply Knockout bindings once Google Map API is loaded
gmap.init = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 0},
        zoom: 13
    });
    gmap.service = new google.maps.places.PlacesService(map);
    gmap.gdirection = new google.maps.DirectionsService();
    gmap.gdisplay = new google.maps.DirectionsRenderer();
    gmap.gdisplay.setMap(map);
    gmap.gdisplay.setPanel(document.getElementById("direction"));
    // Allows Google Map API services in view model functions with boolean observable set to true
    VM.googleReady(true);
    VM.initiateMarkers();
    VM.createComputedList();
    VM.setBounds();
    ko.applyBindings(VM);
};

// Search for corresponding place using the Google Map API Place library
gmap.searchPlace = function(loc) {
    var request = {
        query: loc.name
    };
    gmap.service.textSearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            gmap.getDetail(results[0].place_id, loc);
        } else {
            window.alert('Google places search for ' + loc.name + ' was not successful for the following reason: ' + status);
        }
    });
};

// Search for the correspondig latlng value based on the Place library return
gmap.getDetail = function(id, loc) {
    var request = {
        placeId: id
    };
    gmap.service.getDetails(request, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            var position = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            loc.position = position;
            VM.addMarker(loc);
            VM.addLocation(loc);
            VM.setCenter(loc);
        } else {
            window.alert('Google places detailed search for ' + id + ' was not successful for the following reason: ' + status);
        }
    });
};

// Google direction service for requesting travel directions between locations
gmap.direction = function(origin, dest, type) {
    if (!origin.transport.time.value()) {
        window.alert('Choose departure time before submitting request.');
        return;
    }
    VM.directionLoading(true);
    gmap.directionRequest = {
        origin: origin.position,
        destination: dest.position,
        travelMode: google.maps.TravelMode[type],
        transitOptions: {
            departureTime: origin.transport.time.value()
        },
        drivingOptions: {
            departureTime: origin.transport.time.value()
        }
    };
    gmap.gdirection.route(gmap.directionRequest, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var leg = response.routes[0].legs[0];
            VM.setDirections(origin, {distance: leg.distance.text, duration: leg.duration.text});
            gmap.gdisplay.setDirections(response);
            VM.directionLoading(false);
        } else {
            window.alert('Directions request failed due to ' + status + '.');
        }
    });
};

// On error callback if Google Map API fails to load so application runs in semi mode
gmap.onError = function() {
    window.alert('Unable to load Google Maps. Application now starts in semi mode without Google Maps related functionality.');
    VM.createComputedList();
    ko.applyBindings(VM);
};

// Flickr API
var flickr = {};

flickr.API_KEY = '148419e552f69164e56198093ea40634';

flickr.URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';

// Send ajax request using jQuery
flickr.sendRequest = function(loc) {
    VM.imageLoading(true);
    flickr.buildURL(loc.name);
    $.ajax({
        url: flickr.URL
    }).done((function(loc) {
        return function(data) {
            var photo = data.photos.photo;
            var thumbnail = flickr.buildImageURL(photo[0]);
            VM.setThumbnail(loc, thumbnail);
            VM.imageLoading(false);
        };
    })(loc)).fail(function(xhr, status, error) {
        window.alert('Flickr Image for location: ' + loc.name + ' cannot be loaded due to reason: ' + status + '. Try again later.');
    });
};

// Construct the flickr URL for ajax request
flickr.buildURL = function(loc) {
    flickr.URL += ('&api_key=' + flickr.API_KEY);
    flickr.URL += '&format=json';
    flickr.URL += '&nojsoncallback=1';
    flickr.URL += '&text=' + loc;
    flickr.URL += '&content_type=' + 1;
    flickr.URL += '&sort=' + 'interestingness-desc';
    flickr.URL += '&privacy_filter=' + 1;
    flickr.URL += '&per_page=' + 5;
};

// Construct the image urls from the flickr ajax returns
flickr.buildImageURL = function(photo) {
    var ImageURL = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg';
    ImageURL = ImageURL.replace('{farm-id}', photo.farm);
    ImageURL = ImageURL.replace('{server-id}', photo.server);
    ImageURL = ImageURL.replace('{id}', photo.id);
    ImageURL = ImageURL.replace('{secret}', photo.secret);
    return ImageURL;
};

// MediaWiki API
var wiki = {};

// Send ajax request using jQuery
wiki.sendRequest = function(loc) {
    VM.wikiLoading(true);
    wiki.buildURL(loc.name);
    $.ajax({
        url: wiki.URL,
        dataType: 'jsonp',
        timeout: 5000
    }).done((function(loc) {
        return function(data) {
            var pages = data.query.pages;
            var extract = pages[Object.keys(pages)[0]].extract;
            VM.setWikiContent(loc, extract);
            VM.wikiLoading(false);
        };
    })(loc)).fail(function(xhr, status, error) {
        // 5000ms timeout for handling miscellaneous jsonp request errors
        if (status === 'timeout') {
            window.alert('Request timeout. Try again later.');
        } else {
            window.alert('Wikipedia content for ' + loc.name + ' cannot be loaded due to reason: ' + status + '. Try again later.');
        }
    });
};

// Constructy the MediaWiki URL for ajax request
wiki.buildURL = function(loc) {
    wiki.URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&titles={title}';
    wiki.URL = wiki.URL.replace('{title}', loc);
};