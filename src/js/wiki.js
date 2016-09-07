var wiki = {};

wiki.URL = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&redirects=1&titles={title}';

wiki.sendRequest = function(loc) {
    wiki.buildURL(loc.name);
    $.ajax({
        url: wiki.URL,
        dataType: 'jsonp'
    }).done((function(loc) {
        return function(data) {
            var pages = data.query.pages;
            var extract = pages[Object.keys(pages)[0]].extract;
            VM.setInfoWindowContent(loc, (loc.infoWindow.content + extract));
        }
    })(loc)).fail(function() {
        alert('Wikipedia content for ' + loc.name + ' cannot be loaded');
    });
}

wiki.buildURL = function(loc) {
    wiki.URL = wiki.URL.replace('{title}', loc);
}