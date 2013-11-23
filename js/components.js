/** @jsx React.DOM */

var mapComponent = React.createClass({
  googleMapInit: function(){
    var self = this;
    google.maps.event.addDomListener(window, 'load', function(){
      var mapOptions = {},
        bounds = self.props.bounds,
        map = new google.maps.Map(self.refs.map.getDOMNode(), mapOptions),
        mapBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds[0], bounds[1]),
            new google.maps.LatLng(bounds[2], bounds[3])
          );

        google.maps.event.addListener(map, 'bounds_changed', self.handleChangeBounds);
        self.setState({
          map: map
        });
        
        map.fitBounds(mapBounds);


    });

  },
  handleChangeBounds: function(evt){
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
  },

  getDefaultProps: function() {
    return {
      showList: false
    };
  },
  getInitialState: function() {
    return {
      map: null,
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
    var bounds = this.state.bounds;

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
        <POIList bounds={this.state.bounds} list={this.props.list} map={this.state.map} />
      </div>
      );
  },
  componentDidMount: function(rootNode) {
    var self = this;
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
  getDefaultProps: function(){
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
    var list = this.props.list.filter(this.inBounds).map(function(poi){
      return (<POI poi={poi} map={this.props.map} />)
    }.bind(this));
    return (
      <div className="panel side-bar right">
        <ul>
          {list}
        </ul>
      </div>
    )
  }
}),

POI = React.createClass({
  getInitialState: function(){
    return {
      marker: new google.maps.Marker({
        title: this.props.poi.title+'//'+this.props.poi.address.street,
        position: new google.maps.LatLng(this.props.poi.lat, this.props.poi.lng),
      })
    };
  },
  componentWillUnmount: function(){
    this.state.marker.setMap(null);
  },
  componentWillMount: function(){
    this.state.marker.setMap(this.props.map);
  },
  componentWillReceiveProps: function(nextProp) {
    if(this.props.poi.name !== nextProp.poi.name) {
      this.state.marker.setPosition( 
        new google.maps.LatLng(this.props.poi.lat, this.props.poi.lng) 
      );
      //console.log('!!! %s <> %s',this.props.poi.name,nextProp.poi.name);
    }
  },
  render: function(){
    var categories = [];
    if( 'category' in this.props.poi){
      categories = this.props.poi.category.map(function(cat){
        return (<span className="category">{cat}</span>);
      });
    };


    return (
      <li key={this.props.poi.name}>
        <h3>{this.props.poi.title}</h3>
        {categories}
      </li>);
  }
});



