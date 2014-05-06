var RootableIntersectSprite = enchant.Class.create(enchant.Sprite, {
    initialize: function(width, height, image){
		enchant.Sprite.call(this, width, height);
        this.image = enchant.Core.instance.assets[image];
        
        this.debug = false;
        
        if(this.debug){
			var game = enchant.Core.instance;
			var scene = game.currentScene;
		    var points = ["r0","r1","r2","r3", "b0","b1","b2","b3"];
		    for(var i in points){
		    	var p = new enchant.Sprite(4,4);
			    p.image = enchant.Core.instance.assets['./point.png'];
		    	p.frame = (i < 4 ? 0 : 1);
				p.addEventListener('enterframe', function(){ p.visible = !p.visible; });
		    	scene.addChild(p);
			    this[points[i]] = p;
		    }
        }
    },
    offsetWidth : {
    	get: function(){ return this._offsetWidth; },
    	set: function(w){ this._offsetWidth = w; },
    },
    offsetHeight : {
    	get: function(){ return this._offsetHeight; },
    	set: function(h){ this._offsetHeight = h; },
    },
    _getObjectPoints: function(object){//A, B, C, D, rotation
    	var _x = object.x;
    	var _y = object.y;
    	var _width = object.width;
    	var _height = object.height;
    	var offsetWidth = object.offsetWidth ? object.offsetWidth : 0;
    	var offsetHeight = object.offsetHeight ? object.offsetHeight : 0;
    	var width = _width - offsetWidth * 2;
    	var height = _height - offsetHeight * 2;
    	var centerX = _x + _width / 2;
    	var centerY = _y + _height / 2;
    	var x1 = _x + offsetWidth;
    	var x2 = _x + _width - offsetWidth;
    	var y1 = _y + offsetHeight;
    	var y2 = _y + _height - offsetHeight;
    	var points = [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }, object.rotation];
    	return points;
    },
    _rotatePoints: function(rotation, centerX, centerY, points){
    
    	if(centerX == null)
    		centerX = (points[2].x + points[0].x) / 2;
    	if(centerY == null)
    		centerY = (points[2].y + points[0].y) / 2;
    
    	if(Math.round(rotation) % 360 != 0){
    		var RAD = rotation * Math.PI / 180;
    		for(var i=0; i<4; i++){
    			var px = points[i].x - centerX;
    			var py = points[i].y - centerY;
				points[i].x = px * Math.cos(RAD) - py * Math.sin(RAD) + centerX;
				points[i].y = px * Math.sin(RAD) + py * Math.cos(RAD) + centerY;
    		}
    	}
		return points;
    },
    _isCrossAbCd: function(A, B, C, D){// A->B x C->D
    	//http://www5d.biglobe.ne.jp/~tomoya03/shtml/algorithm/Intersection.htm
		if ( ((A.x-B.x) * (C.y-A.y) + (A.y-B.y) * (A.x-C.x)) * ((A.x-B.x) * (D.y-A.y) + (A.y-B.y) * (A.x-D.x)) <= 0 ) {
			if ( ((C.x-D.x) * (A.y-C.y) + (C.y-D.y) * (C.x-A.x)) * ((C.x-D.x) * (B.y-C.y) + (C.y-D.y) * (C.x-B.x)) <= 0) {
				return true;
			}
		}
		return false;
    },
    _overlapAsCircle: function(rectA, rectB){
    	var rects = [rectA, rectB];
    	var infos = [];
    	for(var i=0; i<2; i++){
    		var rect = rects[i];
    		var info = {};
    		info.x = (rect[2].x + rect[0].x) / 2;
    		info.y = (rect[2].y + rect[0].y) / 2;
    		info.w = rect[2].x - rect[0].x;
    		info.h = rect[2].y - rect[0].y;
    		infos.push(info);
    	}
    	var A = infos.shift();
    	var B = infos.shift();
    	var touch = Math.pow((A.w + B.w) * 0.5, 2) + Math.pow((A.h + B.h) * 0.5, 2);
    	var dist =  Math.pow((A.x - B.x), 2) + Math.pow((A.y - B.y), 2);
    	
    	return (touch < dist) ? false : true;
    },
    intersectR: function(object){
    	var points = [this._getObjectPoints(this), this._getObjectPoints(object)];
    	points.sort(function(a, b){
    		var areaA = (a[2].x - a[0].x) * (a[2].y - a[0].y);
    		var areaB = (b[2].x - b[0].x) * (b[2].y - b[0].y);
    		return areaB - areaA;
    	});
    	var main = points.shift();
    	var sub = points.shift();

        if(this.debug){
			for(var i=0; i<4; i++){
				var r = this["r" + i];
				var b = this["b" + i];
				r.visible = false;
				b.visible = false;
			}
        }
    	
    	// curring
    	if(!this._overlapAsCircle(main, sub))
    		return false;

        if(this.debug){
			for(var i=0; i<4; i++){
				var r = this["r" + i];
				var b = this["b" + i];
				r.visible = true;
				b.visible = true;
			}
        }

    	// rotate
    	sub = this._rotatePoints(sub[4], null, null, sub);
        if(this.debug){
			for(var i=0; i<4; i++){
				var p = this["b" + i];
				p.x = sub[i].x;
				p.y = sub[i].y;
			}
        }
		var rotation = 360 - Math.round(main[4]) % 360;
		var centerX = (main[2].x + main[0].x) / 2;
		var centerY = (main[2].y + main[0].y) / 2;
		sub = this._rotatePoints(rotation, centerX, centerY, sub);
        if(this.debug){
			for(var i=0; i<4; i++){
				var p = this["r" + i];
				p.x = sub[i].x;
				p.y = sub[i].y;
			}
        }

        // check
        for(var i=0; i<4; i++){
        	var p = sub[i];
        	if(main[0].x <= p.x && p.x <= main[2].x){
		    	if(main[0].y <= p.y && p.y <= main[2].y)
		    		return true;
        	}
        }
        for(var i=0; i<4; i++){
		    for(var j=0; j<4; j++){
		    	if( this._isCrossAbCd( sub[i], sub[ (i + 1) % 4 ], main[j], main[ (j + 1) % 4 ] ))
		    		return true;
		    }
        }
        
		return false;
    },
    dummy: function(){}
});





