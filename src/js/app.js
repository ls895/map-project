/*global ko, map, gmap, $, wiki, flickr, google*/
var TimeModel = function() {
    this.directionOK = ko.observable(false);
    this.value = ko.observable();
    this.current = new Date();
};

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
}

var locations = ko.observableArray([
    {
        name: 'London Gatwick Airport', 
        position: {lat: 51.1536621, lng: -0.18206290000000536},
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
        name: "King's Cross",
        position: {lat: 51.53170300000001, lng: -0.12431049999997867},
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
        name: 'Emirates Stadium',
        position: {lat: 51.55572979999999, lng: -0.10831180000002405},
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
        name: 'Canary Wharf',
        position: {lat: 51.5054306, lng: -0.023533300000053714},
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
        name: 'London Bridge',
        position: {lat: 51.5078788, lng: -0.08773210000003928},
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

ko.bindingHandlers.sortable = {
    update: function(element, valueAccessor, viewModel, bindingContext) {
        var editMode = bindingContext.editMode();
        var list = $(element);
        var locations = valueAccessor();
        if (editMode) {
            var options = {
                sort: function(event, ui) {
                    VM.disableFilter();
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
            if (list.sortable( 'instance' )) {
                list.sortable('destroy');
            }
            VM.enableFilter();
        }
    }
};

var ViewModel = function() {
    var self = this;
    
    self.thumbnail = ko.observable();
    
    self.editMode = ko.observable(false);
    
    self.sortMode = ko.observable(false);
    
    self.placesPage = ko.observable(true);
    
    self.transportPage = ko.observable(false);
    
    self.transportType = 'DRIVING';
    
    self.showDirections = ko.observable(false);
    
    self.showPhotos = ko.observable(false);
    
    self.showDetail = ko.observable(false);
    
    self.filterText = ko.observable('');
    
    self.newLocation = '';
    
    self.activeLocation = ko.observable();

    self.locations = locations;
    
    self.photoArray = ko.observableArray([]);
    
    // self.masonry = false;
    
    self.editLocation = function() {
        if (self.editMode()) {
            self.editMode(false);
        } else {
            self.editMode(true);
        }
    };
    
    self.openPhoto = function() {
        if (self.showPhotos()) {
            self.showPhotos(false);
        } else {
            self.showPhotos(true);
        }
    };
    
    self.closePhoto = function() {
        self.showPhotos(false);
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
            content: '<h4>' + this.name + '</h4>'
        });
        this.infoWindow.open(map, this.marker);
        self.dropMarker.call(this);
        self.setCenter(this);
        wiki.sendRequest(this);
        flickr.sendRequest(this);
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
            loc.transport = {
                time: new TimeModel(),
                type: 'TRANSIT',
                duration: ko.observable(''),
                distance: ko.observable('')         
            };
            loc.wikiExtract = ko.observable();
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
        self.disableFilter();
        self.editMode(false);
        self.placesPage(false);
        self.transportPage(true);
        self.showPhotos(false);
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
    }
};

var VM = new ViewModel();