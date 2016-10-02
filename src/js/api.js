/* global google, locations, VM, ko, $ */

// Google Map API
var map;

var gmap = {};

// Initiate Google Map, view model and apply Knockout bindings once Google Map API is loaded
gmap.init = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 180},
        zoom: 10
    });
    gmap.geocoder = new google.maps.Geocoder();
    gmap.gdirection = new google.maps.DirectionsService();
    gmap.gdisplay = new google.maps.DirectionsRenderer;
    gmap.gdisplay.setMap(map);
    gmap.gdisplay.setPanel(document.getElementById("direction"));
    VM.initiateMarkers();
    VM.createComputedList();
    VM.setCenter(locations()[0]);
    ko.applyBindings(VM);  
};

// Google geocoding service for adding new location
gmap.geocode = function(loc) {
    gmap.geocoder.geocode({'address': loc.name}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var position = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            loc.position = position;
            VM.addMarker(loc);
            VM.addLocation(loc);
            VM.setCenter(loc);
        } else {
            alert('Geocode for ' + loc.name + ' was not successful for the following reason: ' + status);
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
        origin: origin.name,
        destination: dest.name,
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

// Flickr API
var flickr = {};

flickr.API_KEY = '148419e552f69164e56198093ea40634';

flickr.URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
    
flickr.sendRequest = function(loc) {
    VM.imageLoading(true);
    flickr.buildURL(loc.name);
    $.ajax({
        url: flickr.URL
    }).done((function(loc) {
        return function(data) {
            var photo = data.photos.photo;
            VM.thumbnail(flickr.buildImageURL(photo[0]));
            VM.imageLoading(false);
        };
    })(loc)).fail(function() {
        window.alert('Flickr Image for location: ' + loc.name + ' cannot be loaded. Try again later.');
    });
};

// Construct the flickr URL for ajax request
flickr.buildURL = function (loc) {
    flickr.URL += ('&api_key=' + flickr.API_KEY);
    flickr.URL += '&format=json';
    flickr.URL += '&nojsoncallback=1';
    flickr.URL += '&text=' + loc;
    flickr.URL += '&content_type=' + 1;
    flickr.URL += '&sort=' + 'relevance';
    flickr.URL += '&privacy_filter=' + 1;
    flickr.URL += '&per_page=' + 20;
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


// Wikipedia API
var wiki = {};

wiki.sendRequest = function(loc) {
    VM.wikiLoading(true);
    wiki.buildURL(loc.name);
    $.ajax({
        url: wiki.URL,
        dataType: 'jsonp'
    }).done((function(loc) {
        return function(data) {
            var pages = data.query.pages;
            var extract = pages[Object.keys(pages)[0]].extract;
            VM.setWikiContent(loc, extract);
            VM.wikiLoading(false);
        };
    })(loc)).fail(function() {
        window.alert('Wikipedia content for ' + loc.name + ' cannot be loaded. Try again later.');
    });
};

wiki.buildURL = function(loc) {
    wiki.URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&titles={title}';
    wiki.URL = wiki.URL.replace('{title}', loc);
};