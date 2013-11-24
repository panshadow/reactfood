(function(window, undefined){
  var POIStorage = window.POIStorage = function(opt){
    var list = [];

    return {
      map: function(fn) {
        return Array.prototype.map.call(list, fn);
      },
      fetch: function(fn) {
        $.getJSON( opt.url, function(data){
          list = data;
          this.save();
          if (typeof fn === 'function') {
            fn();
          }
        }.bind(this));
      },
      save: function() {
        localStorage[opt.key] = JSON.stringify(list);
      },
      load: function(fn) {
        if ( opt.key in localStorage ) {
          list = JSON.parse(localStorage[opt.key]);
          fn();
        }
        else{
          this.fetch(fn);
        }
      },
      get: function(i) {
        return list[i];
      },
      set: function(i, item) {
        list[i] = item;
      }
    };
  }

}(this));
