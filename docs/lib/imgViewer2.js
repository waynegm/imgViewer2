/*
 * imgViewer2
 * 
 *
 * Copyright (c) 2013 Wayne Mogg
 * Licensed under the MIT license.
 */



var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) {
			uniqueId = "Don't call this twice without a uniqueId";
		}
		if (timers[uniqueId]) {
			clearTimeout (timers[uniqueId]);
		}
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();
/*
 *	imgViewer2 plugin starts here
 */
;(function($) {
	$.widget("wgm.imgViewer2", {
		options: {
			zoomStep: 0.5,
			zoomMax: undefined,
			zoomable: true,
			dragable: true,
			onClick: $.noop,
			onReady: $.noop
		},
		
		_create: function() {
			var self = this;
			if (!this.element.is("img")) {
				$.error('imgviewer plugin can only be applied to img elements');
			}
//		the original img element
			self.img = self.element[0];
			var $img = $(self.img);
/*
 *		a copy of the original image to be positioned over it and manipulated to
 *		provide zoom and pan
 */
			self.view = $("<div class='viewport' />").uniqueId().appendTo("body");
			var $view = $(self.view);
			self.map  = {};
			self.bounds = {};
//		a flag used to check the target image has loaded
			self.ready = false;
			self.resize = false;
			$img.one("load",function() {
//			get and some geometry information about the image
				self.ready = true;
				var	width = $img.width(),
					height = $img.height(),
					offset = $img.offset();
//			cache the image padding information
					self.offsetPadding = {
							top: parseInt($img.css('padding-top'),10),
							left: parseInt($img.css('padding-left'),10),
							right: parseInt($img.css('padding-right'),10),
							bottom: parseInt($img.css('padding-bottom'),10)
					};
/*
 *			cache the image margin/border size information
 *			because of IE8 limitations left and right borders are assumed to be the same width 
 *			and likewise top and bottom borders
 */
					self.offsetBorder = {
							x: Math.round(($img.outerWidth()-$img.innerWidth())/2),
							y: Math.round(($img.outerHeight()-$img.innerHeight())/2)
					};
/*
 *			define the css style for the view container using absolute positioning to
 *			put it directly over the original image
 */
					var vTop = offset.top + self.offsetBorder.y + self.offsetPadding.top,
						vLeft = offset.left + self.offsetBorder.x + self.offsetPadding.left;

					$view.css({
								position: "absolute",
								overflow: "hidden",
								top: vTop+"px",
								left: vLeft+"px",
								width: width+"px",
								height: height+"px"
					});
//			add the leaflet map
					self.bounds = L.latLngBounds(L.latLng(0,0), L.latLng(self.img.naturalHeight,self.img.naturalWidth));
					self.map = L.map($view.attr('id'), {crs:L.CRS.Simple,
														minZoom: -10,
														trackresize: false,
														maxBoundsViscosity: 1.0,
														attributionControl: false,
														inertia: false,
														zoomSnap: 0,
														wheelPxPerZoomLevel: Math.round(36/self.options.zoomStep),
														zoomDelta: self.options.zoomStep
					});
					self.zimg = L.imageOverlay(self.img.src, self.bounds).addTo(self.map);
					self.map.options.minZoom = self.map.getBoundsZoom(self.bounds,false);
					self.map.fitBounds(self.bounds);
					self.bounds = self.map.getBounds();
					self.map.setMaxBounds(self.bounds);
					if (self.options.zoomMax !== null) {
						var lzoom = self.leafletZoom(self.options.zoomMax);
						if (lzoom < self.map.getZoom()) {
							self.map.setZoom(lzoom);
						}
						self.map.options.maxZoom = lzoom;
					}
					if (!self.options.dragable) {
						self.map.dragging.disable();
					}
					if (!self.options.zoomable) {
						self.map.zoomControl.disable();
						self.map.boxZoom.disable();
						self.map.touchZoom.disable();
						self.map.doubleClickZoom.disable();
						self.map.scrollWheelZoom.disable();
					}
					self.map.on('click', function(ev) {
						if (self.options.onClick !== null) {
							self.options.onClick.call(self, ev.originalEvent, self.eventToImg(ev));
						}
					});
					self.map.on('zoomend', function() {
						if (self.options.zoomMax >= 1 && this.getZoom() > this.options.zoomMax) {
							this.setZoom(this.options.zoomMax);
						}
						if (!self.resize) {
							self.bounds = self.map.getBounds();
						}
					});
					self.map.on('moveend', function() {
						if (!self.resize) {
							self.bounds = self.map.getBounds();
						}
					});
					self.map.on('resize', function() {
						self.map.options.minZoom = -10;
						self.map.fitBounds(self.bounds,{animate:false});
						self.map.options.minZoom = self.map.getBoundsZoom(L.latLngBounds(L.latLng(0,0), L.latLng(self.img.naturalHeight,self.img.naturalWidth)),true);
						self.map.options.maxZoom = self.leafletZoom(self.options.zoomMax);
						waitForFinalEvent(function(){
							self.resize = false;
							self.map.options.minZoom = -10;
							self.map.fitBounds(self.bounds,{animate:false});
							self.map.options.minZoom = self.map.getBoundsZoom(L.latLngBounds(L.latLng(0,0), L.latLng(self.img.naturalHeight,self.img.naturalWidth)),true);
							self.map.options.maxZoom = self.leafletZoom(self.options.zoomMax);
						}, 300, $img[0].id);
					});
					self.options.onReady.call(self);
			}).each(function() {
				if (this.complete) { $(this).load(); }
			});
/*
/*
 *		Window resize handler
 */
			$(window).resize(function() {
				if (self.ready) {
					self.resize = true;
					var $img = $(self.img),
						width = $img.width(),
						height = $img.height(),
						offset = $img.offset();
  
					var vTop = Math.round(offset.top + self.offsetBorder.y + self.offsetPadding.top),
					vLeft = Math.round(offset.left + self.offsetBorder.x + self.offsetPadding.left);
					$(self.view).css({
								top: vTop+"px",
								left: vLeft+"px",
								width: width+"px",
								height: height+"px"
					});
					self.map.invalidateSize({animate: false});
				}
			});
		},
/*
 *	Remove the plugin
 */  
		destroy: function() {
			$(window).unbind("resize");
			this.map.remove();
			$(this.view).remove();
			$.Widget.prototype.destroy.call(this);
		},
  
		_setOption: function(key, value) {
			switch(key) {
				case 'zoomStep':
					if (parseFloat(value) <= 0 ||  isNaN(parseFloat(value))) {
						return;
					}
					break;
				case 'zoomMax':
					if (parseFloat(value) < 1 || isNaN(parseFloat(value))) {
						return;
					}
					break;
			}
			var version = $.ui.version.split('.');
			if (version[0] > 1 || version[1] > 8) {
				this._super(key, value);
			} else {
				$.Widget.prototype._setOption.apply(this, arguments);
			}
			switch(key) {
				case 'zoomStep':
					if (this.ready) {
						this.map.options.zoomDelta = this.options.zoomStep;
						this.map.options.wheelPxPerZoomLevel = Math.round(60/this.options.zoomStep);
					}
					break;
				case 'zoomMax':
					if (this.ready) {
						lzoom = this.leafletZoom(this.options.zoomMax);
						if (lzoom < this.map.getZoom()) {
							this.map.setZoom(lzoom);
						}
						this.map.options.maxZoom = lzoom;
						this.map.fire('zoomend');
					}
					break;
				case 'zoomable':
					if (this.options.zoomable) {
						this.map.zoomControl.enable();
						this.map.boxZoom.enable();
						this.map.touchZoom.enable();
						this.map.doubleClickZoom.enable();
						this.map.scrollWheelZoom.enable();
					} else {
						this.map.zoomControl.disable();
						this.map.boxZoom.disable();
						this.map.touchZoom.disable();
						this.map.doubleClickZoom.disable();
						this.map.scrollWheelZoom.disable();
					}
					break;
				case 'dragable':
					if (this.options.dragable) {
						this.map.dragging.enable();
					} else {
						this.map.dragging.disable();
					}
					break;
			}
		},
/*
 *	Test if a relative image coordinate is visible in the current view
 */
		isVisible: function(relx, rely) {
			var view = this.getView();
			if (view) {
				return (relx >= view.left && relx <= view.right && rely >= view.top && rely <= view.bottom);
			} else {
				return false;
			}
		},
/*
 *	Convert a user supplied zoom to a Leaflet zoom
*/
		leafletZoom: function(zoom) {
			if (this.ready && zoom !== undefined) {
				var img = this.img,
					map = this.map,
					lzoom = map.getZoom() || 0,
					size = map.getSize(),
					width = img.naturalWidth,
					height = img.naturalHeight,
					nw = L.latLng(height/zoom,width/zoom),
					se = L.latLng(0,0),
					boundsSize = map.project(nw, lzoom).subtract(map.project(se, lzoom));

				var scale = Math.min(size.x / boundsSize.x, -size.y / boundsSize.y);
				return map.getScaleZoom(scale, lzoom);
			} else {
				return undefined;
			}
		},
/*
 *	Get the Leaflet map object
*/
		getMap: function() {
			if (this.ready) {
				return this.map;
			}
			else {
				return null;
			}
		},
/*
 *	Get current zoom level
 *	Returned zoom will always be >=1
 *	a zoom of 1 means the entire image is just visible within the viewport
 *	a zoom of 2 means half the image is visible in the viewport etc
*/
		getZoom: function() {
			if (this.ready) {
				var img = this.img,
					map = this.map,
					width = img.naturalWidth,
					height = img.naturalHeight,
					constraint = this.options.constraint,
					bounds = map.getBounds();
				if (constraint == 'width' ) {
					return Math.max(1, width/(bounds.getEast()-bounds.getWest()));
				} else if (constraint == 'height') {
					return Math.max(1,height/(bounds.getNorth()-bounds.getSouth()));
				} else {
					return Math.max(1, (width/(bounds.getEast()-bounds.getWest()) + height/(bounds.getNorth()-bounds.getSouth()))/2);
				}
			} else {
				return null;
			}
		},
/*
 *	Set the zoom level
 *	Zoom must be >=1
 *	a zoom of 1 means the entire image is just visible within the viewport
 *	a zoom of 2 means half the image is visible in the viewport etc
*/
		setZoom: function( zoom ) {
			if (this.ready) {
				zoom = Math.max(1, zoom);
				if (this.options.zoomMax !== null) {
					zoom = Math.min(zoom, this.options.zoomMax);
				}
				var img = this.img,
					map = this.map,
					width = img.naturalWidth,
					height = img.naturalHeight,
					constraint = this.options.constraint,
					center = map.getCenter(),
					bounds = map.getBounds();
				var hvw, hvh;
				if (constraint == 'width') {
					hvw = width/zoom/2;
					hvh = hvw * (bounds.getNorth()-bounds.getSouth())/(bounds.getEast()-bounds.getWest());
				} else if (constraint == 'height') {
					hvh = height/zoom/2;
					hvw = hvh * (bounds.getEast()-bounds.getWest())/(bounds.getNorth()-bounds.getSouth());
				} else {
					hvw = width/zoom/2;
					hvh = height/zoom/2;
				}
						
				var	east = center.lng + hvw,
					west = center.lng - hvw,
					north = center.lat + hvh,
					south = center.lat - hvh;
				if (west<0) {
					east += west;
					west = 0;
				} else if (east > width) {
					west -= east-width;
					east = width;
				}
				if (south<0) {
					north += south;
					south = 0;
				} else if (north > height) {
					south -= north-height;
					north = height;
				}
				map.fitBounds(L.latLngBounds(L.latLng(south,west), L.latLng(north,east)),{animate:false});
			}
			return this;
		},
/*
 *	Get relative image coordinates of current view
 */
		getView: function() {
			if (this.ready) {
				var img = this.img,
					width = img.naturalWidth,
					height = img.naturalHeight,
					bnds = this.map.getBounds();
			 return {
					top: 1 - bnds.getNorth()/height,
					left: bnds.getWest()/width,
					bottom: 1 - bnds.getSouth()/height,
					right: bnds.getEast()/width
				};
			} else {
				return null;
			}
		},
/*
 *	Pan the view to be centred at the given relative image location
 */
		panTo: function(relx, rely) {
			if ( this.ready && relx >= 0 && relx <= 1 && rely >= 0 && rely <=1 ) {
				var img = this.img,
					map = this.map,
					bounds = this.bounds,
//					bounds = map.getBounds(),
					east = bounds.getEast(),
					west = bounds.getWest(),
					north = bounds.getNorth(),
					south = bounds.getSouth(),
					centerX = (east+west)/2,
					centerY = (north+south)/2,
					width = img.naturalWidth,
					height = img.naturalHeight,
					newY = (1-rely)*height,
					newX = relx*width;
				east += newX - centerX;
				west += newX - centerX;
				north += newY - centerY;
				south += newY - centerY;
				if (west<0) {
					east += west;
					west = 0;
				} else if (east > width) {
					west -= east-width;
					east = width;
				}
				if (south<0) {
					north += south;
					south = 0;
				} else if (north > height) {
					south -= north-height;
					north = height;
				}
				map.fitBounds(L.latLngBounds(L.latLng(south,west), L.latLng(north,east)),{animate:false});
			}
			return this;
		},
/*
 *	Return the relative image coordinate for a Leaflet event 
 */		
		eventToImg: function(ev) {
			if (this.ready) {
				var img = this.img,
					width = img.naturalWidth,
					height = img.naturalHeight;
				relx = ev.latlng.lng/width;
				rely = 1 - ev.latlng.lat/height;
				if (relx>=0 && relx<=1 && rely>=0 && rely<=1) {
					return {x: relx, y: rely};
				} else {
					return null;
				}
			} else {
				return null;
			}
		},
/*
 * Convert relative image coordinate to Leaflet LatLng point
 */
		relposToLatLng: function(x,y) {
			if (this.ready) {
				var img = this.img,
					width = img.naturalWidth,
					height = img.naturalHeight;
				return L.latLng((1-y)*height, x*width);
			} else {
				return null;
			}
		},
/*
 * Convert relative image coordinate to Image pixel
 */
		relposToImage: function(pos) {
			if (this.ready) {
				var img = this.img,
					width = img.naturalWidth,
					height = img.naturalHeight;
				return {x: Math.round(pos.x*width), y: Math.round(pos.y*height)};
			} else {
				return null;
			}
		}
	});
})(jQuery);
