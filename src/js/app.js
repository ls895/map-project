/*global ko, map, gmap, $, wiki, flickr, google*/
var locations = ko.observableArray([
    {
        name: 'Tokyo Station', 
        position: {lat: 35.681298, lng: 139.7662469}
    },
    {
        name: 'Shinjuku',
        position: {lat: 35.69384, lng: 139.703549}
    },
    {
        name: 'Shinakawa',
        position: {lat: 35.628471, lng: 139.73876}
    },
    {
        name: 'Yokohama',
        position: {lat: 35.465798, lng: 139.622314}
    },
    {
        name: 'Minato',
        position: {lat: 35.658068, lng: 139.751599}
    }
]);

ko.bindingHandlers.sortable = {
    update: function(element, valueAccessor, viewModel, bindingContext) {
        var sortMode = bindingContext.sortMode();
        var list = $(element);
        var locations = valueAccessor();
        if (sortMode) {
            var options = {
                update: function(event, ui) {
                    var loc = ko.dataFor(ui.item[0]);
                    var newIndex = ui.item.index();
                    var oldIndex = locations.indexOf(loc);
                    if (oldIndex != newIndex) {
                        var c = locations();
                        locations([]);
                        c.splice(oldIndex, 1);
                        c.splice(newIndex, 0, loc);
                        locations(c);
                    }
                }
            };
            list.sortable(options);
        } else {
            if (list.sortable( 'instance' )) {
                list.sortable('destroy');
            }
        }
    }
};

var ViewModel = function() {
    var self = this;
    
    self.editMode = ko.observable(false);
    
    self.sortMode = ko.observable(false);
    
    self.transportMode = ko.observable(false);
    
    self.showPhotos = ko.observable(false);
    
    self.filterText = ko.observable('');
    
    self.newLocation = '';

    self.locations = locations;
    
    self.photoArray = ko.observableArray([]);
    
    self.toggleSort = function() {
        if (self.sortMode()) {
            self.sortMode(false);    
        } else {
            self.filterText('');
            self.sortMode(true);
        }
    };
    
    self.editLocation = function() {
        if (self.editMode()) {
            self.editMode(false);
        } else {
            self.editMode(true);
        }
    };
    
    self.openPhoto = function() {
        if (!self.showPhotos()) {
            self.showPhotos(true);
        }
    };
    
    self.closePhoto = function() {
        if(self.showPhotos()) {
            self.showPhotos(false);
        }
    };
    
    self.openInfoWindow = function() {
        self.closeInfoWindow(this);
        this.infoWindow = new google.maps.InfoWindow({
            content: '<h2>' + this.name + '</h2>'
        });
        this.infoWindow.open(map, this.marker);
        self.dropMarker.call(this);
        self.setCenter(this);
        wiki.sendRequest(this);
        flickr.sendRequest(this);
    };
    
    self.closeInfoWindow = function(loc) {
        loc.marker.setAnimation(null);
        if (loc.infoWindow) {
            loc.infoWindow.close();
            loc.infoWindow = null;
        }
    };
    
    self.setInfoWindowContent = function(loc, content) {
        loc.infoWindow.setContent(content);
    };
    
    self.dropMarker = function() {
        this.marker.setAnimation(null);
        this.marker.setAnimation(google.maps.Animation.DROP);
    };
    
    self.setMarkerVisible = function(loc, trueFalse) {
        loc.marker.setVisible(trueFalse);
    };
    
    self.addMarker = function(loc) {
        loc.marker = new google.maps.Marker({
            position: loc.position,
            map: map,
            animation: google.maps.Animation.DROP
        });
        loc.marker.addListener('click', (function(loc) {
            return function() {
                self.openInfoWindow.call(loc);
            };
        }(loc)));
    };

    self.initiateMarkers = function() {
        for (var i = 0; i < locations().length; i++) {
            self.addMarker(locations()[i]);
        }
    };
    
    self.createComputedList = function() {
        self.filteredLocations = ko.computed(function() {
            var target = self.filterText().toLowerCase();
            var against = locations();
            if (!target) {
                for (var i = 0; i < against.length; i++) {
                    self.setMarkerVisible(against[i], true);
                }
                return locations();
            } else {
                return ko.utils.arrayFilter(against, function(loc) {
                    var isContain = (loc.name.toLowerCase().indexOf(target) >= 0);
                    if (isContain) {
                        return true;
                    } else {
                        self.closeInfoWindow(loc);
                        self.setMarkerVisible(loc, false);
                        return false;
                    }
                });
            }
        });
    };
    
    self.setCenter = function(loc) {
        map.setCenter(loc.position);
    };
    
    self.handleAdd = function() {
        if (self.newLocation.length > 0) {
            var loc = {};
            loc.name = self.newLocation;
            gmap.geocode(loc);
        } else {
            console.log('Input field cannot be empty');
        }
    };
    
    self.addLocation = function(loc) {
        locations.push(loc);
    };
    
    self.handleDelete = function() {
        self.setMarkerVisible(this, false);
        self.closeInfoWindow(this);
        locations.remove(this);
    };
    
    self.enableTransport = function() {
        if (self.transportMode()) {
            self.transportMode(false);
        } else {
            self.transportMode(true);
        }
    };
    
    self.requestDirection = function() {
        var origin = this;
        var index = locations.indexOf(origin);
        var dest = locations()[index + 1];
        gmap.direction(origin, dest);
    };
};

var VM = new ViewModel();