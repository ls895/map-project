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



gmap.direction = function(origin, dest) {
    gmap.directionRequest = {
        origin: origin.name,
        destination: dest.name,
        travelMode: google.maps.TravelMode.DRIVING
    };
    gdirection.route(gmap.directionRequest, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            console.log(response)
            gdisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        } 
    });
}