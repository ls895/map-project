var flickr = {};

flickr.API_KEY = '148419e552f69164e56198093ea40634';

flickr.URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
    
flickr.sendRequest = function(loc) {
    flickr.buildURL(loc.name);
    $.ajax({
        url: flickr.URL
    }).done((function(loc) {
        return function(data) {
            VM.photoArray.removeAll();
            var photo = data.photos.photo;
            VM.openPhoto();
            for (var i = 0; i < photo.length; i++) {
                var ImageURL = flickr.buildImageURL(photo[i]);
                VM.photoArray.push({url: ImageURL});
            }
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
    flickr.URL += '&per_page=' + 10;
}

flickr.buildImageURL = function(photo) {
    var ImageURL = 'https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg'
    ImageURL = ImageURL.replace('{farm-id}', photo.farm);
    ImageURL = ImageURL.replace('{server-id}', photo.server);
    ImageURL = ImageURL.replace('{id}', photo.id);
    ImageURL = ImageURL.replace('{secret}', photo.secret);
    return ImageURL;
};