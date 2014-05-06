enchant();
window.onload = function(){

    var game = new Core(320, 320);
    game.scale = 1;
    game.fps = 24;
    game.preload(
    	 './space1x.png'
    	,'./space3x.png'
    	,'./point.png'
    );
    game.onload = function startGame(){
    
    	var scene = game.rootScene;
    
    	var bear = new RootableIntersectSprite(32, 32, './space3x.png');
    	bear.offsetWidth = 8;
    	bear.offsetHeight = 4;
    	bear.x = (game.width - bear.width) / 2;
    	bear.y = (game.height - bear.height) / 2;
    	bear.addEventListener('enterframe', function(){
    		bear.rotation -= 1;
    	});
    	bear.addEventListener('touchmove', function(e){
    		bear.x = e.x - bear.width / 2;
    		bear.y = e.y - bear.height / 2;
    	});
    	
    	var meteo = new RootableIntersectSprite(64, 64, './space1x.png');
    	meteo.offsetWidth = 4;
    	meteo.offsetHeight = 18;
    	meteo.addEventListener('enterframe', function(){
    		meteo.rotation += 0.25;
    		if(bear.intersectR(meteo))
    			bear.visible = !bear.visible;
    		else
    			bear.visible = true;
    	});
    	meteo.addEventListener('touchmove', function(e){
    		meteo.x = e.x - meteo.width / 2;
    		meteo.y = e.y - meteo.height / 2;
    	});
    	scene.addChild(meteo);
    	scene.addChild(bear);
	}
    game.start();
};

