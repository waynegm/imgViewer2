# Extending 
The imgViewer2 widget is built using the [jQuery UI Widget Factory](https://learn.jquery.com/jquery-ui/widget-factory/). Extending the functionaity of the widget is a reltively simple process as described in [Extending Widgets with the Widget Factory](https://learn.jquery.com/jquery-ui/widget-factory/extending-widgets/).

As an example let's extend the widget to show markers.
```javascript
$.widget("wgm.imgNotes2", $.wgm.imgViewer2, {
	options: {
/*
 *	Default action for addNote callback
*/
		addNote: function(data) {
			var map = this.map,
				loc = this.relposToLatLng(data.x, data.y);
			L.marker(loc).addTo(map).bindPopup(data.note);
		}
	},
/*
 *	Add notes from a javascript array
 */
	import: function(notes) {
		if (this.ready) {
			var self = this;
			$.each(notes, function() {
				self.options.addNote.call(self, this);
			});	
		}
	}
});
```
The underlying [Leaflet mapping library](http://leafletjs.com/) and associated [plugins](http://leafletjs.com/plugins.html) provide a lot of functionality for drawing and annotation allowing just a few lines of code to significantly extend the widget capability.