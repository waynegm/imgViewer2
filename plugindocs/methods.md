# Methods
##eventToImg
  * Convert a leaflet event location to relative image coordinates
  * Arguments:
    * e: leaflet event
  * Returns a javascript object with the relative image coordinates:
	* { x: relative x image coordinate, y: relative y image coordinate }
  * Returns null if the event location is invalid or the widget is not ready.

##getView
  * Get the relative image coordinates of the current view
  * Returns a javascript object with the relative image coordinates:
	* { top: minimum relative y coordinate,
	*	left: minimum relative x coordinate,
	*	bottom: maximum relative y image coordinate,
	*	right: maximum relative x coordinate
	* }

##getMap
  * Return the Leaflet map object or null if the widget is not ready

##getZoom
  * Get the current zoom level
  * Returned zoom will always be >=1
  * Note this is not the same as the Leaflet zoom:
    * a zoom of 1 means the entire image is just visible within the viewport
    * a zoom of 2 means half the image is visible etc

##isVisible
  * Test if a given relative image coordinate is within the bounds of the current view
  * Arguments:
	* relx: relative x image coordinate
	* rely: relative y image coordinate
  * Returns
	* true or false

##leafletZoom
  * Convert an imgViewer zoom to a Leaflet zoom
  * Arguments:
    * zoom: the imgViewer zoom , must be >=1
  * Returns the equivalent Leaflet zoom
  * Returns null if the widget isn't ready

##panTo
  * Pan the view to be centered at the given relative image coordinates
  * Arguments:
	* relx: relative x image coordinate
	* rely: relative y image coordinate
  * Returns:
    * a reference to the imgViewer object  

##relposToLatLng
  * Convert relative image coordinates to a Leaflet LatLng 
  * Arguments:
	* relx: relative x image coordinate
	* rely: relative y image coordinate
  * Returns: 
    * Leaflet L.LatLng
  * Returns null if the widget isn't ready

##relposToImage
  * Convert relative image coordinates to image pixel
  * Arguments:
    * pos: javascript object {x: , y: }
  * Returns:
    * javascript object {x: , y: }

##setZoom
  * Set the zoom level
  * Arguments:
    * zoom: the new imgViewer zoom, must be >=1
  * Returns:
    * a reference to the imgViewer object  
 
