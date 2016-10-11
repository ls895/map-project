var createStore = Redux.createStore;

var Place = function(name, position, id, arriveTime, departTime) {
    this.name = name;
    this.position = position;
    this.id = id;
    this.arriveTime = arriveTime;
    this.departTime = departTime;
};

var DAY_1 = {
    id: 1,
    plan: [
        new Place('HMS Belfast', {lat: 51.506579, lng: -0.08138899999994464}, 1, 1, 1),
        new Place('Big Ben', {lat: 51.50072919999999, lng: -0.12462540000001354}, 2, 1, 1),
        new Place('Westminster Bridge', {lat: 51.5008638, lng: -0.12196449999999004}, 3, 1, 1),
        new Place('London Eye', {lat: 51.503324, lng: -0.1195430000000215}, 4, 1, 1),
        new Place('Oxford Street', {lat: 51.5149255, lng: -0.14482590000000073}, 5, 1, 1),
        new Place('London School of Economics', {lat: 51.5144077, lng: -0.11737659999994321}, 6, 1, 1),
        new Place('King\'s College London', {lat: 51.51148639999999, lng: -0.11599699999999302}, 7, 1, 1),
        new Place('Old Royal Naval College', {lat: 51.4827375, lng: -0.008513499999935448}, 8, 1, 1)
    ]
};

var DAY_2 = {
    id: 2,
    plan: [
        new Place('HMS Belfast2', {lat: 51.506579, lng: -0.08138899999994464}, 1, 1, 1),
        new Place('Big Ben2', {lat: 51.50072919999999, lng: -0.12462540000001354}, 2, 1, 1),
        new Place('Westminster Bridge2', {lat: 51.5008638, lng: -0.12196449999999004}, 3, 1, 1),
        new Place('London Eye2', {lat: 51.503324, lng: -0.1195430000000215}, 4, 1, 1),
        new Place('Oxford Street2', {lat: 51.5149255, lng: -0.14482590000000073}, 5, 1, 1),
        new Place('London School of Economics2', {lat: 51.5144077, lng: -0.11737659999994321}, 6, 1, 1),
        new Place('King\'s College London2', {lat: 51.51148639999999, lng: -0.11599699999999302}, 7, 1, 1),
        new Place('Old Royal Naval College2', {lat: 51.4827375, lng: -0.008513499999935448}, 8, 1, 1)
    ]
};

var DAY_3 = {
    id: 3,
    plan: [
        new Place('HMS Belfast3', {lat: 51.506579, lng: -0.08138899999994464}, 1, 1, 1),
        new Place('Big Ben3', {lat: 51.50072919999999, lng: -0.12462540000001354}, 2, 1, 1),
        new Place('Westminster Bridge3', {lat: 51.5008638, lng: -0.12196449999999004}, 3, 1, 1),
        new Place('London Eye3', {lat: 51.503324, lng: -0.1195430000000215}, 4, 1, 1),
        new Place('Oxford Street3', {lat: 51.5149255, lng: -0.14482590000000073}, 5, 1, 1),
        new Place('London School of Economics3', {lat: 51.5144077, lng: -0.11737659999994321}, 6, 1, 1),
        new Place('King\'s College London3', {lat: 51.51148639999999, lng: -0.11599699999999302}, 7, 1, 1),
        new Place('Old Royal Naval College3', {lat: 51.4827375, lng: -0.008513499999935448}, 8, 1, 1)
    ]
};

var PLACES = [DAY_1, DAY_2, DAY_3];

var initialState = {
    activeDay: 1,
    PLACES
};

const ADD_PLACE = 'ADD_PLACE';

const RM_PLACE = 'RM_PLACE';

// const SORT_PLACE = 'SORT_PLACE';

const PICK_DAY = 'PICK_DAY';

function addPlace(place) {
    return {
        type: ADD_PLACE,
        place
    };
}

function rmPlace(index) {
    return {
        type: RM_PLACE,
        index
    };
}

function pickDay(day) {
    return {
        type: PICK_DAY,
        day
    };
}

function dayPlanner(state = [], action, activeDay) {
    switch (action.type) {
        case ADD_PLACE:
            return state.map((day, index) => {
                if (day.id == activeDay) {
                    return Object.assign({}, day, { 
                        plan: [
                            ...day.plan,
                            new Place(action.place, {lat: 51.506579, lng: -0.08138899999994464}, day.plan.length + 1, 1, 1)
                        ]
                    });
                } else {
                    return day;
                }
            });
        case RM_PLACE:
            return state.map((day, index) => {
                if (day.id == activeDay) {
                    return Object.assign({}, day, { 
                        plan: [
                            ...day.plan,
                            new Place(action.place, {lat: 51.506579, lng: -0.08138899999994464}, day.plan.length + 1, 1, 1)
                        ]
                    });
                } else {
                    return day;
                }
            });
    }
}

function tripPlanner(state = initialState, action) {
    switch (action.type) {
        case PICK_DAY:
            return Object.assign({}, state, {
                activeDay: action.day
            });
        case ADD_PLACE:
            return Object.assign({}, state, {
                PLACES: dayPlanner(state.PLACES, action, state.activeDay)
            });
        default:
            return state;
    }
}

let store = createStore(tripPlanner, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());