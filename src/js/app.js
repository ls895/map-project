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

// The default hardcoded locations available for the application
var locations = ko.observableArray([
    {
        name: 'HMS Belfast',
        position: {lat: 51.506579, lng: -0.08138899999994464},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'Big Ben',
        position: {lat: 51.50072919999999, lng: -0.12462540000001354},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'Westminster Bridge',
        position: {lat: 51.5008638, lng: -0.12196449999999004},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'London Eye',
        position: {lat: 51.503324, lng: -0.1195430000000215},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'Oxford Street',
        position: {lat: 51.5149255, lng: -0.14482590000000073},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'London School of Economics',
        position: {lat: 51.5144077, lng: -0.11737659999994321},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'King\'s College London',
        position: {lat: 51.51148639999999, lng: -0.11599699999999302},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    },
    {
        name: 'Old Royal Naval College',
        position: {lat: 51.4827375, lng: -0.008513499999935448},
        transport: {
            time: new TimeModel(),
            type: 'TRANSIT',
            duration: ko.observable(''),
            distance: ko.observable('')
        },
        wikiExtract: ko.observable(),
        thumbnail: ko.observable()
    }
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
                // Disable the filtering feature when sorting is underway so sorting is done on the correct underlying model
                start: function(event, ui) {
                    VM.disableFilter();
                },
                stop: function(event, ui) {
                    VM.enableFilter();
                },
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
                    VM.enableFilter();
                }
            };
            list.sortable(options);
        } else {
            // Disable and destroy jQuery UI sortable functionality if editMode is false
            if (list.sortable( 'instance' )) {
                list.sortable('destroy');
            }
            VM.enableFilter();
        }
    }
};

// View model that provides logic and connection between View and Model
var ViewModel = function() {
    var self = this;

    self.thumbnail = ko.observable();

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

    self.photoArray = ko.observableArray([]);

    self.editLocation = function() {
        if (self.editMode()) {
            self.editMode(false);
        } else {
            self.editMode(true);
        }
    };

    self.detailedDirections = function() {
        self.showDirections(true);
    };

    self.openInfoWindow = function() {
        self.thumbnail('');
        self.activeLocation(this);
        for (var i = 0; i < locations().length; i++) {
            self.closeInfoWindow(locations()[i]);
        }
        this.infoWindow = new google.maps.InfoWindow({
            content: '<p class="lead">' + this.name + '</p>'
        });
        // Open correct info window, drop a marker animation and send relative flickr and wiki ajax requests for the location
        this.infoWindow.open(map, this.marker);
        self.dropMarker.call(this);
        self.setCenter(this);
        wiki.sendRequest(this);
        flickr.sendRequest(this);
        self.enablePlaces();
        self.showDetail(true);
    };

    self.closeInfoWindow = function(loc) {
        loc.marker.setAnimation(null);
        if (loc.infoWindow) {
            loc.infoWindow.close();
            loc.infoWindow = null;
        }
    };

    self.setWikiContent = function(loc, extract) {
        loc.wikiExtract(extract);
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
        // Closure is used to allow each marker's click listener callback refer to the correct location object
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

    // Use ko.computed to return a proper array everytime there is a filter text entered
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

    // Create a new location object and add to the locations observable array
    self.handleAdd = function() {
        if (self.newLocation().length > 0) {
            var loc = {};
            loc.name = self.newLocation();
            loc.transport = {
                time: new TimeModel(),
                type: 'TRANSIT',
                duration: ko.observable(''),
                distance: ko.observable('')
            };
            loc.wikiExtract = ko.observable();
            gmap.searchPlace(loc);
            self.newLocation('');
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
        VM.sortMode(false);
    };

    self.disableFilter = function() {
        self.filterText('');
        self.sortMode(true);
    };

    self.requestDirection = function() {
        this.directionOK = ko.observable(false);
        var origin = this;
        var index = locations.indexOf(origin);
        var dest = locations()[index + 1];
        var type = origin.transport.type;
        gmap.direction(origin, dest, type);
    };

    self.setDirections = function(loc, obj) {
        loc.transport.duration(obj.duration);
        loc.transport.distance(obj.distance);
        loc.transport.time.directionOK(true);
    };

    self.closeDetail = function() {
        self.showDetail(false);
    };

    self.closeLast = function() {
        self.showDetail(false);
        self.showDirections(false);
    };
};

var VM = new ViewModel();