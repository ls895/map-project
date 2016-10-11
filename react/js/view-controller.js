



var update = React.addons.update;

var Navbar = ReactBootstrap.Navbar,
    Nav = ReactBootstrap.Nav,
    NavItem = ReactBootstrap.NavItem,
    MenuItem = ReactBootstrap.MenuItem,
    NavDropdown = ReactBootstrap.NavDropdown;

var NavTop = React.createClass({
    render: function() {
        return (
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">Trip Planner</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavItem eventKey={1} href="#">Daily Itinerary</NavItem>
                    <NavItem eventKey={2} href="#">Trip Planning</NavItem>
                    <NavDropdown eventKey={3} title="Dropdown" id="basic-nav-dropdown">
                        <MenuItem eventKey={3.1}>Action</MenuItem>
                        <MenuItem eventKey={3.2}>Another action</MenuItem>
                        <MenuItem eventKey={3.3}>Something else here</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey={3.3}>Separated link</MenuItem>
                    </NavDropdown>
                </Nav>
            </Navbar>
        );
    }
});

var MainPanel = React.createClass({
    render: function() {
        return (
            <div className="container-fluid no-padding">
                <ControlPanel />
                <MapPanel />
            </div>
        )
    }
});

var ControlPanel = React.createClass({
    render: function() {
        return (
            <div>
                <LocationList />
                <Transports />
            </div>
        )
    }
})

var MapPanel = React.createClass({
    render: function() {
        return (
            <div>
            </div>
        )
    }
})

var LocationList = React.createClass({
    getInitialState: function() {
        return {
            selectedDay: 1,
            places: PLACES
        };
    },
    handleDaySelect: function(selectedDay) {
        this.setState({
            selectedDay: selectedDay
        });
    },
    addToDay: function(day) {
        
    },
    rmFromDay: function(day, index) {
        day.splice(index, 1);
        this.setState({
            places: PLACES
        });
    },
    render: function() {
        return (
            <div>
                <DayPicker days={this.state.places} handleDaySelect={this.handleDaySelect} selectedDay={this.state.selectedDay} />
                <DayPlan places={this.state.places} rmFromDay={this.rmFromDay} selectedDay={this.state.selectedDay} />

            </div>
        );
    }
});

var Transports = React.createClass({
    render: function() {
        return (
            <div>
                <ul>
                </ul>
            </div>
        )
    }    
});


var DayPicker = React.createClass({
    handleClick: function(item) {
        this.props.handleDaySelect(item.name);
    },
    render: function() {
        var DayPicker = this;
        var days = DayPicker.props.days;
        var x = Object.keys(days).map(function(key) {
            return <li key={days[key].name} onClick={DayPicker.handleClick.bind(DayPicker, days[key])}>{days[key].name}</li>
        });
        return (
            <ul>
                {x}
            </ul>
        )
    }
});

var DayPlan = React.createClass({
    render: function() {
        var DayPlan = this;
        var selectedDay = this.props.selectedDay;
        var places = this.props.places;
        var selectedDailyPlan = places['DAY_' + selectedDay].plan;
        var dailyLocations = selectedDailyPlan.map(function(item) {
            return <Location key={item.id} rmFromDay={DayPlan.props.rmFromDay} place={item} day={selectedDailyPlan}/>;
        });
        return (
            <ul>
                {dailyLocations}
            </ul>
        )
    }
});

// var PlaceAdder = React.createClass({
//     render: function() {
//         return (
            
//         )
//     }    
// });

var Location = React.createClass({
    handleDelete: function(place) {
        var index = this.props.day.indexOf(place);
        var day = this.props.day;
        this.props.rmFromDay(day, index);
    },
    render: function() {
        return (            
            <li>
                {this.props.place.name}
                <button onClick={this.handleDelete.bind(this, this.props.place)}>Delete</button>
            </li>
        )
    }
});

var Drag = React.createClass({
    render: function() {
        return (            
            <button>Drag</button>
        )
    }
});

var OptionButton = React.createClass({
    render: function() {
        return (
            <ul>
                <Favourite />
                <DeleteButton />
                <TimePicker />
                <ModePicker />
            </ul>
        )
    }    
});

var Favourite = React.createClass({
    render: function() {
        return (
            <button>Favourite</button>    
        )
    }
})

var DeleteButton = React.createClass({
    render: function() {
        return (
            <button>Delete</button>    
        )
    }
})

var TimePicker = React.createClass({
    render: function() {
        return (
            <div>TimePicker</div>    
        )
    }
});

var ModePicker = React.createClass({
    render: function() {
        return (
            <div>ModePicker</div>    
        )
    }
});

var Root = React.createClass({
  render: function() {
    return (
        <div>
            <NavTop />
            <MainPanel />
        </div>
    )
  }
});

ReactDOM.render(<Root />, document.getElementById('container'));