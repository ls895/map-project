/* global ko, map, gmap, $, wiki, flickr, google */

// Constructor function for time object used in each location's time picker
var TimeModel = function() {
    this.directionOK = ko.observable(false);
    this.value = ko.observable();
    this.current = new Date();
};

// Default parameters for each location's time picker
TimeModel.prototype.deselectable = true;
TimeModel.prototype.showCalendar = false;
TimeModel.prototype.showToday = true;
TimeModel.prototype.showTime = true;
TimeModel.prototype.showNow = true;
TimeModel.prototype.militaryTime = false;
TimeModel.prototype.min = null;
TimeModel.prototype.max = null;
TimeModel.prototype.autoclose = true;
TimeModel.prototype.strings = {
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    time: ["AM", "PM"]
};

// The location constructor function
var Location = function(name, position) {
    this.name = name;
    this.position = position;
    this.transport = {
        time: new TimeModel(),
        type: 'TRANSIT',
        duration: ko.observable(''),
        distance: ko.observable('')
    };
    this.wikiExtract = ko.observable();
    this.thumbnail = ko.observable();
};

Location.prototype.dropMarker = function() {
    this.marker.setAnimation(null);
    this.marker.setAnimation(google.maps.Animation.DROP);
};

Location.prototype.openInfoWindow = function() {
    this.infoWindow = new google.maps.InfoWindow({
        content: '<p class="lead">' + this.name + '</p>'
    });
    this.infoWindow.open(map, this.marker);
};

Location.prototype.closeInfoWindow = function() {
    this.marker.setAnimation(null);
    if (this.infoWindow) {
        this.infoWindow.close();
        this.infoWindow = null;
    }
};

Location.prototype.setMarkerVisible = function(trueFalse) {
    this.marker.setVisible(trueFalse);
};

Location.prototype.addMarker = function() {
    this.marker = new google.maps.Marker({
        position: this.position,
        map: map,
        animation: google.maps.Animation.DROP
    });
    // Closure is used to allow each marker's click listener callback refer to the correct location object
    this.marker.addListener('click', (function(loc) {
        return function() {
            loc.openInfoWindow();
        };
    }(this)));
};

Location.prototype.setWikiContent = function(extract) {
    this.wikiExtract(extract);
};

Location.prototype.setThumbnail = function(url) {
    this.thumbnail(url);
};

Location.prototype.setDirections = function(obj) {
    this.transport.duration(obj.duration);
    this.transport.distance(obj.distance);
    this.transport.time.directionOK(true);
};

// Default hardcoded locations
var locations = ko.observableArray([
    new Location('HMS Belfast', {lat: 51.506579, lng: -0.08138899999994464}),
    new Location('Big Ben', {lat: 51.50072919999999, lng: -0.12462540000001354}),
    new Location('Westminster Bridge', {lat: 51.5008638, lng: -0.12196449999999004}),
    new Location('London Eye', {lat: 51.503324, lng: -0.1195430000000215}),
    new Location('Oxford Street', {lat: 51.5149255, lng: -0.14482590000000073}),
    new Location('London School of Economics', {lat: 51.5144077, lng: -0.11737659999994321}),
    new Location('King\'s College London', {lat: 51.51148639999999, lng: -0.11599699999999302}),
    new Location('Old Royal Naval College', {lat: 51.4827375, lng: -0.008513499999935448})
]);

