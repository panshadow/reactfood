/** @jsx React.DOM */

var mapComponent = React.createClass({
  googleMapInit: function() {
    var mapOptions = {},
      bounds = this.props.cf.bounds,
      map = new google.maps.Map(this.refs.map.getDOMNode(), mapOptions),
      mapBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds[0], bounds[1]),
          new google.maps.LatLng(bounds[2], bounds[3])
        );

    google.maps.event.addListener(map, 'bounds_changed', this.handleChangeBounds);
    this.setState({
      map: map
    });
    
    map.fitBounds(mapBounds);
  },
  handleChangeBounds: function(evt) {
    var bound = this.state.map.getBounds(),
      sw = bound.getSouthWest(),
      ne = bound.getNorthEast();


      this.setState({
        bounds: {
          sw: {
            lat: sw.lat(),
            lng: sw.lng()
          },
          ne: {
            lat: ne.lat(),
            lng: ne.lng()
          }
        }
      });

      this.handleToggleDetails(null);
  },
  handleToggleDetails: function(poi, index) {
    if (poi!== null) {
      this.refs.details.setState({
        poi: poi,
        index: index
      });
      this.setState({
        showDetails: true
      });
    }
    else{
      this.setState({
        showDetails: false
      });
      this.forceUpdate();
    }
  },
  getInitialState: function() {
    return {
      map: null,
      showDetails: false,
      bounds: {
        sw: {
          lat: 0,
          lng: 0
        },
        ne: {
          lat: 0,
          lng: 0
        }
      }
    };
  },
  getDefaultProps: function() {
    return {
      cf: {
        bounds: [0,0,0,0],
        showList: false
      }
    };
  },
  render: function() {
    var bounds = this.state.bounds,
      showDetails = this.state.showDetails;

    return (
      <div className="map-component">
        <div ref="map" className="map" />
        <div ref="boundsLabel" className="panel bounds-label">
          {
            [bounds.sw.lat.toFixed(2),
             bounds.sw.lng.toFixed(2),
             bounds.ne.lat.toFixed(2),
             bounds.ne.lng.toFixed(2)].join(', ')
           }
        </div>
        <POIDetails 
          ref="details" 
          list={this.props.list}
          handleToggleDetails={this.handleToggleDetails} 
          show={showDetails} />
        <POIList 
        show={this.props.cf.showList}
          bounds={this.state.bounds} 
          list={this.props.list} 
          map={this.state.map} 
          handleToggleDetails={this.handleToggleDetails} />
      </div>
      );
  },
  componentDidMount: function(rootNode) {
    this.googleMapInit();
  }
}),

POIList = React.createClass({

  inBounds: function(poi) {
    var isin = (
      poi.lng > this.props.bounds.sw.lng 
      && poi.lng < this.props.bounds.ne.lng
      && poi.lat > this.props.bounds.sw.lat
      && poi.lng < this.props.bounds.ne.lat
    );
    return isin;
  },
  getDefaultProps: function() {
    return {
      bounds: {
        sw: {
          lat: 0,
          lng: 0
        },
        ne: {
          lat: 0,
          lng: 0
        }
      }
    };
  },
  render: function() {
    var list = this.props.list.map(function(poi, index) {
      return (<POI 
        poi={poi}
        index={index}
        map={this.props.map} 
        show={this.inBounds(poi)} 
        handleToggleDetails={this.props.handleToggleDetails} />);
    }.bind(this));
    return (
      <div className="panel side-bar right" style={{display:this.props.show?'block':'none'}}>
        <ul>
          {list}
        </ul>
      </div>
    )
  }
}),
POI = React.createClass({
  getInitialState: function() {
    var marker = new google.maps.Marker({
        title: this.props.poi.title+'//'+this.props.poi.address.street,
        position: new google.maps.LatLng(this.props.poi.lat, this.props.poi.lng),
      });

    google.maps.event.addListener(marker, 'click', this.handleClick);
    return {
      marker: marker
    };
  },
  getDefaultProps: function() {
    return {
      show: false
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextProps.show !== this.props.show;
  },
  handleClick: function() {
    this.props.handleToggleDetails(this.props.poi, this.props.index);
  },
  render: function() {
    if (this.props.show) {

      this.state.marker.setMap(this.props.map);
    }
    else {
      this.state.marker.setMap(null);
    }

    return (
      <li onClick={this.handleClick}
        key={this.props.poi.name} 
        style={{display: this.props.show ? 'list-item' : 'none'} } >
        <h3>{this.props.poi.title}</h3> 
      </li>);
  }
}),
POIDetails = React.createClass({
  getInitialState: function() {
    return {
      poi: {
        title: '',
        address: {
          street: ''
        },
        info: {
          note: ''
        }
      }
    }
  },
  handleClose: function() {
    this.props.handleToggleDetails(null);
  },
  handleChangeTitle: function(value) {
    var poi = this.props.list.get(this.state.index);
    poi.title = value;
    this.props.list.set(this.state.index, poi);
    this.props.list.save();

    this.setState({ poi: poi });

  },
  render: function() {
    var categories = [];

    if(this.state.poi.category) {
      this.state.poi.category.map(function(cat) {
        categories.push(<span className="category">{cat}</span>);
      });
    }

    return (
      <div className="panel details" style={{display: this.props.show ? 'block' : 'none'}}>
        <button onClick={this.handleClose}>close</button>
        <h3>
          <EditableString onSave={this.handleChangeTitle}>{this.state.poi.title}</EditableString>
        </h3>
        <address>{this.state.poi.address.street} ({this.state.poi.lat}, {this.state.poi.lng})</address>
        <p className="info">{this.state.poi.info.note}</p>

        <div className="categories">
          {categories}
        </div>
      </div>
    );
  }
}),
EditableString = React.createClass({
  getInitialState: function() {
    return {
      editable: false
    };
  },
  toggleEdit: function() {
    if (this.state.editable) {
      this.setState({
        editable: false
      });
      this.props.onSave(this.state.value);
    }
    else {
      this.setState({
        editable: true,
        value: this.props.children
      });
    }
  },
  handleChange: function(event) {
    this.setState({value: event.target.value });
  },
  handleKeys: function(event) {
    if( event.keyCode === 13) {
      this.toggleEdit();
    }
  },
  componentDidUpdate: function() {
    if (this.state.editable) {
      this.refs.input.getDOMNode().focus();
    }
  },
  render: function() {
    if (this.state.editable) {
      return (
        <input 
          ref="input"
          type="text" 
          value={this.state.value}
          onKeyPress={this.handleKeys}
          onChange={this.handleChange}
          onBlur={this.toggleEdit} />
      )
    }
    else{
      return (
        <span onDoubleClick={this.toggleEdit}>{this.props.children}</span>
      )
    }
  }
})
;