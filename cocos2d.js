(function() {
	var d = document;
	var c = {
		box2d: false,
		chipmunk: false,
		showFPS: window.location.protocol == "file:",
		loadExtension: false,
		frameRate: 60,
		renderMode: 0,       //Choose of RenderMode: 0(default), 1(Canvas only), 2(WebGL only)
		tag: 'gameCanvas', //the dom element to run cocos2d on
		//engineDir: 'cocos2d/',
		SingleEngineFile: 'cocos2d.min.js',
		appFiles:[
			'build/index.js',
			'src/WebRTC.js',
			'src/Netcode.js',
			'src/GameScene.js',
			'src/KeyboardControlLayer.js',
			'src/WorldObjectNode.js',
			'src/ObstacleNode.js',
			'src/SnakeNode.js',
			'src/SnakeBitsNode.js',
			'src/PowerupNode.js',
			'src/SpawnNode.js',
			'src/PerkBar.js',
			'src/GameNodeFactory.js',
			'src/GameLayer.js',
		],
		resourceFiles: [
			{src: 'res/snake-1.png'},
			{src: 'res/snake-2.png'},
			{src: 'res/snake-3.png'},
			{src: 'res/snake-4.png'},
			{src: 'res/snake-5.png'},
			{src: 'res/snake-6.png'},
			{src: 'res/food.png'},
			{src: 'res/tiles.png'},
			{src: 'res/forest.jpg'},
			{src: 'res/halo.png'},
			{src: 'res/down.png'},
			{src: 'res/powerup.png'},
			{src: 'res/buff.png'},
		]
	};

	if ( !d.createElement( 'canvas' ).getContext ) {
		var s = d.createElement( 'div' );
		s.innerHTML = '<h2>Your browser does not support HTML5 canvas!</h2>' +
			'<p>Google Chrome is a browser that combines a minimal design with sophisticated technology to make the web faster, safer, and easier.Click the logo to download.</p>' +
			'<a href="http://www.google.com/chrome" target="_blank"><img src="http://www.google.com/intl/zh-CN/chrome/assets/common/images/chrome_logo_2x.png" border="0"/></a>';
		var p = d.getElementById( c.tag ).parentNode;
		p.style.background = 'none';
		p.style.border = 'none';
		p.insertBefore( s, d.getElementById( c.tag ) );

		d.body.style.background = '#ffffff';
		return;
	}

	window.addEventListener( 'DOMContentLoaded', function() {
		this.removeEventListener( 'DOMContentLoaded', arguments.callee, false );
		//first load engine file if specified
		var s = d.createElement( 'script' );
		/*********Delete this section if you have packed all files into one*******/
	if ( c.SingleEngineFile && !c.engineDir ) {
			s.src = c.SingleEngineFile;
		} else if ( c.engineDir && !c.SingleEngineFile ) {
			s.src = c.engineDir + 'jsloader.js';
		} else {
			alert('You must specify either the single engine file OR the engine directory in "cocos2d.js"');
		}
		/*********Delete this section if you have packed all files into one*******/

		//s.src = 'myTemplate.js'; //IMPORTANT: Un-comment this line if you have packed all files into one

		d.body.appendChild( s );
		document.ccConfig = c;
		s.id = 'cocos2d-html5';
		//else if single file specified, load singlefile
	});
})();
