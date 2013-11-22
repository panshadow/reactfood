/** @jsx React.DOM */

var googleMapInit = function(mapNode, bounds, mapCreated){
  google.maps.event.addDomListener(window, 'load', function(){
    var mapOptions = {},
      map = new google.maps.Map(mapNode, mapOptions);
      mapBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds[0], bounds[1]),
          new google.maps.LatLng(bounds[2], bounds[3])
        );
      
      map.fitBounds(mapBounds);

      /*google.maps.event.addListener(map, 'bounds_changed', function(evt){
        var bound = map.getBounds(),
          sw = bound.getSouthWest(),
          ne = bound.getNorthEast();

          console.log('bound: [%f,\n%f,\n%f,\n%f ]',sw.lat(),sw.lng(),ne.lat(),ne.lng());
      });*/


      if (typeof mapCreated === 'function') {
        mapCreated(map);
      }
  });

};

var mapComponent = React.createClass({
  render: function() {
    return (
      <div className="google-map" />
      );
  },
  componentDidMount: function(rootNode) {
    var self = this;
    googleMapInit(rootNode, this.props.bounds);
  }
});