// Custom Knockout binding to allow sorting locations on the list and altering their relative order
ko.bindingHandlers.sortable = {
    // Update function runs everytime the observable editMode changes its value
    update: function(element, valueAccessor, viewModel, bindingContext) {
        var editMode = bindingContext.editMode();
        var list = $(element);
        var locations = valueAccessor();
        // Enable jQuery UI sortable functionality if editMode is true
        if (editMode) {
            var options = {
                // Rearrange the array index of the locations in the model to correctly reflect the UI change
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
            // Disable and destroy jQuery UI sortable functionality if editMode is false
            if (list.sortable( 'instance' )) {
                list.sortable('destroy');
            }
        }
    }
};

// View model that provides logic and connection between View and Model
var BaseViewModel = function() {
    var self = this;

    // Boolean observable to determine whether Google Map API is loaded to control availability of google map services in view model functions
    self.googleReady = ko.observable(false);

    self.editMode = ko.observable(false);

    self.sortMode = ko.observable(false);

    self.placesPage = ko.observable(true);

    self.transportPage = ko.observable(false);

    self.transportType = 'DRIVING';

    self.showDirections = ko.observable(false);

    self.imageLoading = ko.observable(false);

    self.wikiLoading = ko.observable(false);

    self.directionLoading = ko.observable(false);

    self.showDetail = ko.observable(false);

    self.filterText = ko.observable('');

    self.newLocation = ko.observable('');

    self.activeLocation = ko.observable();

    self.locations = locations;

    self.openInfoWindow = function() {
        self.activeLocation(this);
        if (self.googleReady()) {
            for (var i = 0; i < locations().length; i++) {
                locations()[i].closeInfoWindow();
            }
            this.openInfoWindow();
            this.dropMarker();
            self.setCenter(this);
            var bounds = new google.maps.LatLngBounds();
            bounds.extend(this.marker.getPosition());
            map.fitBounds(bounds);
        }
        wiki.sendRequest(this);
        flickr.sendRequest(this);
        self.enablePlaces();
        self.showDetail(true);
    };

    self.initiateMarkers = function() {
        for (var i = 0; i < locations().length; i++) {
            locations()[i].addMarker();
        }
    };

    self.setCenter = function(loc) {
        map.setCenter(loc.position);
    };
    
    self.setBounds = function() {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < locations().length; i++) {
            bounds.extend(locations()[i].marker.getPosition());
        }
        map.fitBounds(bounds);
    };

    // Use ko.computed to return a proper array everytime when there is a filter text entered
    self.createComputedList = function() {
        if (self.googleReady()) {
            self.filteredLocations = ko.computed(function() {
                var target = self.filterText().toLowerCase();
                var against = locations();
                if (!target) {
                    for (var i = 0; i < against.length; i++) {
                        against[i].setMarkerVisible(true);
                    }
                    return locations();
                } else {
                    return ko.utils.arrayFilter(against, function(loc) {
                        var isContain = (loc.name.toLowerCase().indexOf(target) >= 0);
                        if (isContain) {
                            loc.setMarkerVisible(true);
                            return true;
                        } else {
                            loc.closeInfoWindow();
                            loc.setMarkerVisible(false);
                            return false;
                        }
                    });
                }
            });
        } else {
            self.filteredLocations = ko.computed(function() {
                var target = self.filterText().toLowerCase();
                var against = locations();
                if (!target) {
                    return locations();
                } else {
                    return ko.utils.arrayFilter(against, function(loc) {
                        var isContain = (loc.name.toLowerCase().indexOf(target) >= 0);
                        if (isContain) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
            });            
        }
    };

    self.editLocation = function() {
        if (self.editMode()) {
            self.editMode(false);
            self.enableFilter();
        } else {
            self.editMode(true);
            self.disableFilter();
        }
    };

    // Create a new location object and add to the locations observable array
    self.handleAdd = function() {
        if (self.newLocation().length > 0) {
            if (self.googleReady()) {
                gmap.searchPlace(self.newLocation());
            } else {
                self.createLocation(self.newLocation(), {});
            }
        } else {
            window.alert('Input field cannot be empty');
        }
    };
    
    self.createLocation = function(placeName, position) {
        var loc = new Location(placeName, position);
        self.addLocation(loc);
    };
    
    self.addLocation = function(loc) {
        if (self.googleReady()) {
            self.addLocationToMap(loc);
        }
        locations.push(loc);
    };
    
    self.addLocationToMap = function(loc) {
        loc.addMarker();
        self.setCenter(loc);
    };

    self.handleDelete = function() {
        if (self.googleReady()) {
            this.setMarkerVisible(false);
            this.closeInfoWindow();
        }
        self.removeLocation(this);
    };
    
    self.removeLocation = function(loc) {
        locations.remove(loc);
    };

    self.enableTransport = function() {
        self.disableFilter();
        self.editMode(false);
        self.placesPage(false);
        self.transportPage(true);
        self.showDetail(false);
    };

    self.enablePlaces = function() {
        self.showDirections(false);
        self.transportPage(false);
        self.placesPage(true);
        self.enableFilter();
    };

    self.showMap = function() {
        self.placesPage(false);
        self.transportPage(false);
    };

    self.enableFilter = function() {
        self.sortMode(false);
    };

    self.disableFilter = function() {
        self.filterText('');
        self.sortMode(true);
    };

    self.requestDirection = function() {
        this.transport.time.directionOK(false);
        var origin = this;
        var index = locations.indexOf(origin);
        var dest = locations()[index + 1];
        var type = origin.transport.type;
        gmap.direction(origin, dest, type);
    };

    self.setDirections = function(loc, obj) {
        loc.setDirections(obj);
    };

    self.setWikiContent = function(loc, extract) {
        loc.setWikiContent(extract);
    };
    
    self.setThumbnail = function(loc, url) {
        loc.setThumbnail(url);
    };

    self.detailedDirections = function() {
        self.showDirections(true);
    };
    
    self.closeDetail = function() {
        self.showDetail(false);
    };

    self.closeLast = function() {
        self.showDetail(false);
        self.showDirections(false);
    };
};

var VM = new BaseViewModel();