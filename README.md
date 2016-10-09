## Interactive Map Project
This is a representation of a interactive map built for the Project 5 of the Udacity Frontend Nanodegree (Project: Neighborhood Map).

### Getting started
Source files are located in the `src` directory.

__To view the site:__

[ls895.github.io/map-project/](http://ls895.github.io/map-project/) hosts a post-runner running version of the site on the `gh-pages` branch on the `dist` directory.

__To build the production site:__

* Fork and clone the repo.

* Install the `npm` package manager.

* Then in terminal run the following commands:

`npm install -g grunt-cli` to install the Grunt command line interface.

* `Cd` to the repository directory, ensure `package.json` and `Gruntfile.js` exist:

`npm install` to install all the dependencies required for the task runner.

After installing the packages, run `grunt default` to build the site into the output directory `dist`.

### Description of site
The site is organised in 3 sections:

Places, transports and the main map view

Map View is hidden initially on mobile devices viewport. Click the map button at bottom of viewport to show the map (map button is not shown on larger viewports) at any time. Click places or transports again to bring up their corresponding page overlapping the map.

__Places__:

Base Page:

1. Filtering text can be entered to filter the locations.

2. Edit button next to the filtering text can be clicked to enter edit mode, allowing locations to be sorted, added or deleted.

3. Click directly on a location to open additional information about the location:
   * a Flickr image (in detail page)

   * a Wikipedia article (in detail page)

   * a InfoWindow at the location marker on the map

Edit Mode:

1. Drag and Drag the locations by clicking directly on them to sort them in a different order.

2. Click the delete button to remove a location (corresponding marker on the map is also deleted).

3. Fill in text to search for a location using Google Places and add it to the list (corresponding marker on the map is also added).

4. Any changes made to the location list such as sorting, adding and deleting are reflected on the transports page and the main map.

Detail Page:

1. Exit detail page by clicking the back button (left arrow) at bottom of viewport.

__Transports__:

Base Page:

Direction request is available for any 2 succeeding locations.

1. Select the 1 out of the 3 transit methods.

2. Pick a departure time.

3. Click request.

4. Time and distance needed is shown when request is successful.

5. Click detail to open a detailed direction page.

Direction Page:

1. Google directions detail is shown.

2. Exit direction page by clicking the back button (left arrow) at bottom of viewport.

Anytime a direction is successfully requested, the graphical detail is also drawn on the main map to show the result.

__Main Map__:

Clicking on a marker has the same effect as clicking directly on a location on the places page (bringing up a info window and the detail page).

Click on the resize button (double arrow) at bottom of viewport to resize/ rezoom the map based on the distribution of the map markers.

###Frameworks and libraries###

The following libraries, APIs and information sources are utilized in the site:

* __Knockout JS__ for the MVVM application structure and framework.

* __Google Map API__ for all map related functions and services, __Google Places__ for searching location and lat long information, __Google Directions__ service for getting transit direction between locations.

* __Bootstrap__ for appearance, responsiveness and layout design.

* __jQuery__, __jQuery UI__ for utility functions in creating custom Knockout bindings. Sortable function is extended by jQuery UI.

* __Font Awesome__ for various icon fonts used in buttons.

* __ko-calendar__ as a Knockout JS plugin for the time picker widget on transports page.

* __MediaWiki API__ for Wikipedia articles ajax request.

* __Flickr API__ for Flickr images ajax request.