# Options
Thw widget options can be set at the time of creation:
```javascript
var $img = $("#image1").imgViewer2({
	zoomMax: 6,
	onClick: function( e, pos ) {
				var v = this.getView();
				$("#position").html("relx: " + pos.x + " rely: " + pos.y + " zoom: " + this.getZoom() );
	}
});

```
or afterwards by:
```javascript
$img.imgViewer2("option", "zoomMax", 6);
```
The current value of an option can be retrieved by:
```javascript
$img.imgViewer2("option", "zoomMax");
```

##dragable
  * Controls if image will be dragable
  * Default: true
  * Example - to disable image dragging:

```javascript
$("#image1").imgViewer("option", "dragable", false);
```
##zoomable
  * Controls if image will be zoomable
  * Default: true
  * Example - to disable image zooming:

```javascript
$("#image1").imgViewer("option", "zoomable", false);
```

##zoomStep
  * How much the zoom changes for each mousewheel click - must be a positive number
  * Default: 0.5
  * Example:

```javascript
$("#image1").imgViewer("option", "zoomStep", 1.0);
```

##zoomMax
  * Get/Set the limit on the maximum zoom level of the image - must be >= 1
  * Default: null ie no limit on zoom
  * Example - to restrict zoom to 3x or less:

```javascript
$("#image1").imgViewer("option", "zoomMax", 3);
```

##onClick
  * Callback triggered by a mouseclick on the image. Within the callback "this" refers to the imgViewer widget.
  * Default: null
  * Callback Arguments:
    * e: the original click event object
    * pos: 	javascript object with the relative image coordinates
        * { x: relative x image coordinate, y: relative y image coordinate }
  * Example - to display the relative image coordinate clicked (relative image coordinates range from 0 to 1
   where 0,0 correspondes to the topleft corner and 1,1 the bottom right):
   
```javascript
$("#image1").imgViewer("option", "onClick", function(e, pos) {
	$("#click_position").html(pos.x + " " + pos.y);
});
```
##onReady
  * Callback triggered when the widget has been all set up and is ready to be used. Within the callback "this" refers to the imgViewer widget.
  * Default: null
  * Callback Arguments: none
  * Example - to set the zoom to 3 and move to the bottom right hand corner
   
```javascript
$("#image1").imgViewer("option", "onReady", function() {
	this.setZoom(3).panTo(1,1);
});
```
