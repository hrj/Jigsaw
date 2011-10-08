/* Copyright 2010 Harshad RJ
 * License : Apache License
 */

// Flickr API key. You need to get a unique key by registering with Flickr
var FLICKR_API_KEY = 'paste your own key here';

// Alias to reduce size of JS file
var M = Math;

// The following code adapted from http://stackoverflow.com/questions/190560/jquery-animate-backgroundcolor
$.each(["backgroundColor"], function(f,e){
 $.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[M.max(M.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),M.max(M.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),M.max(M.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}
 });
function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[$.trim(f).toLowerCase()]}
function c(g,e){var f;do{f=$.curCSS(g,e);if(f!=""&&f!="transparent"||$.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}
var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}

// Wrapper object, to help minification
var MA = new function() {
	var _uuid = new Date().getTime(),
      svgNS = 'http://www.w3.org/2000/svg',
      xlinkNS = 'http://www.w3.org/1999/xlink',
      origImgTxt = 'Original image',
      myNull = null,
      svg = myNull,
      svgDefs = myNull,
      arena = {},
      containerObj = $('#world'),
      container = containerObj.get(0),
      currPageNum = 1,
      photos = [], currJigsaw,
      photoHashPattern = /#photo_([0-9]+)/,
      photoHashIgnorePattern = /(.*)#.*/,
      apiKey = FLICKR_API_KEY;

  function updateStatus(text,hint) {
    $('#status').html(text + (hint ? '<p id="hint">'+hint+'</p>' : '') );
  }

  // animation code adapted from jquery.svg plugin

  // Enable animation for the SVG transform attribute
  $.fx.step['svgTransform'] = $.fx.step['svg-transform'] = function(fx) {
    var attr = fx.elem.attributes.getNamedItem('transform');
    if (!fx.set) {
      fx.start = parseTransform(attr ? attr.nodeValue : '');
      fx.end = parseTransform(fx.end, fx.start);
      fx.set = true;
    }
    var transform = '';
    for (var i = 0; i < fx.end.order.length; i++) {
      switch (fx.end.order.charAt(i)) {
        case 'r':
          transform += (fx.start.rotateA != fx.end.rotateA ||
            fx.start.rotateX != fx.end.rotateX || fx.start.rotateY != fx.end.rotateY ?
            ' rotate(' + (fx.pos * (fx.end.rotateA - fx.start.rotateA) + fx.start.rotateA) + ',' +
            (fx.pos * (fx.end.rotateX - fx.start.rotateX) + fx.start.rotateX) + ',' +
            (fx.pos * (fx.end.rotateY - fx.start.rotateY) + fx.start.rotateY) + ')' : '');
          break;
        case 't':
          transform += (fx.start.translateX != fx.end.translateX || fx.start.translateY != fx.end.translateY ?
            ' translate(' + (fx.pos * (fx.end.translateX - fx.start.translateX) + fx.start.translateX) + ',' +
            (fx.pos * (fx.end.translateY - fx.start.translateY) + fx.start.translateY) + ')' : 'translate('+[fx.start.translateX,fx.start.translateY].join(',')+')');
          break;
/*
        case 's':
          transform += (fx.start.scaleX != fx.end.scaleX || fx.start.scaleY != fx.end.scaleY ? 
            ' scale(' + (fx.pos * (fx.end.scaleX - fx.start.scaleX) + fx.start.scaleX) + ',' +
            (fx.pos * (fx.end.scaleY - fx.start.scaleY) + fx.start.scaleY) + ')' : '');
          break;
        case 'x':
          transform += (fx.start.skewX != fx.end.skewX ?
            ' skewX(' + (fx.pos * (fx.end.skewX - fx.start.skewX) + fx.start.skewX) + ')' : '');
        case 'y':
          transform += (fx.start.skewY != fx.end.skewY ?
            ' skewY(' + (fx.pos * (fx.end.skewY - fx.start.skewY) + fx.start.skewY) + ')' : '');
          break;
        case 'm':
          var matrix = '';
          for (var j = 0; j < 6; j++) {
            matrix += ',' + (fx.pos * (fx.end.matrix[j] - fx.start.matrix[j]) + fx.start.matrix[j]);
          }				
          transform += ' matrix(' + matrix.substr(1) + ')';
          break;
*/
      }
    }
    (attr ? attr.nodeValue = transform : fx.elem.setAttribute('transform', transform));
  };

  /* Decode a transform string and extract component values.
     @param  value     (string) the transform string to parse
     @param  original  (object) the settings from the original node
     @return  (object) the combined transformation attributes */
  function parseTransform(value, original) {
    value = value || '';
    if (typeof value == 'object') {
      value = value.nodeValue;
    }
    var transform = $.extend({translateX: 0, translateY: 0, scaleX: 0, scaleY: 0,
      rotateA: 0, rotateX: 0, rotateY: 0, skewX: 0, skewY: 0,
      matrix: [0, 0, 0, 0, 0, 0]}, original || {});
    transform.order = '';
    var pattern = /([a-zA-Z]+)\(\s*([+-]?[\d\.]+)\s*(?:[\s,]\s*([+-]?[\d\.]+)\s*(?:[\s,]\s*([+-]?[\d\.]+)\s*(?:[\s,]\s*([+-]?[\d\.]+)\s*[\s,]\s*([+-]?[\d\.]+)\s*[\s,]\s*([+-]?[\d\.]+)\s*)?)?)?\)/g;
    var result = pattern.exec(value);
    while (result) {
      switch (result[1]) {
        case 'translate':
          transform.order += 't';
          transform.translateX = parseFloat(result[2]);
          transform.translateY = (result[3] ? parseFloat(result[3]) : 0);
          break;
        case 'rotate':
          transform.order += 'r';
          transform.rotateA = parseFloat(result[2]);
          transform.rotateX = (result[3] ? parseFloat(result[3]) : 0);
          transform.rotateY = (result[4] ? parseFloat(result[4]) : 0);
          break;
/*
        case 'scale':
          transform.order += 's';
          transform.scaleX = parseFloat(result[2]);
          transform.scaleY = (result[3] ? parseFloat(result[3]) : transform.scaleX);
          break;
        case 'skewX':
          transform.order += 'x';
          transform.skewX = parseFloat(result[2]);
          break;
        case 'skewY':
          transform.order += 'y';
          transform.skewY = parseFloat(result[2]);
          break;
        case 'matrix':
          transform.order += 'm';
          transform.matrix = [parseFloat(result[2]), parseFloat(result[3]),
            parseFloat(result[4]), parseFloat(result[5]),
            parseFloat(result[6]), parseFloat(result[7])];
          break;
*/
      }
      result = pattern.exec(value);
    }
    return transform;
  }


  function windowResizeHndl() {
    var thumbs = $('#thumbs');
    thumbs.height($(window).height() - thumbs.offset().top - 2);
  }

  function setAttr(x, key, value) {
    x.setAttribute(key, value);
  }

	function makeNode(parent, name, settings) {
		parent = parent || svg;
		var node = svg.ownerDocument.createElementNS(svgNS, name);
		for (var name in settings) {
			var value = settings[name];
			if (value != myNull && (typeof value != 'string' || value != '')) {
				setAttr(node,name, value);
			}
		}
		parent.appendChild(node);
		return node;
	}
	function addImage(parent, width, height, ref, settings) {
		var node = makeNode(parent, 'image', $.extend({x: 0, y: 0, width: width, height: height}, settings|| {}));
		node.setAttributeNS(xlinkNS, 'href', ref);
		return node;
	}

  this.init = function () {
    windowResizeHndl();
    $(window).resize(windowResizeHndl);
    try {
      svg = document.createElementNS(svgNS, 'svg');
      setAttr(svg, 'version', '1.1');
      setAttr(svg, 'width', arena.width);
      setAttr(svg, 'height', arena.height);
      container.appendChild(svg);
    } catch (e) {
      container.innerHTML = '<p class="svg_error">This game is not supported in your Browser. Please try with Firefox, Chrome, Safari or Opera.</p>';
    } finally {
      var specifiedHash = photoHashPattern.exec(window.location.hash);
      if (specifiedHash) {
        updateStatus('Fetching photo from Flickr');
        // $('#thumbs').html('<button onclick="MA.loadMore();">Load more pictures</button>');
        $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key='+apiKey+'&photo_id='+specifiedHash[1]+'&format=json&jsoncallback=?', function(response) {
          if (response.stat && response.stat == 'ok') {

            var p = response.photo;
            p.origUrl = 'http://flickr.com/photos/'+p.owner.nsid+'/'+p.id;

            $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key='+apiKey+'&photo_id='+specifiedHash[1]+'&format=json&jsoncallback=?', function(response2) {
              if (response2.stat && response2.stat == 'ok') {
                updateStatus('Observe the tiles. Click on them to begin.');
                var medSize = response2.sizes.size[4] ? response2.sizes.size[4] : response2.sizes.size[3];
                currJigsaw = new JigSaw(medSize.source, medSize.width, medSize.height, p.urls.url[0]._content, p.title._content);
                var locationMatch = photoHashIgnorePattern.exec(window.location),
                    myLocation = locationMatch ? locationMatch[1] : window.location;

                makePuzzleLink(p, myLocation);
              }
            });
          } else {
            updateStatus('Error! Couldn\'t load image');
          }
        });
      } else {
        getInt(0);
      }
    }
  }

  this.loadMore = function() {
    if (currPageNum == 1) {
      $('#thumbs').html('<div>Loading...</div>');
    }
    $('#puzzleLink').hide();
    getInt();
  }

  function getInt() {
    if (currJigsaw) {
      currJigsaw.destroy();
      currJigsaw = myNull;
    }
    updateStatus('Loading more images from Flickr...', 'Only photos which allow derivative works are used.');
    $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&license=4,2,1,5,7&api_key='+apiKey+'&sort=interestingness-desc&per_page=9&safe_search=3&page='+(currPageNum++)+'&format=json&extras=url_z,url_m,url_sq&jsoncallback=?', function(response) {
    // $.getJSON('http://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=3cac122425cd16eaa1ea4c1b8bb3ff26&per_page=10&page='+(currPageNum++)+'&format=json&extras=url_z,url_m,url_sq&jsoncallback=?', function(response) {
      if (response.stat == 'ok') {
        var i, p, urlThumb, str='', currLength = photos.length, myPhotos = [];
        // photos = response.photos.photo;
        with (response.photos) {
          for (i = photo.length; i--;) {
            p = photo[i];
            if (Math.random() < 0.5) {
              myPhotos.push(p);
            } else {
              myPhotos.unshift(p);
            }
          }
        }
        for(i = 0; i < myPhotos.length; i++) {
          p = myPhotos[i];
          p.origUrl = 'http://flickr.com/photos/'+p.owner+'/'+p.id;
        }
        photos.unshift.apply(photos, myPhotos);
        for(i = 0; i < photos.length; i++) {
          p = photos[i];
          str += '<li><img onclick="MA.sel('+i+')" src="'+p.url_sq+'"/></li>'
        }
        $('#thumbs').slideUp("fast", function() {$(this).html(str).slideDown("fast")});
        updateStatus('Select a puzzle from the left!');
      }
    });
  }

  function makeTitle(t) {
    return t ? (t.length > 0 ? t : origImgTxt ) : origImgTxt;
  }

  function makePuzzleLink(photo, myLocation) {
    $('#puzzleLink').html('<p><a href="'+myLocation+'#photo_'+photo.id+'">Puzzle link</a></p><p><a href="'+photo.origUrl+'" target="_blank">Flickr Link</a></p>').show();
  }

  this.sel = function(n) {
    if (currJigsaw) {
      currJigsaw.destroy();
    }
    var p = photos[n];

    var locationMatch = photoHashIgnorePattern.exec(window.location),
        myLocation = locationMatch ? locationMatch[1] : window.location;

    makePuzzleLink(p, myLocation);

    updateStatus('Observe the tiles. Click on them to begin.');
    if (p.url_z) {
      currJigsaw = new JigSaw(p.url_z, p.width_z, p.height_z, p.origUrl, p.title);
    } else {
      currJigsaw = new JigSaw(p.url_m, p.width_m, p.height_m, p.origUrl, p.title);
    }

  };

  var JigSaw = function(img, width, height, origUrl, title) {

    if (svg) {
      setAttr(svg,'width', width);
      setAttr(svg,'height', height);
    }

    var rows = height > 300 ? (height > 400 ? 4 : 3) : 2,
        cols = width > 300 ? (width > 400 ? 4 : 3) : 2,
        tileWidth = width / cols,
        tileHeight = height / rows,
        tiles = [],
        allEdges = new Array(rows),
        myLayers = makeNode(svg, 'g'),
        currTile, currPick = -1,
        hintOpacity = 6,
        border = makeNode(myLayers,'rect', {x:0,y:0,width:width,height:height,style:'fill:#000;stroke-width:4;stroke:#999'}),
        hintImg = addImage(myLayers, width, height, img, {opacity:hintOpacity/10});

    this.destroy = function() {svg.removeChild(myLayers)};

    // create the tiles
    for (var i = cols; i--;) {
      allEdges[i] = new Array(cols);
      for (var j = rows; j--;) {
        allEdges[i][j] = {
          right : i == (cols-1) ? createEdge(i + 1, j, i+1, j+1) : flip(allEdges[i + 1][j].left),
          bottom : j == (rows-1) ? createEdge(i+1, j+1, i, j+1) : flip(allEdges[i][j+1].top),
          left : createEdge(i, j+1, i, j, i != 0),
          top : createEdge(i, j, i+1, j, j != 0)
        }

        var center = {x:tileWidth * (i + 0.5), y: tileHeight * (j + 0.5)},
            tilePath = makeTilePath(allEdges[i][j]),
            tileP = makeNode(myLayers, 'g', {transform:'translate('+[center.x, center.y].join(',')+')'}),
            tile = makeNode(tileP, 'g', {transform:'translate('+[-center.x, -center.y].join(',')+')'}),
            mclip = makeNode(tile, "clipPath", {id:'tileClip'+[i,j].join('_')}),
            borderNode = makeNode(tile,'path',{d:tilePath, 'class':'tile'});

        makeNode(mclip,'path',{d:tilePath,style:"stroke:#000;fill-opacity:0;"});
        addImage(tile, width, height, img, {"clip-path":"url(#tileClip"+[i,j].join('_')+')'});

        tiles.push({
          pos : center,
          cp : $.extend({}, center),    // current position
          sN : tileP,
          edges : allEdges[i][j],
          r: 90*randInt(4),
          bN : borderNode
        });

      }

    }

    containerObj.mousedown(clickHndlr);
    $(window).keypress(keyHndlr);

    // Game states
    // 0    initialised
    // 1    startAnimation
    // 2    playing
    // 3    over
    var gameState = 0;
    function clickHndlr(e) {
      e.preventDefault();
      switch (gameState) {
      case 0:
        gameState = 1;
        startPlayInit();
        break;
      case 2:
        if (currTile != myNull) {
          if (e.which == 1) {
            currTile.r = (currTile.r -90);
          } else {
            currTile.r = (currTile.r +90);
          }
          updateTile(true);
        }

        break;
      }
    }

    function keyHndlr(e) {
      if (e.altKey || e.ctrlKey) {
        return;
      }

      switch (gameState) {
      case 2:
        if (currTile != myNull) {
          if (e.which == 32) {
            e.preventDefault();
            setAttr(currTile.sN, 'display','none');
            pickNextTile(true);
          }
        }

        break;
      }
    }

    function randInt(n) {
      return M.floor(M.random()*n);
    }

    function startPlayInit() {
      var imgCenter = {x : width/2, y: height/2};
      for (var i = tiles.length; i--;) {
        $(tiles[i].sN).animate({'svgTransform':'rotate('+[tiles[i].r,imgCenter.x, imgCenter.y].join(',')+') translate('+[imgCenter.x, imgCenter.y].join(',')+')'}, {
          duration:1000,
          complete : startPlay
        });
      }
    }

    var completeTiles = 0;
    function startPlay() {
      completeTiles++;
      if (completeTiles < (rows * cols)) {
        return;
      }
      gameState = 2;
      for (var i = tiles.length; i--;) {
        setAttr(tiles[i].sN, 'display','none');
      }
      pickNextTile();
      containerObj.mousemove(moveHndlr);
    }

    function redrawTile(animate) {
      var x = currTile.cp.x;
      var y = currTile.cp.y;
      var transform = 'rotate('+[currTile.r,x,y].join(',')+') translate('+[x,y].join(',')+')';

      if (animate) {
        currTile.animating = true;
        $(currTile.sN).animate({'svgTransform': transform}, {
          duration:150,
          complete: function() {currTile.animating = false;}
        });
      } else {
        setAttr(currTile.sN,'transform', transform);
      }
    }

    function approxEqual(a, b) {
      var diff = a-b;
      if (diff < 0) {
        diff *= -1;
      }
      return diff < 0.01;
    }

    function dist(a, b) {
      return M.sqrt(M.pow(a.x-b.x,2) + M.pow(a.y-b.y,2));
      
    }
    function updateTile(animate) {
      var d = dist(currTile.pos, currTile.cp);

      setAttr(currTile.bN, 'class', (d < tileWidth/2) ? 'tileVeryNear' : (d < tileWidth) ? 'tileNear' : 'tile');

      if ( (d < (0.05*tileWidth)) &&
          (currTile.r % 360) == 0) {
        currTile.cp = currTile.pos;
        setAttr(currTile.bN, "class","tileFit");
        redrawTile();

        $('body').css('background-color','#999').animate({'background-color':'#000'}, 300);

        hintOpacity -= 1.5;
        hintOpacity = (hintOpacity >= 0) ? hintOpacity : 0;
        setAttr(hintImg, 'opacity',hintOpacity/10);

        pickNextTile();
      } else {
        redrawTile(animate);
      }
    }

    function moveHndlr(evt) {
      if ((gameState == 2) && currTile && !currTile.animating) {
        var pos = containerObj.offset();
        currTile.cp.x = evt.pageX - pos.left - (containerObj.outerWidth(true) - width)/2; // the final subtraction is because we are not able to modify the width of the container to fit the image. Hence we compute the difference.
        currTile.cp.y = evt.pageY - pos.top;
        updateTile();
      }
    }

    function pickNextTile(dontRemove) {
      // remove currTile
      if (!dontRemove) {
        if (currTile) {
          tiles.splice(currPick, 1);
        }
      }

      if (tiles.length > 0) {
        var pick = randInt(tiles.length);
        if ((tiles.length > 1) && dontRemove) {
          while (pick == currPick) {
            pick = randInt(tiles.length);
          }
        }
        currPick = pick;
        var pickedTile = tiles[pick];
        if (currTile) {
          $(pickedTile.sN).insertAfter(currTile.sN);
        }
        currTile = pickedTile;
        setAttr(currTile.sN, 'display','inline');
        currTile.cp = {x:tileWidth/2+randInt(width - tileWidth),y:tileHeight/2 + randInt(height - tileHeight)};
        redrawTile();
        updateStatus('Place this tile','Click <span class="key">Left</span> / <span class="key">Right</span> to rotate. Press <span class="key">SPACEBAR</span> to skip this tile');
        $('#puzzleLink').show();
      } else {
        currTile = myNull;
        gameState = 3;
        updateStatus('Woohoo! You solved it.', '<a href="'+origUrl+'" target="_blank">'+makeTitle(title)+'</a> on Flickr.');
      }
    }

    function flip(edge) {
      return {x1 : edge.x2, y1:edge.y2, x2:edge.x1, y2:edge.y1, knot:edge.knot, dir:!edge.dir, curved:edge.curved};
    }

    function createEdge(x1, y1, x2, y2, knotted) {
      return {
        x1 : tileWidth*x1, y1: tileHeight*y1,
        x2 : tileWidth*x2, y2: tileHeight*y2,
        knot : knotted && M.random() > 0.5,
        dir : M.random() > 0.5,
        curved : Math.random() > 0.5
      };
    }

    function createKnot(edge, horiz) {
      var knotStr = '', c1x, c2x, c1y, c2y, base, length, scales;
      scales = edge.curved? [.35, .65, .45, .55] : [.40, .60, .35, .65];
      if (edge.knot) {
        if (horiz) {
          base = edge.x1;
          length = edge.x2 - base;
          c1x = length*scales[0] + base;
          c2x = length*scales[1] + base;
          c1y = c2y = edge.y1;
        } else {
          base = edge.y1;
          length = edge.y2 - base;
          c1y = length*scales[0] + base;
          c2y = length*scales[1] + base;
          c1x = c2x = edge.x1;
        }
        if (edge.curved) {
          knotStr = 'L'+[c1x,c1y].join(' ') +
              'A'+[tileWidth/32, tileHeight/32, 0, 0, edge.dir? 1:0, c2x,c2y].join(' ');
        } else {
          var sign = edge.dir ? 1 : -1;
          if (horiz) {
            c3x = length*scales[2] + base;
            c4x = length*scales[3] + base;
            c3y = c4y = edge.y1 + sign*length / 6;
          } else {
            c3y = length*scales[2] + base;
            c4y = length*scales[3] + base;
            c3x = c4x = edge.x1 + sign * length / 6;
          }
          knotStr = 'L'+[c1x,c1y].join(' ') +
                    'L'+[c3x,c3y].join(' ') +
                    'L'+[c4x,c4y].join(' ') +
                    'L'+[c2x,c2y].join(' ');
        }
      }
      return knotStr;
    }

    function makeTilePath(edges) {
      return 'M'+[edges.top.x1,edges.top.y1].join(' ') +
        createKnot(edges.top, true) +
        'L'+[edges.top.x2, edges.top.y2].join(' ') +

        createKnot(edges.right, false) +
        'L'+[edges.right.x2, edges.right.y2].join(' ') +

        createKnot(edges.bottom, true) +
        'L'+[edges.left.x1, edges.left.y1].join(' ') +

        createKnot(edges.left, false) +
        'z';
    }

  }

}

$(document).ready(function() {
  MA.init();
});
