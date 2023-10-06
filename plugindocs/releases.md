# Release History
## 1.3.0
- added option zoomCrisp
- added option zoomHires
- the destroy call no loger removes the onresize function (is often used wider)

## 1.2.0
- update dependencies to address security vulnerabilities
- insert widget as child of the target image container (previously just appended to page) fixes issue with images in bootstrap modals
- use $img.position() instead of $img.offset() to determine location of image

## 1.1.0
- now can either activate plugin on an img tag or on a div tag that contains one or more img tags.
- in setZoom trap if maxZoom is undefined

## 1.0.3
- fix logic in panTo function so zoom does not change

## 1.0.2
- remove call to jQuery depreciated img.load() event trigger

## 1.0.0
- First release 
