// Source: https://gist.github.com/jarek-foksa/2648095

// Important: You must serve your pages as XHTML for this shim to work,
// otherwise namespaced attributes and elements will get messed up.
if(!SVGElement.prototype.hasOwnProperty('innerHTML')) {
Object.defineProperty(SVGElement.prototype, 'innerHTML', {
  get: function() {
    var $child, $node, $temp, _i, _len, _ref;
    $temp = document.createElement('div');
    $node = this.cloneNode(true);
    _ref = $node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      $child = _ref[_i];
      $temp.appendChild($child);
    }
    return $temp.innerHTML;
  },
  set: function(markup) {
    var $div, $element, $svg, _i, _len, _ref, _results;
    while (this.firstChild) {
      this.firstChild.parentNode.removeChild(this.firstChild);
    }
    markup = "<svg id='wrapper' xmlns='http://www.w3.org/2000/svg'>" + markup + "</svg>";
    $div = document.createElement('div');
    $div.innerHTML = markup;
    $svg = $div.querySelector('svg#wrapper');
    _ref = $svg.childNodes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      $element = _ref[_i];
      _results.push(this.appendChild($element));
    }
    return _results;
  },
  enumerable: false,
  configurable: true
});
}
