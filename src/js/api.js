/*global google, locations, VM, ko, map*/
var map;

var geocoder, gdirection, gdisplay;

var gmap = {};

gmap.init = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0, lng: 180},
        zoom: 10
    });
    geocoder = new google.maps.Geocoder();
    gdirection = new google.maps.DirectionsService();
    gdisplay = new google.maps.DirectionsRenderer;
    gdisplay.setMap(map);
    gdisplay.setPanel(document.getElementById("direction"));
    VM.initiateMarkers();
    VM.createComputedList();
    VM.setCenter(locations()[0]);
    ko.applyBindings(VM);  
};

gmap.geocode = function(loc) {
    geocoder.geocode({'address': loc.name}, function(results, status) {
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



gmap.direction = function(origin, dest, type) {
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
    
    gdirection.route(gmap.directionRequest, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            var leg = response.routes[0].legs[0];
            VM.setDirections(origin, {distance: leg.distance.text, duration: leg.duration.text});
            gdisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        } 
    });
};

var flickr = {};

flickr.API_KEY = '148419e552f69164e56198093ea40634';

flickr.URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
    
flickr.sendRequest = function(loc) {
    flickr.buildURL(loc.name);
    $.ajax({
        url: flickr.URL
    }).done((function(loc) {
        return function(data) {
            var photo = data.photos.photo;
            var tempArray = [];
            VM.thumbnail(flickr.buildImageURL(photo[0]));
            for (var i = 0; i < 20; i++) {
                var ImageURL = flickr.buildImageURL(photo[i]);
                tempArray.push({url: ImageURL});
            }
            VM.photoArray(tempArray);
            $('.offcanvas2').imagesLoaded(function() {
                if (VM.masonry) {
                    $('.offcanvas2').masonry('destroy');
                    VM.masonry = false;
                }
                $('.offcanvas2').masonry({
                    containerStyle: {position: 'absolute'}
                });
                VM.masonry = true;
            });
        };
    })(loc)).fail(function() {
        alert('Flickr Image for location: ' + loc.name + ' cannot be loaded.');
    });
}

flickr.buildURL = function (loc) {
    flickr.URL += ('&api_key=' + flickr.API_KEY);
    flickr.URL += '&format=json';
    flickr.URL += '&nojsoncallback=1';
    flickr.URL += '&text=' + loc;
    flickr.URL += '&content_type=' + 1;
    flickr.URL += '&sort=' + 'relevance';
    flickr.URL += '&privacy_filter=' + 1;
    flickr.URL += '&per_page=' + 20;
}

flickr.buildImageURL = function(photo) {
    var ImageURL = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg'
    ImageURL = ImageURL.replace('{farm-id}', photo.farm);
    ImageURL = ImageURL.replace('{server-id}', photo.server);
    ImageURL = ImageURL.replace('{id}', photo.id);
    ImageURL = ImageURL.replace('{secret}', photo.secret);
    return ImageURL;
};

var wiki = {};

wiki.sendRequest = function(loc) {
    wiki.buildURL(loc.name);
    $.ajax({
        url: wiki.URL,
        dataType: 'jsonp'
    }).done((function(loc) {
        return function(data) {
            var pages = data.query.pages;
            var extract = pages[Object.keys(pages)[0]].extract;
            VM.setWikiContent(loc, extract);
        }
    })(loc)).fail(function() {
        alert('Wikipedia content for ' + loc.name + ' cannot be loaded');
    });
}

wiki.buildURL = function(loc) {
    wiki.URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&titles={title}';
    wiki.URL = wiki.URL.replace('{title}', loc);
}