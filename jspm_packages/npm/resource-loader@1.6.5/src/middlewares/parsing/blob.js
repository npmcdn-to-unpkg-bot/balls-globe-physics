/* */ 
var Resource = require('../../Resource'),
    b64 = require('../../b64');
var Url = window.URL || window.webkitURL;
module.exports = function() {
  return function(resource, next) {
    if (!resource.data) {
      return next();
    }
    if (resource.xhr && resource.xhrType === Resource.XHR_RESPONSE_TYPE.BLOB) {
      if (!window.Blob || typeof resource.data === 'string') {
        var type = resource.xhr.getResponseHeader('content-type');
        if (type && type.indexOf('image') === 0) {
          resource.data = new Image();
          resource.data.src = 'data:' + type + ';base64,' + b64.encodeBinary(resource.xhr.responseText);
          resource.isImage = true;
          resource.data.onload = function() {
            resource.data.onload = null;
            next();
          };
        }
      } else if (resource.data.type.indexOf('image') === 0) {
        var src = Url.createObjectURL(resource.data);
        resource.blob = resource.data;
        resource.data = new Image();
        resource.data.src = src;
        resource.isImage = true;
        resource.data.onload = function() {
          Url.revokeObjectURL(src);
          resource.data.onload = null;
          next();
        };
      }
    } else {
      next();
    }
  };
};
