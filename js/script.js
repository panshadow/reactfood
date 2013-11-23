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

      console.log('map rebounded');

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

    console.log('map render');
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
        <POIsSideBar bounds={this.state.bounds} />
      </div>
      );
  },
  componentDidMount: function(rootNode) {
    var self = this;
    console.log('map mounted');
    this.googleMapInit();
  }
}),

POIsSideBar = React.createClass({

  inBounds: function(poi) {
    var isin = (
      poi.lng > this.props.bounds.sw.lng 
      && poi.lng < this.props.bounds.ne.lng
      && poi.lat > this.props.bounds.sw.lat
      && poi.lng < this.props.bounds.ne.lat
    );
    console.log(isin);
    return isin;
  },
  showPOI: function(poi) {
    return (<POIItem poi={poi} />);
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
    console.log('poi side bar render');
    return (
      <div className="panel side-bar right">
        <ul>
          {POIList.filter(this.inBounds).map(this.showPOI)}
        </ul>
      </div>
    )
  }
}),

POIItem = React.createClass({
  render: function(){
    console.log('poiItem render '+this.props.poi.name);
    return (<li>{this.props.poi.title}</li>);
  }
});



