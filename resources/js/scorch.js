// Initialization
var scorch = (function(scorch)
{
	scorch.init = function(options)
	{
		scorch.canvas = document.getElementsByTagName('canvas')[0];
		if(!scorch.canvas)
		{
			scorch.dom = document.getElementById("canvas");
		}

		if(scorch.canvas)
		{
			scorch.context = scorch.canvas.getContext('2d');
		}
		else
		{
			scorch.canvas = document.createElement("canvas");
			scorch.canvas.width = options.width;
			scorch.canvas.height = options.height;
			scorch.context = scorch.canvas.getContext('2d');
			document.body.appendChild(scorch.canvas);
		}

		scorch.width = scorch.canvas ? scorch.canvas.width : 640;
		scorch.height = scorch.canvas ? scorch.canvas.height  : 480;

		if(!options.cursor)
			scorch.canvas.style.cursor = "none";

		scorch.mouse_x = 0;
		scorch.mouse_y = 0;
		window.addEventListener("mousemove", saveMousePosition);
	}

	function saveMousePosition(e)
	{
		scorch.mouse_x = (e.pageX || e.clientX) - scorch.canvas.offsetLeft;
		scorch.mouse_y = (e.pageY || e.clientY) - scorch.canvas.offsetTop;
	}

	scorch.start = function(game_state, options)
	{
		scorch.init(options);
		displayProgress(0);
		scorch.setupInput();

		function displayProgress(percent_done)
		{
			if(scorch.context)
			{
				scorch.context.save();
				scorch.context.fillStyle  = "black";
				scorch.context.fillRect(0, 0, scorch.width, scorch.height);
				scorch.context.textAlign  = "center";
				scorch.context.fillStyle  = "white";
				scorch.context.font       = "15px terminal";
				scorch.context.fillText("Loading", scorch.width / 2, scorch.height / 2 - 30);
				scorch.context.font       = "bold 30px terminal";
				scorch.context.fillText(percent_done + "%", scorch.width / 2, scorch.height / 2);
				scorch.context.restore();
			}
		}

		function assetLoaded(src, percent_done)
		{
			displayProgress(percent_done);
		}

		function assetError(src)
		{
			console.log( "Error loading: " + src);
		}

		function assetsLoaded()
		{
			scorch.switchGameState(game_state);
		}

		if(scorch.assets.length() > 0)
		{
			scorch.assets.loadAll({onload:assetLoaded, onerror:assetError, onfinish:assetsLoaded});
		}
		else
		{
			assetsLoaded();
		}
	}

	scorch.switchGameState = function(game_state)
	{
		scorch.game_loop && scorch.game_loop.stop();
		if(scorch.isFunction(game_state))
		{
			game_state = new game_state;
		}

		scorch.previous_game_state = scorch.game_state;
		scorch.game_state = game_state;
		scorch.game_loop = new scorch.GameLoop(game_state);
		scorch.game_loop.start();
	}

	scorch.imageToCanvas = function(image)
	{
		var canvas = document.createElement("canvas");
		canvas.src = image.src;
		canvas.width = image.width;
		canvas.height = image.height;

		var context = canvas.getContext("2d");
		context.drawImage(image, 0, 0, image.width, image.height);
		return canvas;
	}

	scorch.forceArray = function(obj)
	{
		return Array.isArray(obj) ? obj : [obj];
	}

	scorch.clear = function()
	{
		scorch.context.clearRect(0, 0, scorch.width, scorch.height);
	}

	scorch.isImage = function(obj)
	{
		return Object.prototype.toString.call(obj) === "[object HTMLImageElement]";
	}

	scorch.isCanvas = function(obj)
	{
		return Object.prototype.toString.call(obj) === "[object HTMLCanvasElement]";
	}

	scorch.isDrawable = function(obj)
	{
		return scorch.isImage(obj) || scorch.isCanvas(obj);
	}

	scorch.isString = function(obj)
	{
		return (typeof obj == 'string');
	}

	scorch.isArray = function(obj)
	{
		if(obj === undefined)
			return false;
		return !(obj.constructor.toString().indexOf("Array") == -1);
	}

	scorch.popArray = function(array, index)
	{
		for(var i = index; i < array.length; i++)
		{
			array[i] = array[i+1];
		}
		array.pop();
		return array;
	}

	scorch.isFunction = function(obj)
	{
		return (Object.prototype.toString.call(obj) === "[object Function]");
	}

	scorch.isOutsideCanvas = function(item)
	{
		return (item.x < 0 || item.y < 0 || item.x > scorch.width || item.y > scorch.height);
	}

	scorch.forceInsideCanvas = function(item)
	{
		if(item.x < 0)
		{
			item.x = 0
		}
		if(item.x > scorch.width)
		{
			item.x = scorch.width
		}
		if(item.y < 0)
		{
			item.y = 0
		}
		if(item.y > scorch.height)
		{
			item.y = scorch.height
		}
	}

	scorch.isOutsideCanvase = function(item)
	{
		return (item.x < 0 || item.rect().right > scorch.width || item.y < 0 || item.rect().bottom > scorch.height)
	}

	return scorch;
})
(scorch || {});

// Input
var scorch = (function(scorch)
{
	var pressed_keys = {}
	var previously_pressed_keys = {}
	var keycode_to_string = []
	var on_keydown_callbacks = []
	var on_keyup_callbacks = []
	var mousebuttoncode_to_string = []
	var ie_mousebuttoncode_to_string = []

	scorch.setupInput = function()
	{
		var k = []

		k[8] = "backspace"
		k[9] = "tab"
		k[13] = "enter"
		k[16] = "shift"
		k[17] = "ctrl"
		k[18] = "alt"
		k[19] = "pause"
		k[20] = "capslock"
		k[27] = "esc"
		k[32] = "space"
		k[33] = "pageup"
		k[34] = "pagedown"
		k[35] = "end"
		k[36] = "home"
		k[37] = "left"
		k[38] = "up"
		k[39] = "right"
		k[40] = "down" 
		k[45] = "insert"
		k[46] = "delete"

		k[91] = "left_window_key leftwindowkey"
		k[92] = "right_window_key rightwindowkey"
		k[93] = "select_key selectkey"
		k[106] = "multiply *"
		k[107] = "add plus +"
		k[109] = "subtract minus -"
		k[110] = "decimalpoint"
		k[111] = "divide /"

		k[144] = "numlock"
		k[145] = "scrollock"
		k[186] = "semicolon ;"
		k[187] = "equalsign ="
		k[188] = "comma ,"
		k[189] = "dash -"
		k[190] = "period ."
		k[191] = "forwardslash /"
		k[192] = "graveaccent `"
		k[219] = "openbracket ["
		k[220] = "backslash \\"
		k[221] = "closebracket ]"
		k[222] = "singlequote '"

		var m = []

		m[0] = "left_mouse_button"
		m[1] = "center_mouse_button"
		m[2] = "right_mouse_button"

		var ie_m = [];
		ie_m[1] = "left_mouse_button";
		ie_m[2] = "right_mouse_button";
		ie_m[4] = "center_mouse_button"; 

		mousebuttoncode_to_string = m
		ie_mousebuttoncode_to_string = ie_m;


		var numpadkeys = ["numpad0","numpad1","numpad2","numpad3","numpad4","numpad5","numpad6","numpad7","numpad8","numpad9"]
		var fkeys = ["f1","f2","f3","f4","f5","f6","f7","f8","f9"]
		var numbers = ["0","1","2","3","4","5","6","7","8","9"]
		var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
		for(var i = 0; numbers[i]; i++)     { k[48+i] = numbers[i] }
		for(var i = 0; letters[i]; i++)     { k[65+i] = letters[i] }
		for(var i = 0; numpadkeys[i]; i++)  { k[96+i] = numpadkeys[i] }
		for(var i = 0; fkeys[i]; i++)       { k[112+i] = fkeys[i] }

		keycode_to_string = k

		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("keyup", handleKeyUp)

		var scorchwindow = scorch.canvas || scorch.dom
		scorchwindow.addEventListener("mousedown", handleMouseDown, false);
		scorchwindow.addEventListener("mouseup", handleMouseUp, false);
		scorchwindow.addEventListener("touchstart", handleTouchStart, false);
		scorchwindow.addEventListener("touchend", handleTouchEnd, false);

		window.addEventListener("blur", resetPressedKeys, false);

		document.oncontextmenu = function() {return false};
	}

	function resetPressedKeys(e)
	{
		pressed_keys = {};
	}

	function handleKeyUp(e)
	{
		event = (e) ? e : window.event
		var human_names = keycode_to_string[event.keyCode].split(" ")
		human_names.forEach( function(human_name)
		{
			pressed_keys[human_name] = false
			if(on_keyup_callbacks[human_name])
			{
				on_keyup_callbacks[human_name](human_name)
				e.preventDefault()
			}
			if(prevent_default_keys[human_name]) { e.preventDefault() }
		});
	}

	function handleKeyDown(e)
	{
		event = (e) ? e : window.event  
		var human_names = keycode_to_string[event.keyCode].split(" ")
		human_names.forEach( function(human_name)
		{
			pressed_keys[human_name] = true
			if(on_keydown_callbacks[human_name])
			{
				on_keydown_callbacks[human_name](human_name)
				e.preventDefault()
			}
			if(prevent_default_keys[human_name]) { e.preventDefault() }
		});
	}

	function handleMouseDown(e)
	{
		event = (e) ? e : window.event  
		var human_name = mousebuttoncode_to_string[event.button] // 0 1 2
		if (navigator.appName == "Microsoft Internet Explorer")
		{
			human_name = ie_mousebuttoncode_to_string[event.button];
		}
		pressed_keys[human_name] = true
		if(on_keydown_callbacks[human_name])
		{
			on_keydown_callbacks[human_name](human_name)
			e.preventDefault()
		}
	}

	function handleMouseUp(e)
	{
		event = (e) ? e : window.event
		var human_name = mousebuttoncode_to_string[event.button]  

		if (navigator.appName == "Microsoft Internet Explorer")
		{
			human_name = ie_mousebuttoncode_to_string[event.button];
		}
		pressed_keys[human_name] = false
		if(on_keyup_callbacks[human_name])
		{
			on_keyup_callbacks[human_name](human_name)
			e.preventDefault()
		}
	}

	function handleTouchStart(e)
	{
		event = (e) ? e : window.event  
		pressed_keys["left_mouse_button"] = true
		scorch.mouse_x = e.touches[0].pageX - scorch.canvas.offsetLeft;
		scorch.mouse_y = e.touches[0].pageY - scorch.canvas.offsetTop;
		//e.preventDefault()
	}

	function handleTouchEnd(e)
	{
		event = (e) ? e : window.event  
		pressed_keys["left_mouse_button"] = false
		scorch.mouse_x = undefined;
		scorch.mouse_y = undefined;
	}

	var prevent_default_keys = []

	scorch.preventDefaultKeys = function(array_of_strings)
	{
		array_of_strings.forEach( function(item, index)
		{
			prevent_default_keys[item] = true
		});
	}

	scorch.pressed = function(keys, logical_and)
	{
		if(scorch.isString(keys)) { keys = keys.split(" ") }
		if(logical_and) { return  keys.every( function(key) { return pressed_keys[key] } ) }
		else            { return  keys.some( function(key) { return pressed_keys[key] } ) }
	}

	scorch.pressedWithoutRepeat = function(keys, logical_and)
	{
		if( scorch.pressed(keys, logical_and) )
		{
			if(!previously_pressed_keys[keys])
			{
				previously_pressed_keys[keys] = true
				return true 
			}
		}
		else
		{
			previously_pressed_keys[keys] = false
			return false
		}
	}

	scorch.on_keydown = function(key, callback)
	{
		if(scorch.isArray(key))
		{
			for(var i=0; key[i]; i++)
			{
				on_keydown_callbacks[key[i]] = callback
			}
		}
		else
		{
			on_keydown_callbacks[key] = callback
		}
	}

	scorch.on_keyup = function(key, callback)
	{
		if(scorch.isArray(key))
		{
			for(var i=0; key[i]; i++)
			{
				on_keyup_callbacks[key[i]] = callback
			}
		}
		else
		{
			on_keyup_callbacks[key] = callback
		}
	}

	scorch.clearKeyCallbacks = function()
	{
		on_keyup_callbacks = []
		on_keydown_callbacks = []
	}

	return scorch;
})
(scorch || {});

// Asset management
var scorch = (function(scorch)
{
	scorch.Assets = function Assets()
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee();

		this.loaded = [];
		this.loading = [];
		this.src_list = [];
		this.data = [];

		this.bust_cache = false;
		this.image_to_canvas = true;
		this.fuchia_to_transparent = true;
		this.root = "";

		this.file_type = {};
		this.file_type["json"] = "json";
		this.file_type["wav"] = "audio";
		this.file_type["mp3"] = "audio";
		this.file_type["ogg"] = "audio";
		this.file_type["png"] = "image";
		this.file_type["jpg"] = "image";
		this.file_type["jpeg"] = "image";
		this.file_type["gif"] = "image";
		this.file_type["bmp"] = "image";
		this.file_type["tiff"] = "image";
		var that = this;

		this.length = function()
		{
			return this.src_list.length;
		}

		this.get = function(src)
		{
			if(scorch.isArray(src))
			{
				return src.map( function(i)
					{
						return that.data[i];
					});
			}
			else
			{
				if(this.loaded[src]) 
				{
					return this.data[src];
				}
				else
				{
					console.log("No such asset: " + src);
				}
			}
		}

		this.isLoading = function(src)
		{
			return this.loading[src];
		}

		this.isLoaded = function(src)
		{
			return this.loaded[src];
		}

		this.getPostfix = function(src)
		{
			postfix_regexp = /\.([a-zA-Z0-9]+)/;
			return postfix_regexp.exec(src)[1];
		}

		this.getType = function(src)
		{
			var postfix = this.getPostfix(src);
			return (this.file_type[postfix] ? this.file_type[postfix] : postfix);
		}

		this.add = function(src)
		{
			if(scorch.isArray(src))
			{
				for(var i = 0; src[i]; i++)
				{
					this.add(src[i]);
				}
			}
			else
			{
				this.src_list.push(src);
			}
			return this;
		}

		this.loadAll = function(options)
		{
			this.load_count = 0;
			this.error_count = 0;

			this.onload = options.onload;
			this.onerror = options.onerror;
			this.onfinish = options.onfinish;

			for(i = 0; this.src_list[i]; i++)
			{
				this.load(this.src_list[i]);
			}
		}

		this.getOrLoad = function(src, onload, onerror)
		{
			if(this.data[src])
			{
				onload();
			}
			else
			{
				this.load(src, onload, onerror);
			}
		}

		this.load = function(src, onload, onerror)
		{
			var asset = {};
			asset.src = src;
			asset.onload = onload;
			asset.onerror = onerror;
			this.loading[src] = true;

			var resolved_src = this.root + asset.src;
			if (this.bust_cache)
			{
				resolved_src += "?" + parseInt(Math.random()*10000000);
			}

			switch(this.getType(asset.src))
			{
				case "image":
					asset.image = new Image();
					asset.image.asset = asset;
					asset.image.onload = this.assetLoaded;
					asset.image.onerror = this.assetError;
					asset.image.src = resolved_src;
				break;
				case "audio":
					asset.audio = new Audio(resolved_src);
					asset.audio.asset = asset;
					this.data[asset.src] = asset.audio;
					asset.audio.addEventListener("canplay", this.assetLoaded, false);
					asset.audio.addEventListener("error", this.assetError, false);
					asset.audio.load();
				break;
				default:
					var req = new XMLHttpRequest();
					req.asset = asset;
					req.onreadystatechange = this.assetLoaded;
					req.open('GET', resolved_src, true);
					req.send(null);
				break;
			}
		}

		this.assetLoaded = function(e)
		{
			var asset = this.asset;
			var src = asset.src;
			var filetype = that.getType(asset.src);

			that.loaded[src] = true;
			that.loading[src] = false;

			if(filetype == "json")
			{
				if (this.readyState != 4)
				{
					return;
				}
				that.data[asset.src] = JSON.parse(this.responseText);
			}
			else if(filetype == "image")
			{
				var new_image = that.image_to_canvas ? scorch.imageToCanvas(asset.image) : asset.image;
				if(that.fuchia_to_transparent && that.getPostfix(asset.src) == "bmp")
				{
					new_image = fuchiaToTransparent(new_image);
				}
				that.data[asset.src] = new_image;
			}
			else if(filetype == "audio")
			{
				asset.audio.removeEventListener("canplay", that.assetLoaded, false);
				that.data[asset.src] = asset.audio;
			}

			that.load_count++;
			that.processCallbacks(asset, true);
		}

		this.assetError = function(e)
		{
			var asset = this.asset;
			that.error_count++;
			that.processCallbacks(asset, false);
		}

		this.processCallbacks = function(asset, ok)
		{
			var percent = parseInt( (that.load_count+that.error_count) / that.src_list.length * 100);

			if(ok)
			{
				if(that.onload)
					that.onload(asset.src, percent);
				if(asset.onload)
					asset.onload();
			}
			else{
				if(that.onerror)
					that.onerror(asset.src, percent);
				if(asset.onerror)
					asset.onerror(asset);
			}

			if(percent==100)
			{
				if(that.onfinish)
				{
					that.onfinish();
				}
				that.onload = null;
				that.onerror = null;
				that.onfinish = null;
			}
		}
	}

	function fuchiaToTransparent(image)
	{
		canvas = scorch.isImage(image) ? scorch.imageToCanvas(image) : image;
		var context = canvas.getContext("2d");
		var img_data = context.getImageData(0, 0, canvas.width, canvas.height);
		var pixels = img_data.data;
		for(var i = 0; i < pixels.length; i += 4)
		{
			if(pixels[i] == 255 && pixels[i + 1] == 0 && pixels[i +2 ] == 255)
			{
				pixels[i+3] = 0;
			}
		}
		context.putImageData(img_data, 0, 0);
		return canvas;
	}

	scorch.assets = new scorch.Assets();
	return scorch;
})
(scorch || {});

// Game Loop
var scorch = (function(scorch)
{
	scorch.GameLoop = function GameLoop(game_object)
    {
    	var prevTime = Date.now();
	    var delta = 0;
	    var elapsedTime = 0;
	    var FPS = 0;
	    var tickTime = 0;
	    var ticks = 1;
	    var seconds = 0;
	    var paused = false;
	    var stopped = false;

    	this.start = function()
    	{
    		if(game_object.Init)
	    	{
	    		game_object.Init();
			}
			step_delay = 1000 / 60/* Desired FPS */;
			gameLoop = setInterval(this.loop, step_delay);
    	}

    	this.loop = function()
    	{
			var curTime = Date.now();
			elapsedTime = curTime - prevTime;
			prevTime = curTime;

			delta = elapsedTime / 1000;

			tickTime += delta;
			if(tickTime >= (ticks / 20))
			{
				ticks++;
				if(ticks >= 20)
				{
					tickTime = 0;
					ticks = 0;
					seconds++;
				}
			}
			if(ticks % 5 == 0)
			{
				FPS = Math.floor(1 / delta);
			}

    		if(!stopped && !paused)
    		{
    			if(game_object.Update)
		    	{
		    		game_object.Update();
				}

		        if(game_object.Draw)
		    	{
		        	game_object.Draw();
		    	}
    		}
    	}

    	this.pause = function()
    	{
    		paused = true
    	}
  
		this.unpause = function()
		{
			paused = false
		}

		this.stop = function()
		{
			stopped = true;
		}

		this.getTicks = function()
		{
			return ticks;
		}
    }
	return scorch;
})
(scorch || {});

// Entity
var scorch = (function(scorch)
{
	scorch.Entity = function Entity(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee( options );

		this.options = options;
		this.set(options);

		if(options.context)
		{ 
			this.context = options.context;
		}
		if(!options.context)
		{
			this.context = scorch.context;
		}
	}

	scorch.Entity.prototype.set = function(options)
	{
		this.scale_x = this.scale_y = (options.scale || 1);
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.alpha = (options.alpha === undefined) ? 1 : options.alpha;
		this.angle = options.angle || 0;
		this.flipped = options.flipped || false;
		this.mirrored = options.mirrored || false;
		this.anchor(options.anchor || "top_left");
		if(options.anchor_x !== undefined)
			this.anchor_x = options.anchor_x;
		if(options.anchor_y !== undefined)
			this.anchor_y = options.anchor_y; 
		options.image && this.setImage(options.image);
		this.image_path = options.image;
		if(options.scale_image)
			this.scaleImage(options.scale_image);
		this.cacheOffsets();

		return this;
	}

	scorch.Entity.prototype.clone = function(object)
	{
		var constructor = this._constructor ? eval(this._constructor) : this.constructor;
		var new_entity = new constructor( this.attributes() );
		new_entity._constructor = this._constructor || this.constructor.name;
		return new_entity;
	}

	scorch.Entity.prototype.setImage = function(value)
	{
		var that = this;

		if(scorch.isDrawable(value))
		{
			this.image = value;
			return this.cacheOffsets();
		}
		else
		{
			if(scorch.assets.isLoaded(value))
			{
				this.image = scorch.assets.get(value); this.cacheOffsets();
			}
			else
			{
				scorch.assets.load(value, function() { that.image = scorch.assets.get(value); that.cacheOffsets(); });
			}
		}
		return this
	}

	scorch.Entity.prototype.flip =          function()      { this.flipped = this.flipped ? false : true; return this }
	scorch.Entity.prototype.flipTo =        function(value) { this.flipped = value; return this }

	scorch.Entity.prototype.mirror =		function(value) { this.mirrored = value; return this }

	scorch.Entity.prototype.rotate =        function(value) { this.angle += value; return this }
	scorch.Entity.prototype.rotateTo =      function(value) { this.angle = value; return this }

	scorch.Entity.prototype.moveTo =        function(x,y)   { this.x = x; this.y = y; return this }
	scorch.Entity.prototype.move =          function(x,y)   { if(x) this.x += x;  if(y) this.y += y; return this }

	scorch.Entity.prototype.scale =         function(value) { this.scale_x *= value; this.scale_y *= value; return this.cacheOffsets() }
	scorch.Entity.prototype.scaleTo =       function(value) { this.scale_x = this.scale_y = value; return this.cacheOffsets() }
	scorch.Entity.prototype.scaleWidth =    function(value) { this.scale_x *= value; return this.cacheOffsets() }
	scorch.Entity.prototype.scaleHeight =   function(value) { this.scale_y *= value; return this.cacheOffsets() }

	scorch.Entity.prototype.setX =          function(value) { this.x = value; return this }
	scorch.Entity.prototype.setY =          function(value) { this.y = value; return this }

	scorch.Entity.prototype.setTop =        function(value) { this.y = value + this.top_offset; return this }
	scorch.Entity.prototype.setBottom =     function(value) { this.y = value - this.bottom_offset; return this }
	scorch.Entity.prototype.setLeft =       function(value) { this.x = value + this.left_offset; return this }
	scorch.Entity.prototype.setRight =      function(value) { this.x = value - this.right_offset; return this }

	scorch.Entity.prototype.setWidth  =     function(value) { this.scale_x = value/this.image.width; return this.cacheOffsets() }
	scorch.Entity.prototype.setHeight =     function(value) { this.scale_y = value/this.image.height; return this.cacheOffsets() }
	
	scorch.Entity.prototype.resize =        function(width, height)
	{
		this.scale_x = (this.width + width) / this.image.width;
		this.scale_y = (this.height + height) / this.image.height;
		return this.cacheOffsets();
	}

	scorch.Entity.prototype.resizeTo =      function(width, height)
	{
		this.scale_x = width / this.image.width;
		this.scale_y = height / this.image.height;
		return this.cacheOffsets();
	}

	scorch.Entity.prototype.anchor = function(value)
	{
		var anchors =
		{
			top_left: [0,0],
			left_top: [0,0],
			center_left: [0,0.5],
			left_center: [0,0.5],
			bottom_left: [0,1],
			left_bottom: [0,1],
			top_center: [0.5,0],
			center_top: [0.5,0],
			center_center: [0.5,0.5],
			center: [0.5,0.5],
			bottom_center: [0.5,1],
			center_bottom: [0.5,1],
			top_right: [1,0],
			right_top: [1,0],
			center_right: [1,0.5],
			right_center: [1,0.5],
			bottom_right: [1,1],
			right_bottom: [1,1]
		};

		if(a = anchors[value])
		{
			this.anchor_x = a[0];
			this.anchor_y = a[1];
			if(this.image)
				this.cacheOffsets();
		}
		return this;
	}

	scorch.Entity.prototype.cacheOffsets = function()
	{
		if(!this.image)
		{
			return;
		}

		this.width = this.image.width * this.scale_x;
		this.height = this.image.height * this.scale_y;
		this.left_offset = this.width * this.anchor_x;
		this.top_offset = this.height * this.anchor_y;
		this.right_offset = this.width * (1.0 - this.anchor_x);
		this.bottom_offset = this.height * (1.0 - this.anchor_y);

		if(this.cached_rect)
			this.cached_rect.resizeTo(this.width, this.height);
		return this;
	}

	scorch.Entity.prototype.rect = function()
	{
		if(!this.cached_rect)
			this.cached_rect = new scorch.Rect(this.x, this.top, this.width, this.height);
		this.cached_rect.moveTo(this.x - this.left_offset, this.y - this.top_offset);
		return this.cached_rect;
	}

	scorch.Entity.prototype.draw = function()
	{
		if(!this.image)
		{
			return this;
		}

		this.context.save();
		this.context.translate(this.x, this.y);
		if(this.mirrored == "horizontal")
		{
			this.context.scale(1, -1);
		}
		else if(this.mirrored == "vertical")
		{
			this.context.scale(-1, 1);
		}
		if(this.angle!=0)
		{
			scorch.context.rotate(this.angle * Math.PI / 180);
		}
		this.flipped && this.context.scale(-1, 1);
		this.context.globalAlpha = this.alpha;
		this.context.translate(-this.left_offset, -this.top_offset);
		this.context.drawImage(this.image, 0, 0, this.width, this.height);
		this.context.restore();
		return this;
	}

	scorch.Entity.prototype.asCanvasContext = function()
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;

		var context = canvas.getContext("2d");
		context.mozImageSmoothingEnabled = scorch.context.mozImageSmoothingEnabled;

		context.drawImage(this.image, 0, 0, this.width, this.height);
		return context;
	}

	scorch.Entity.prototype.asCanvas = function()
	{
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;

		var context = canvas.getContext("2d");
		context.mozImageSmoothingEnabled = scorch.context.mozImageSmoothingEnabled;

		context.drawImage(this.image, 0, 0, this.width, this.height);
		return canvas;
	}

	scorch.Entity.prototype.toString = function() { return "[Entity " + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.width + ", " + this.height + "]" }

	scorch.Entity.prototype.attributes = function()
	{
		var object = this.options;
		object["_constructor"] = this._constructor || "scorch.Entity";
		object["x"] = parseFloat(this.x.toFixed(2));
		object["y"] = parseFloat(this.y.toFixed(2));
		object["image"] = this.image_path;
		object["alpha"] = this.alpha;
		object["flipped"] = this.flipped;
		object["mirrored"] = this.mirrored;
		object["angle"] = parseFloat(this.angle.toFixed(2));
		object["scale_x"] = this.scale_x;
		object["scale_y"] = this.scale_y;
		object["anchor_x"] = this.anchor_x;
		object["anchor_y"] = this.anchor_y;

		return object;
	}

	scorch.Entity.prototype.toJSON = function()
	{
		return JSON.stringify(this.attributes());
	}

	return scorch;
})
(scorch || {});

// EntityList
var scorch = (function(scorch)
{
	scorch.EntityList = function EntityList(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee( options );

		this.entities = [];
		this.length = 0;

		if(options)
		{
			this.load(options);
			this.alwaysActive = options.alwaysActive;
		}
	}

	scorch.EntityList.prototype.at = function(index)
	{
		return this.entities[index];
	}

	scorch.EntityList.prototype.concat = function()
	{
		return this.entities.concat.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.indexOf = function(searchElement, fromIndex)
	{
		return this.entities.indexOf(searchElement, fromIndex);
	}

	scorch.EntityList.prototype.join = function(separator)
	{
		return this.entities.join(separator);
	}

	scorch.EntityList.prototype.lastIndexOf = function()
	{
		return this.entities.lastIndexOf.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.pop = function()
	{
		var element = this.entities.pop();
		this.updateLength();
		return element;
	}

	scorch.EntityList.prototype.push = function()
	{
		this.entities.push.apply(this.entities, arguments);
		this.updateLength();
		return this.length;
	}

	scorch.EntityList.prototype.reverse = function()
	{
		this.entities.reverse();
	}

	scorch.EntityList.prototype.shift = function()
	{
		var element = this.entities.shift();
		this.updateLength();
		return element;
	}

	scorch.EntityList.prototype.slice = function(start, end)
	{
		return this.entities.slice(start, end);
	}

	scorch.EntityList.prototype.sort = function()
	{
		this.entities.sort.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.splice = function()
	{
		var removedElements = this.entities.splice.apply(this.entities, arguments);
		this.updateLength();
		return removedElements;
	}

	scorch.EntityList.prototype.unshift = function()
	{
		this.entities.unshift.apply(this.entities, arguments);
		this.updateLength();
		return this.length;
	}

	scorch.EntityList.prototype.updateLength = function()
	{
		this.length = this.entities.length;
	}

	scorch.EntityList.prototype.valueOf = function()
	{
		return this.toString();
	}

	scorch.EntityList.prototype.filter = function()
	{
		return this.entities.filter.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.forEach = function()
	{
		this.entities.forEach.apply(this.entities, arguments);
		this.updateLength();
	}

	scorch.EntityList.prototype.every = function()
	{
		return this.entities.every.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.map = function()
	{
		return this.entities.map.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.reduce = function()
	{
		return this.entities.reduce.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.reduceRight = function()
	{
		return this.entities.reduceRight.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.some = function()
	{
		return this.entities.some.apply(this.entities, arguments);
	}

	scorch.EntityList.prototype.isEntityList = function()
	{
		return true;
	}

	scorch.EntityList.prototype.load = function(objects)
	{
		var that = this;
		if(scorch.isArray(objects))
		{
			if(objects.every(function(item)
				{
					return item._constructor
				}))
			{
				parseArray(objects);
			}
			else
			{
				this.entities = objects;
			}
		}
		else if(scorch.isString(objects))
		{
			parseArray( JSON.parse(objects) );
			console.log(objects);
		}
		this.updateLength()

		function parseArray(array)
		{
			array.forEach( function(data)
			{
				var constructor = data._constructor ? eval(data._constructor) : data.constructor;
				if(scorch.isFunction(constructor))
				{
					scorch.log("Creating " + data._constructor + "(" + data.toString() + ")", true);
					var object = new constructor(data);
					object._constructor = data._constructor || data.constructor.name;
					that.push(object);
				}
			});
		}
	}

	scorch.EntityList.prototype.remove = function(obj)
	{
		var index = this.indexOf(obj);
		if(index > -1)
		{
			this.splice(index, 1);
		}
		this.updateLength()
	}

	scorch.EntityList.prototype.draw = function()
	{
		this.forEach(function(ea)
		{
			ea.draw();
		});
	}

	scorch.EntityList.prototype.drawIf = function(condition)
	{
		this.forEach(function(ea)
		{
			if( condition(ea) )
			{
				ea.draw();
			}
		});
	}

	scorch.EntityList.prototype.update = function()
	{
		var that = this;
		this.forEach(function(ea)
		{
			ea.update();
			if(!that.alwaysActive)
			{
				if(scorch.isOutsideCanvas(ea))
				{
					that.remove(ea);
				}
			}
		});
	}

	scorch.EntityList.prototype.kill = function(obj)
	{
		var that = this;
		this.forEach(function(ea)
		{
			if(obj == ea)
			{
				ea.kill();
				that.remove(ea);
			}
		});
	}

	scorch.EntityList.prototype.updateIf = function(condition)
	{
		this.forEach(function(ea)
		{
			if( condition(ea) )
			{
				ea.update();
			}
		});
	}

	scorch.EntityList.prototype.deleteIf = function(condition)
	{
		this.removeIf(condition);
	}

	scorch.EntityList.prototype.removeIf = function(condition)
	{
		this.entities = this.filter(function(ea)
		{
			return !condition(ea);
		});
		this.updateLength();
	}

	scorch.EntityList.prototype.toString = function()
	{
		return "[EntityList " + this.length + " entities]"
	};

	return scorch;
})
(scorch || {});

// EntityFrame
var scorch = (function(scorch)
{
	function cutImage(image, x, y, width, height)
	{
		var cut = document.createElement("canvas");
		cut.width = width;
		cut.height = height;

		var ctx = cut.getContext("2d");
		ctx.drawImage(image, x, y, width, height, 0, 0, cut.width, cut.height);

		return cut;
	};

	scorch.EntityFrame = function EntityFrame(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee( options );

		this.image = scorch.isDrawable(options.image) ? options.image : scorch.assets.data[options.image];
		this.orientation = options.orientation || "down";
		this.frame_size = options.frame_size || [32,32];
		this.frames = [];
		this.offset = options.offset || 0;

		if(options.scale_image)
		{
			var image = (scorch.isDrawable(options.image) ? options.image : scorch.assets.get(options.image));
			this.frame_size[0] *= options.scale_image;
			this.frame_size[1] *= options.scale_image;
		}

		var index = 0;

		if(this.orientation == "down")
		{
			for(var x=this.offset; x < this.image.width; x += this.frame_size[0])
			{
				for(var y=0; y < this.image.height; y += this.frame_size[1])
				{
					this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) );
				}
			}
		}
		else
		{
			for(var y=this.offset; y < this.image.height; y += this.frame_size[1])
			{
				for(var x=0; x < this.image.width; x += this.frame_size[0])
				{
					this.frames.push( cutImage(this.image, x, y, this.frame_size[0], this.frame_size[1]) );
				}
			}
		}
	}

	scorch.EntityFrame.prototype.toString = function()
	{
		return "[EntityFrame " + this.frames.length + " frames]"
	}

	return scorch;
})
(scorch || {});

// Animation
var scorch = (function(scorch)
{
	scorch.Animation = function Animation(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee( options );

		this.options = options;
		this.frames = options.frames || [];
		this.frame_duration = options.frame_duration || 100;
		this.index = options.index || 0;
		this.loop = (options.loop == undefined) ? 1 : options.loop;
		this.bounce = options.bounce || 0;
		this.frame_direction = 1;
		this.frame_size = options.frame_size;
		this.orientation = options.orientation || "down";
		this.on_end = options.on_end || null;
		this.offset = options.offset || 0;

		if(options.scale_image)
		{
			var image = (scorch.isDrawable(options.entity_frame) ? options.entity_frame : scorch.assets.get(options.entity_frame));
			this.frame_size[0] *= options.scale_image;
			this.frame_size[1] *= options.scale_image;
		}

		if(options.entity_frame)
		{
			var image = (scorch.isDrawable(options.entity_frame) ? options.entity_frame : scorch.assets.get(options.entity_frame));
			var entity_frame = new scorch.EntityFrame({image: image, frame_size: this.frame_size, orientation: this.orientation, offset: this.offset});
			this.frames = entity_frame.frames;
		}

		this.current_tick = (new Date()).getTime();
		this.last_tick = (new Date()).getTime();
		this.sum_tick = 0;
	}

	scorch.Animation.prototype.update = function()
	{
		this.current_tick = (new Date()).getTime();
		this.sum_tick += (this.current_tick - this.last_tick);
		this.last_tick = this.current_tick;

		if(this.sum_tick > this.frame_duration)
		{
			this.index += this.frame_direction;
			this.sum_tick = 0;
		}
		if( (this.index >= this.frames.length) || (this.index < 0) )
		{
			if(this.bounce)
			{
				this.frame_direction = -this.frame_direction;
				this.index += this.frame_direction * 2;
			}
			else if(this.loop)
			{
				this.index = 0;
			}
			else
			{
				this.index -= this.frame_direction;
				if (this.on_end)
				{
					this.on_end();
					this.on_end = null;
				}
			}
		}
		return this;
	}

	scorch.Animation.prototype.slice = function(start, stop)
	{
		var o = {};
		o.frame_duration = this.frame_duration;
		o.loop = this.loop;
		o.bounce = this.bounce;
		o.on_end = this.on_end;
		o.frame_direction = this.frame_direction;
		o.frames = this.frames.slice().slice(start, stop);
		return new scorch.Animation(o);
	};

	scorch.Animation.prototype.next = function()
	{
		this.update();
		return this.frames[this.index];
	};

	scorch.Animation.prototype.atLastFrame = function()
	{
		return (this.index == this.frames.length-1);
	}

	scorch.Animation.prototype.atFirstFrame = function()
	{
		return (this.index == 0);
	}

	scorch.Animation.prototype.currentFrame = function()
	{
		return this.frames[this.index];
	};

	scorch.Animation.prototype.toString = function()
	{
		return "[Animation, " + this.frames.length + " frames]";
	}

	return scorch;
})
(scorch || {});

// Rectangle
var scorch = (function(scorch)
{
	scorch.Rect = function Rect(x, y, width, height)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(x, y, width, height);

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.right = x + width;
		this.bottom = y + height;
	}

	scorch.Rect.prototype.getPosition = function()
	{
		return [this.x, this.y];
	}

	scorch.Rect.prototype.move = function(x,y)
	{
		this.x += x;
		this.y += y;
		this.right += x;
		this.bottom += y;
		return this;
	}

	scorch.Rect.prototype.moveTo = function(x,y)
	{
		this.x = x;
		this.y = y;
		this.right = this.x + this.width;
		this.bottom = this.y + this.height;
		return this;
	}

	scorch.Rect.prototype.resize = function(width,height)
	{
		this.width += width;
		this.height += height;
		this.right = this.x + this.width;
		this.bottom = this.y + this.height;
		return this;
	}

	scorch.Rect.prototype.resizeTo = function(width,height)
	{
		this.width = width;
		this.height = height;
		this.right = this.x + this.width;
		this.bottom = this.y + this.height;
		return this;
	}

	scorch.Rect.prototype.draw = function()
	{
		scorch.context.strokeStyle = "red";
		scorch.context.strokeRect(this.x, this.y, this.width, this.height);
		return this;
	}

	scorch.Rect.prototype.collidePoint = function(x, y)
	{
		return (x >= this.x && x <= this.right && y >= this.y && y <= this.bottom);
	}

	scorch.Rect.prototype.collideRect = function(rect)
	{
		return ((this.x >= rect.x && this.x <= rect.right) || (rect.x >= this.x && rect.x <= this.right)) &&
			   ((this.y >= rect.y && this.y <= rect.bottom) || (rect.y >= this.y && rect.y <= this.bottom));
	}

	scorch.Rect.prototype.collideRightSide = function(rect)
	{
		return(this.right >= rect.x && this.x < rect.x);
	}

	scorch.Rect.prototype.collideLeftSide = function(rect)
	{
		return(this.x > rect.x && this.x <= rect.right);
	}

	scorch.Rect.prototype.collideTopSide = function(rect)
	{
		return(this.y >= rect.y && this.y <= rect.bottom);
	}
	
	scorch.Rect.prototype.collideBottomSide = function(rect)
	{
		return(this.bottom >= rect.y && this.y < rect.y);
	}

	scorch.Rect.prototype.toString = function()
	{
		return "[Rect " + this.x + ", " + this.y + ", " + this.width + ", " + this.height + "]";
	}

	return scorch;
})
(scorch || {});

// Collision
var scorch = (function(scorch)
{
	scorch.collideOneWithOne = function(object1, object2)
	{
		if(object1.radius && object2.radius && object1 !== object2 && scorch.collideCircles(object1, object2))
			return true;
		if(object1.rect && object2.rect && object1 !== object2 && scorch.collideRects( object1.rect(), object2.rect()))
			return true;
		return false;
	}

	scorch.collideOneWithMany = function(object, list)
	{
		return list.filter( function(item)
			{
				return scorch.collideOneWithOne(object, item);
			});
	}

	scorch.collideManyWithMany = function(list1, list2)
	{
		var a = [];

		if(list1 === list2)
		{
			combinations(list1, 2).forEach( function(pair)
			{
				if( scorch.collideOneWithOne(pair[0], pair[1]) )
					a.push([pair[0], pair[1]]);
			});
		}
		else
		{
			list1.forEach( function(item1)
			{ 
				list2.forEach( function(item2)
				{
					if(scorch.collideOneWithOne(item1, item2))
						a.push([item1, item2]);
				});
			});
		}

		return a;
	}

	scorch.collideCircles = function(object1, object2)
	{
		return ( scorch.distanceBetween(object1, object2) < object1.radius + object2.radius );
	}

	scorch.collideRects = function(rect1, rect2)
	{
		return ((rect1.x >= rect2.x && rect1.x <= rect2.right) || (rect2.x >= rect1.x && rect2.x <= rect1.right)) &&
			   ((rect1.y >= rect2.y && rect1.y <= rect2.bottom) || (rect2.y >= rect1.y && rect2.y <= rect1.bottom));
	}

	scorch.distanceBetween = function(object1, object2)
	{
		return Math.sqrt( Math.pow(object1.x-object2.x, 2) + Math.pow(object1.y-object2.y, 2) );
	}

	function combinations(list, n)
	{
		var f = function(i)
		{
			if(list.isEntityList !== undefined)
			{
				return list.at(i);
			}
			else
			{
				return list[i];
			}
		};
		var r = [];
		var m = new Array(n);
		for (var i = 0; i < n; i++)
			m[i] = i; 
		for (var i = n - 1, sn = list.length; 0 <= i; sn = list.length)
		{
			r.push( m.map(f) );
			while (0 <= i && m[i] == sn - 1)
			{
				i--;
				sn--;
			}
			if (0 <= i)
			{ 
				m[i] += 1;
				for (var j = i + 1; j < n; j++)
					m[j] = m[j-1] + 1;
				i = n - 1;
			}
		}
		return r;
	}

	function hasItems(array)
	{
		return (array && array.length > 0);
	}

	return scorch;
})
(scorch || {});

// Particle
var scorch = (function(scorch)
{
	scorch.Particle = function Particle(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(options);

		this.isAlive = true;
		this.x = options.x;
		this.y = options.y;
		this.vx = options.vx;
		this.vy = options.vy;
		this.angle = options.angle || 0;
		this.left_offset = 0;
		this.top_offset = 0;
		this.right_offset = 0;
		this.bottom_offset = 0;
		if(options.radius)
		{
			this.radius = options.radius;
		}
		else if(options.width)
		{
			this.width = options.width;
		}

		if(options.image)
		{
			this.setImage(options.image);
			this.anchor(options.anchor || "center");
		}
		else
		{
			this.r = options.r;
			this.g = options.g;
			this.b = options.b;
			this.color = "RGBA(" + this.r + ", " + this.g + ", " + this.b + "," + this.a + ")";
		}
		this.a = options.alpha;
		this.alpha = this.a;

		this.maxAge = options.age || 100;
		this.age = options.age || 100;
		this.decayRate = options.decayRate || 0.5;

		this.options = options;
	}

	scorch.Particle.prototype.set = function(options)
	{
		this.isAlive = true;
		this.x = options.x;
		this.y = options.y;
		this.vx = options.vx;
		this.vy = options.vy;
		this.angle = options.angle || 0;
		this.left_offset = 0;
		this.top_offset = 0;
		this.right_offset = 0;
		this.bottom_offset = 0;
		if(options.radius)
		{
			this.radius = options.radius;
		}
		else if(options.width)
		{
			this.width = options.width;
		}

		if(options.image)
		{
			this.setImage(options.image);
			this.anchor(options.anchor || "center");
		}
		else
		{
			this.r = options.r;
			this.g = options.g;
			this.b = options.b;
			this.color = "RGBA(" + this.r + ", " + this.g + ", " + this.b + "," + this.a + ")";
		}
		this.a = options.alpha;
		this.alpha = this.a;

		this.maxAge = options.age || 100;
		this.age = options.age || 100;
		this.decayRate = options.decayRate || 0.5;

		this.options = options;
	}

	scorch.Particle.prototype.getPosition = function()
	{
		return [this.x, this.y];
	}

	scorch.Particle.prototype.update = function()
	{
		if(this.isAlive)
		{
			this.age-= this.decayRate;
			this.a = this.alpha * (this.age / this.maxAge);
			if(!this.image)
			{
				this.color = "RGBA(" + this.r + ", " + this.g + ", " + this.b + "," + this.a + ")";
			}
			this.x += this.vx;
			this.y += this.vy;
			if(this.age <= 0)
			{
				this.isAlive = false;
			}
		}
		return this;
	}

	scorch.Particle.prototype.draw = function()
	{
		if(this.isAlive)
		{
			scorch.context.save();
			scorch.context.globalCompositeOperation = "lighter";
			if(this.angle != 0)
			{
				scorch.context.rotate(this.angle * Math.PI / 180);
			}
			scorch.context.beginPath();
				if(!this.image)
				{
					if(this.options.radius)
					{
						var gradient = scorch.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
						gradient.addColorStop(0, "RGBA(255, 255, 255," + this.a + ")");
						gradient.addColorStop(0.05, "RGBA(255, 255, 255," + this.a + ")");
						gradient.addColorStop(0.05, this.color);
						gradient.addColorStop(1, "RGBA(0, 0, 0," + this.a + ")");

						scorch.context.fillStyle = gradient;
						scorch.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
					}
					else if(this.options.width)
					{
						scorch.context.rect(this.x, this.y, this.width, this.width);
						scorch.context.fillStyle = this.color;
					}
				}
				else
				{
					scorch.context.globalAlpha = this.a;
					scorch.context.translate(-this.left_offset, -this.top_offset);
					scorch.context.drawImage(this.image, this.x, this.y, this.image.width, this.image.width);
				}
			scorch.context.fill();
			scorch.context.restore();
		}
		return this;
	}

	scorch.Particle.prototype.setImage = function(value)
	{
		var that = this;

		if(scorch.isDrawable(value))
		{
			this.image = value;
		}
		else
		{
			if(scorch.assets.isLoaded(value))
			{
				this.image = scorch.assets.get(value);
			}
			else
			{
				scorch.assets.load(value, function() { that.image = scorch.assets.get(value); });
			}
		}
	}

	scorch.Particle.prototype.anchor = function(value)
	{
		var anchors =
		{
			top_left: [0,0],
			left_top: [0,0],
			center_left: [0,0.5],
			left_center: [0,0.5],
			bottom_left: [0,1],
			left_bottom: [0,1],
			top_center: [0.5,0],
			center_top: [0.5,0],
			center_center: [0.5,0.5],
			center: [0.5,0.5],
			bottom_center: [0.5,1],
			center_bottom: [0.5,1],
			top_right: [1,0],
			right_top: [1,0],
			center_right: [1,0.5],
			right_center: [1,0.5],
			bottom_right: [1,1],
			right_bottom: [1,1]
		};

		if(a = anchors[value])
		{
			this.anchor_x = a[0];
			this.anchor_y = a[1];
			if(this.image)
				this.left_offset = this.image.width * this.anchor_x;
				this.top_offset = this.image.height * this.anchor_y;
				this.right_offset = this.image.width * (1.0 - this.anchor_x);
				this.bottom_offset = this.image.height * (1.0 - this.anchor_y);
		}
		return this;
	}

	return scorch;
})
(scorch || {});

// Emitter
var scorch = (function(scorch)
{
	scorch.Emitter = function Emitter(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(options);

		this.isAlive = true;
		this.canFire = true;
		this.x = options.x;
		this.y = options.y;
		this.vx = options.vx;
		this.vy = options.vy;

		if(options.endY)
		{
			this.endY = options.endY;
		}

		this.frequency = options.frequency;
		this.untilFire = this.frequency;
		this.age = options.age;
		this.type = options.type;

		this.options = options;

		this.particles = [];
	}

	scorch.Emitter.prototype.getPosition = function()
	{
		return [this.x, this.y];
	}

	scorch.Emitter.prototype.update = function()
	{
		if(this.age > 0)
		{
			this.age--;
			// Create new particle
			if(this.canFire)
			{
				this.canFire = false;

				if(this.type == "Spark_Red")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX, vy: dirY, image: "resources/img/Particles/Spark_Red.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Spark_Green")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX, vy: dirY, image: "resources/img/Particles/Spark_Green.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Spark_Blue")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX, vy: dirY, image: "resources/img/Particles/Spark_Blue.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Beam_Red")
				{
					var dirX, dirY;

					for(var i = this.y; i > this.endY; i-= 15)
					{
						var index = -1;
						for(var j = 0; j < this.particles.length; j++)
						{
							if(this.particles[j].isAlive)
								continue;
							else
							{
								index = j;
								break;
							}
						}

						if(index >= 0)
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles[index].set({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Red.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75});
						}
						else
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles.push(new scorch.Particle({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Red.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
						}
					}
				}

				if(this.type == "Beam_Green")
				{
					var dirX, dirY;

					for(var i = this.y; i > this.endY; i-= 15)
					{
						var index = -1;
						for(var j = 0; j < this.particles.length; j++)
						{
							if(this.particles[j].isAlive)
								continue;
							else
							{
								index = j;
								break;
							}
						}

						if(index >= 0)
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles[index].set({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Green.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75});
						}
						else
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles.push(new scorch.Particle({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Green.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
						}
					}
				}

				if(this.type == "Beam_Blue")
				{
					var dirX, dirY;

					for(var i = this.y; i > this.endY; i-= 15)
					{
						var index = -1;
						for(var j = 0; j < this.particles.length; j++)
						{
							if(this.particles[j].isAlive)
								continue;
							else
							{
								index = j;
								break;
							}
						}

						if(index >= 0)
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles[index].set({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Blue.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75});
						}
						else
						{
							dirX = (Math.random() * 2) - 1;
							dirY = (Math.random() * 2) - 1;
							this.particles.push(new scorch.Particle({x: this.x, y: i, vx: dirX, vy: dirY, image: "resources/img/Particles/Beam_Blue.png", alpha: 0.5, radius: 12, age: 30, decayRate: 0.75}));
						}
					}
				}

				if(this.type == "Fire")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					var speed = Math.floor(Math.random() * 1.5) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
					this.particles.push(new scorch.Particle({x: this.x+1, y: this.y+1, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Smoke")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					var speed = Math.floor(Math.random()) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Smoke.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
					this.particles.push(new scorch.Particle({x: this.x+1, y: this.y+1, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Smoke.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Explosion")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2) - 1;
					var speed = Math.floor(Math.random() * 1.5) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
					this.particles.push(new scorch.Particle({x: this.x+1, y: this.y+1, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", radius: 10, age: 30, decayRate: 0.75}));
					
					dirX = (Math.random() * 2) - 1;
					dirY = (Math.random() * 2) - 1;
					speed = Math.floor(Math.random()) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Smoke.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
				}

				if(this.type == "Exhaust")
				{
					var dirX = (Math.random() * 2) - 1;
					var dirY = (Math.random() * 2);
					var speed = Math.floor(Math.random() * 1.5) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Smoke.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.5}));
					dirX = (Math.random() * 2) - 1;
					dirY = (Math.random() * 2);
					speed = Math.floor(Math.random() * 1.5) + 1;
					this.particles.push(new scorch.Particle({x: this.x, y: this.y, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
					this.particles.push(new scorch.Particle({x: this.x+1, y: this.y+1, vx: dirX * speed, vy: dirY * speed, image: "resources/img/Particles/Fire.png", alpha: 0.5, radius: 10, age: 30, decayRate: 0.75}));
				}
			}
			else
			{
				this.untilFire--;
				if(this.untilFire <= 0)
				{
					this.untilFire = this.frequency;
					this.canFire = true;
				}
			}
		}
		// Update and kill existing particles
		var stillAlive = false;
		for(var i = 0; i < this.particles.length; i++)
		{
			this.particles[i].update();
			if(this.particles[i].age <= 0)
			{
				this.kill(i);
			}
			else
			{
				stillAlive = true;
			}
		}
		if(!stillAlive)
		{
			this.isAlive = false;
		}
	}

	scorch.Emitter.prototype.draw = function()
	{
		for(var i = 0; i < this.particles.length; i++)
		{
			this.particles[i].draw();
		}
	}

	scorch.Emitter.prototype.kill = function(index)
	{
        this.particles[index].isAlive = false;
	}

	return scorch;
})
(scorch || {});

// Background
var scorch = (function(scorch)
{
	scorch.Background = function Background(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(options);

		this.setImage(options.image);
		this.anchor(options.anchor || "center");
		this.x = options.x;
		this.y = options.y;
		this.alpha = options.alpha || 1;
		this.scrollSpeed = options.scrollSpeed || 0;

		this.options = options;
	}

	scorch.Background.prototype.update = function()
	{
		this.y += this.scrollSpeed;
		return this;
	}

	scorch.Background.prototype.draw = function()
	{
		scorch.context.save();
		scorch.context.globalCompositeOperation = "lighter";
		scorch.context.beginPath();
			scorch.context.globalAlpha = this.alpha;
			scorch.context.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
		scorch.context.fill();
		scorch.context.restore();
		return this;
	}

	scorch.Background.prototype.setImage = function(value)
	{
		var that = this;

		if(scorch.isDrawable(value))
		{
			this.image = value;
		}
		else
		{
			if(scorch.assets.isLoaded(value))
			{
				this.image = scorch.assets.get(value);
			}
			else
			{
				scorch.assets.load(value, function() { that.image = scorch.assets.get(value); });
			}
		}
	}

	scorch.Background.prototype.anchor = function(value)
	{
		var anchors =
		{
			top_left: [0,0],
			left_top: [0,0],
			center_left: [0,0.5],
			left_center: [0,0.5],
			bottom_left: [0,1],
			left_bottom: [0,1],
			top_center: [0.5,0],
			center_top: [0.5,0],
			center_center: [0.5,0.5],
			center: [0.5,0.5],
			bottom_center: [0.5,1],
			center_bottom: [0.5,1],
			top_right: [1,0],
			right_top: [1,0],
			center_right: [1,0.5],
			right_center: [1,0.5],
			bottom_right: [1,1],
			right_bottom: [1,1]
		};

		if(a = anchors[value])
		{
			this.anchor_x = a[0];
			this.anchor_y = a[1];
			if(this.image)
				this.left_offset = this.image.width * this.anchor_x;
				this.top_offset = this.image.height * this.anchor_y;
				this.right_offset = this.image.width * (1.0 - this.anchor_x);
				this.bottom_offset = this.image.height * (1.0 - this.anchor_y);
		}
		return this;
	}

	return scorch;
})
(scorch || {});

// ParallaxLayer
var scorch = (function(scorch)
{
	scorch.ParallaxLayer = function ParallaxLayer(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(options);

		this.backgrounds = [];
		this.currentImage = 0;
		this.layerSpeed = options.speed;
		this.layer = options.layer || "background";

		this.options = options;
	}

	scorch.ParallaxLayer.prototype.add = function(options)
	{
		options.scrollSpeed = this.layerSpeed;
		this.backgrounds.push(new scorch.Background(options));
	}

	scorch.ParallaxLayer.prototype.loop = function()
	{
		if(this.backgrounds[this.currentImage].y >= scorch.canvas.height)
		{
			var y = 0;
			if(this.currentImage + 1 >= this.backgrounds.length)
				y = this.backgrounds[0].image.height;
			else
				y = this.backgrounds[this.currentImage + 1].image.height;
			for(var i = 0; i < this.backgrounds.length; i++)
			{
				y -= this.backgrounds[i].image.height;
			}
			this.backgrounds[this.currentImage].y = y;
			if(this.currentImage + 1 >= this.backgrounds.length)
				this.currentImage = 0;
			else
				this.currentImage++;
		}
	}

	scorch.ParallaxLayer.prototype.update = function()
	{
		for(var i = 0; i < this.backgrounds.length; i++)
		{
			this.backgrounds[i].update();
		}
		this.loop();
		return this;
	}

	scorch.ParallaxLayer.prototype.draw = function()
	{
		this.backgrounds[this.currentImage].draw();

		if(this.currentImage + 1 <= this.backgrounds.length - 1)
		{
			this.backgrounds[this.currentImage + 1].draw();
			if(this.currentImage != 0)
				this.backgrounds[this.currentImage - 1].draw();
		}
		else
			this.backgrounds[0].draw();
		return this;
	}

	return scorch;
})
(scorch || {});

// Parallax
var scorch = (function(scorch)
{
	scorch.Parallax = function Parallax()
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee();

		this.layers = [];

	}

	scorch.Parallax.prototype.add = function(layer)
	{
		this.layers.push(layer);
		return this;
	}

	scorch.Parallax.prototype.update = function()
	{
		for(var i = 0; i < this.layers.length; i++)
		{
			this.layers[i].update();
		}

		return this;
	}

	scorch.Parallax.prototype.draw = function(layer)
	{
		for(var i = 0; i < this.layers.length; i++)
		{
			if(this.layers[i].layer == layer)
				this.layers[i].draw();
		}

		return this;
	}

	return scorch;
})
(scorch || {});

// Vec2
var scorch = (function(scorch)
{
	scorch.Vec2 = function Vec2(options)
	{
		if( !(this instanceof arguments.callee) )
			return new arguments.callee(options);

	    this.x = options.x;
	    this.y = options.y;
	    this.options = options;
	}

	// Set current vector equal to passed vector
    scorch.Vec2.prototype.set = function(vect)
    {
        this.x = vect.x;
        this.y = vect.y;
    }
    
    // Set current vector equal to X and Y
    scorch.Vec2.prototype.setCoords = function(X, Y)
    {
        this.x = X;
        this.y = Y;
    }
    
    // Returns sum of current vector and passed vector
    scorch.add = function(vect)
    {
        var newVec = new Vec2(this.x + vect.x, this.y + vect.y);
        return newVec;
    }
    
    // Returns difference of current vector and passed vector
    scorch.sub = function(vect)
    {
        var newVec = new Vec2(this.x - vect.x, this.y - vect.y);
        return newVec;
    }
    
    // Returns product of current vector and passed vector
    scorch.mult = function(vect)
    {
        var newVec = new Vec2(this.x * vect.x, this.y * vect.y);
        return newVec;
    }
    
    // Returns quotient of current vector and passed vector
    scorch.div = function(vect)
    {
        var newVec = new Vec2(this.x / vect.x, this.y / vect.y);
        return newVec;
    }
    
    // Returns dot product of current vector and passed vector
    scorch.dot = function(vect)
    {
        return (this.x * vect.x) + (this.y * vect.y);
    }
    
    // Returns sum of current vector and scalar value
    scorch.scalAdd = function(scal)
    {
        var newVec = new Vec2(this.x + scal, this.y + scal);
        return newVec;
    }
    
    // Returns difference of current vector and scalar value
    scorch.scalSub = function(scal)
    {
        var newVec = new Vec2(this.x - scal, this.y - scal);
        return newVec;
    }
    
    // Returns product of current vector and scalar value
    scorch.scalMult = function(scal)
    {
        var newVec = new Vec2(this.x * scal, this.y * scal);
        return newVec;
    }
    
    // Returns quotient of current vector and scalar value
    scorch.scalDiv = function(scal)
    {
        var newVec = new Vec2(this.x / scal, this.y / scal);
        return newVec;
    }
    
    // Returns magnitude of current vector
    scorch.magnitude = function()
    {
        var mag = Math.sqrt((this.x * this.x + this.y * this.y));
        return mag;
    }
    
    // Returns vector that is between current vector and passed vector, where second parameter is percentage distance between both vectors
    // (Linear interpolation between 2 vectors)
    scorch.lerp = function(vect, scal)
    {
        var temp = new Vec2(this.x, this.y);
        var temp2 = new Vec2(vect.x, vect.y);
        temp.set(temp.sub(temp2));
        temp.set(temp.scalMult(scal));
        temp.set(temp.add(temp2));
        return temp;
    }
    
    // Returns distance between current vector and passed vector
    scorch.distance = function(vect)
    {
        var distance = Math.sqrt((vect.x - this.x) * (vect.x - this.x) + (vect.y - this.y) * (vect.y - this.y));
        return distance;
    }
    
    // Returns angle in degrees between current vector and passed vector
    scorch.angleDegrees = function(start, end)
    {
        var angle = Math.atan2((end.y - start.y), (end.x - start.x));
        angle = angle / Math.PI * 180;
        return angle;
    }
    
    // Returns angle in radians between current vector and passed vector
    scorch.angleRad = function(start, end)
    {
        var angle = Math.atan2((end.y - start.y), (end.x - start.x));
        return angle;
    }
    
    // Returns angle in degrees between origin and current vector
    scorch.curAngleDegrees = function()
    {
        var angle = Math.atan2(this.y, this.x);
        angle = angle / Math.PI * 180;
        return angle;
    }
    
    // Returns angle in radians between origin and current vector
    scorch.curAngleRad = function()
    {
        var angle = Math.atan2(this.y, this.x);
        return angle;
    }
    
    // Returns normalized version of current vector
    scorch.normalize = function()
    {
        var mag = this.magnitude();
        if(mag == 0)
        {
            mag = 1;
        }
        var newVec = new Vec2(this.x / mag, this.y / mag);
        return newVec;
    }

    // Returns the normal vector of current vector
    scorch.normal = function()
    {
        return new Vec2(-this.y, this.x);
    }
    
    // Returns the inverse of the normal vector of current vector
    scorch.inverseNormal = function()
    {
        return new Vec2(this.y, -this.x);
    }
    
    // Returns boolean indicating if current vector and passed vector are equal
    scorch.equal = function(vect)
    {
        if(this.x == vect.x && this.y == vect.y)
        {
            return true;
        }
        return false;
    }

	return scorch;
})
(scorch || {});

// Lighting
var Lighting = (function(scorch)
{
	scorch.Lighting = function Lighting(options)
	{
		this.lights = [];
		this.options = options;
	}

	scorch.Lighting.prototype.draw = function()
	{
		this.imageData = scorch.context.getImageData(0, 0, scorch.width, scorch.height);
		this.pixelData = this.imageData.data;
		this.buffer = new ArrayBuffer(this.imageData.data.length);
		this.buffer8 = new Uint8ClampedArray(this.buffer);
		this.data = new Uint32Array(this.buffer);

		for(var y = 0; y < scorch.height; y++)
		{
			for(var x = 0; x < scorch.width; x++)
			{
				var index = (y * scorch.width + x) * 4;
				var lightCount = this.lights.length;
				var red = 0;
				var green = 0;
				var blue = 0;
				var alpha = 0;

				for(var i = 0; i < lightCount; i++)
				{
					red 	+= this.lights[i].red + this.pixelData[index];
					green 	+= this.lights[i].green + this.pixelData[++index];
					blue 	+= this.lights[i].blue + this.pixelData[++index];
					alpha 	+= this.lights[i].alpha + this.pixelData[++index];
				}

				red /= lightCount + 1;
				green /= lightCount + 1;
				blue /= lightCount + 1;
				alpha /= lightCount + 1;

				this.data[y * scorch.width + x] =
				(alpha	<< 24) | // Alpha
				(blue 	<< 16) | // Blue
				(green 	<<  8) | // Green
				red;			 // Red
			}
		}

		this.imageData.data.set(this.buffer8);
		scorch.context.putImageData(this.imageData, 0, 0);
	}

	scorch.Lighting.prototype.add = function(light)
	{
		this.lights.push(light);
	}

	return scorch;
})
(scorch || {});

var Light = (function(scorch)
{
	scorch.Light = function Light(options)
	{
		this.x = options.x || scorch.width / 2;
		this.y = options.y || scorch.height / 2;
		this.red = options.red || 0;
		this.green = options.green || 0;
		this.blue = options.blue || 0;
		this.alpha = options.alpha || 0;
		this.radius = options.radius || 10;
		this.lightCanvas = document.createElement('canvas');
		this.lightCanvas.width = this.radius;
		this.lightCanvas.height = this.radius;
		this.buffer = this.lightCanvas.getContext('2d');
		this.overlay = this.buffer.getImageData(0, 0, this.W, this.H);
		this.data = this.overlay.data;
		this.options = options;
		this.init();
	}

	scorch.Light.prototype.init = function()
	{
		for(var y = this.y - this.radius; y < this.y + this.radius; y++)
		{
			for(var x = this.x - this.radius; x < this.x + this.radius; x++)
			{
				this.red 	+= this.red;
				this.green 	+= this.green;
				this.blue 	+= this.blue;
				this.alpha 	+= this.alpha / this.distanceSquared({x: x, y: y},{x: this.x, y: this.y});

				this.data[y * this.radius + x] =
				(this.alpha	<< 24) | // Alpha
				(this.blue 	<< 16) | // Blue
				(this.green <<  8) | // Green
				this.red;			 // Red
			}
		}
	}

	scorch.Light.prototype.distanceSquared = function(p2, p1)
	{
		return (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
	}

	return scorch;
})
(scorch || {});
/* Lighting system currently broken
var scorch = (function(scorch)
{
	scorch.Lighting = function Lighting(options)
	{
		console.log("Constructing Lighting Engine...");
		this.dark = options.dark || 255;
		this.lightCanvas = document.createElement('canvas');
		this.overlay, this._overlay, this.W, this.H;
		this.resolution = 6;
		this.resChange = false;
		this.lightsOnScreen = 0;
		this.lights = [];
		this.options = options;
	}

	scorch.Lighting.prototype.init = function()
	{
		this.W = (scorch.canvas.width / this.resolution) + 1;
		this.H = (scorch.canvas.height / this.resolution) + 1;
		this.lightCanvas.width = this.W;
		this.lightCanvas.height = this.H;
		this.buffer = this.lightCanvas.getContext('2d');
		this.buffer.fillStyle = "rgba(0, 0, 0, " + this.dark + ")";
		this.buffer.fillRect(0, 0, this.W, this.H);
		this.overlay = this.buffer.getImageData(0, 0, this.W, this.H);
		this._overlay = this.buffer.getImageData(0, 0, this.W, this.H);
	}

	scorch.Lighting.prototype.addLight = function(options)
	{
		options.dark = this.dark;
		options.resolution = this.resolution;
		this.lights.push(new scorch.Light(options));
	}

	scorch.Lighting.prototype.resetPixelData = function()
	{
		var i = this.overlay.data.length;
		while(i--){ this.overlay.data[i] = this._overlay.data[i]; }
	}

	scorch.Lighting.prototype.setPixel = function(imageData, x, y, r, g, b, a)
	{
		index = (x + y * imageData.width) * 4;
		imageData.data[index+0] = r;
		imageData.data[index+1] = g;
		imageData.data[index+2] = b;
		imageData.data[index+3] = a;
	}

	scorch.Lighting.prototype.getPixel = function(imageData, x, y)
	{
		pixel = [];
		index = (x + y * imageData.width) * 4;
		pixel[0] = imageData.data[index+0];
		pixel[1] = imageData.data[index+1];
		pixel[2] = imageData.data[index+2];
		pixel[3] = imageData.data[index+3];
		return pixel;
	}

	scorch.Lighting.prototype.blendPixel = function(r, g, b, a, R, G, B, A, D, radius, specularity, shader)
	{
		pixel = [];
		specFactor = radius * specularity;
		distFactor = D / specFactor;
		ALPHA = A / 255;
		alpha = a / 255;
		through = Math.abs(a - A) / A;
		colorBleed = through / (1 + (specularity / (2 + (1 - specularity))));//Much testing went into creating this.
		switch(shader)
		{
			case 0:{ //Standard World Light
				pixel[0] = (((r * alpha + R * ALPHA) / 2)) + (R * (through / 1.5));
				pixel[1] = (((g * alpha + G * ALPHA) / 2)) + (G * (through / 1.5));
				pixel[2] = (((b * alpha + B * ALPHA) / 2)) + (B * (through / 1.5));
				pixel[3] = A * through;
			break;
			}
			case 1:{ //Specular Lights
				pixel[0] = (((r * alpha + R * ALPHA) / 2)) / distFactor + (R * colorBleed);
				pixel[1] = (((g * alpha + G * ALPHA) / 2)) / distFactor + (G * colorBleed);
				pixel[2] = (((b * alpha + B * ALPHA) / 2)) / distFactor + (B * colorBleed);
				pixel[3] = A * through;
			break;
			}
			case 2:{ //Hidden Light Pixel Shader
				pixel[0] = (((r * alpha + R * ALPHA) / 2) + (R * colorBleed) - (A - pixel[3])) / distFactor;
				pixel[1] = (((g * alpha + G * ALPHA) / 2) + (G * colorBleed) - (A - pixel[3])) / distFactor;
				pixel[2] = (((b * alpha + B * ALPHA) / 2) + (B * colorBleed) - (A - pixel[3])) / distFactor;
				pixel[3] = A * through;
			break;
			}
			default: { //Standard World Light
				pixel[0] = (((r * alpha + R * ALPHA) / 2)) + (R * colorBleed);
				pixel[1] = (((g * alpha + G * ALPHA) / 2)) + (G * colorBleed);
				pixel[2] = (((b * alpha + B * ALPHA) / 2)) + (B * colorBleed);
				pixel[3] = A * through;
			}
		}
		return pixel;
	}

	scorch.Lighting.prototype.drawLight = function(l)
	{
		//X = this.lightX(l.x); Y = this.lightY(l.y);
		X = l.x; Y = l.y;
		if(X - l.radius < this.W && X + l.radius > 0 && Y - l.radius < this.H && Y + l.radius > 0)
		{
			this.lightsOnScreen++;
			for(var x = X - l.radius; x < X + l.radius; x++)
			{
				t1 = x - X;
				sqDiffX = t1 * t1;
				for(var y = Y - l.radius; y < Y + l.radius; y++)
				{
					t2 = y - Y;
					sqDiffY = t2 * t2;
					sqXY = sqDiffX + sqDiffY;
					if(sqXY < l.radiusSq)
					{
						if(x < this.W && x >= 0 && y < this.H && y >= 0)
						{
							distance = Math.sqrt(sqXY);
							old = this.getPixel(this.overlay, x, y);
							neu = this.blendPixel(l.r, l.g, l.b, (this.dark - l.a) - (l.APL * (distance)), old[0], old[1], old[2], old[3], distance, l.radius, l.specularFactor, l.shader);
							this.setPixel(this.overlay, x, y, neu[0], neu[1], neu[2], neu[3]);
						}
					}
				}
			}
		}
	}

	scorch.Lighting.prototype.resize = function()
	{
		this.init();
		var i = this.lights.length;
		while(i--){ this.lights[i].resize(); }
	}

	scorch.Lighting.prototype.updateAndDraw = function()
	{
		this.update();
		this.draw();
	}

	scorch.Lighting.prototype.update = function()
	{
		if(scorch.game_loop.getTicks() % 1 == 0)
		{
			this.lightsOnScreen = 0;
			this.resetPixelData();
			var i = this.lights.length;
			while(i--){ this.drawLight( this.lights[i] ); }
		}
		if(this.resChange){ this.resize(); this.resChange = false; }
	}

	scorch.Lighting.prototype.draw = function()
	{
		this.buffer.putImageData(this.overlay, 0, 0);
		//scorch.context.drawImage(this.lightCanvas, this.bufferXOffset() - 1, this.bufferYOffset() - 1, scorch.canvas.width + this.resolution, scorch.canvas.height + this.resolution);

		scorch.context.save();
		scorch.context.globalCompositeOperation = "lighter";
		scorch.context.beginPath();
			scorch.context.globalAlpha = 1;
			scorch.context.drawImage(this.lightCanvas, 0, 0, scorch.canvas.width, scorch.canvas.height);
		scorch.context.fill();
		scorch.context.restore();
	}

	scorch.Lighting.prototype.bufferXOffset = function()
	{
		offset = Math.abs( (this.lightX(1) * this.resolution) - scorch.canvas.width / 2);
		return (offset * -1) + 3;
	}

	scorch.Lighting.prototype.bufferYOffset = function()
	{
		offset = Math.abs( (this.lightY(1) * this.resolution) - scorch.canvas.height / 2);
		return (offset * -1) + 4.5;
	}

	scorch.Lighting.prototype.lightX = function(x)
	{
		return Math.ceil(x + ((scorch.canvas.width / 2) / this.resolution));
	}

	scorch.Lighting.prototype.lightY = function(y)
	{
		return Math.ceil(y + ((scorch.canvas.height / 2) / this.resolution));
	}

	return scorch;
})
(scorch || {});

// Light
var scorch = (function(scorch)
{
	scorch.Light = function Light(options) // X, Y, R, G, B, Brightness, Radius, Shader, SpecularFactor, LightInterraction
	{
		// Light Brightness. 1 = darkest, 255 = brightest | shader = light style
		// Light Styles: 0 = normal, 1 = specular, 2 = hidden
		this.isLight = true;
		this.type = 'light';
		this.worldX = options.X;
		this.worldY = options.Y;
		this.brightness = options.Brightness > options.dark ? options.dark : options.Brightness;
		this.brightness = this.brightness < 1 ? 1 : this.brightness;
		this.shader = options.Shader;
		this.x = Math.round(options.X / options.resolution);
		this.y = Math.round(options.Y / options.resolution);
		this.r = options.R;
		this.g = options.G;
		this.b = options.B;
		this.a = options.dark - this.brightness;
		this.specularFactor = options.SpecularFactor;
		this.radius = Math.round(options.Radius / options.resolution);
		this.radiusSq = this.radius * this.radius;
		this.APL = ((options.dark - this.a) / this.radius);//alpha per layer
		this.interact = options.LightInterraction;

		//Lighting Entity Interaction Properties
		this.baseBrightness = this.a;
		this.baseSpecFactor = this.specularFactor;
		this.baseRadius = options.Radius;
		this.baseAPL = this.APL;
		this.options = options;
	}

	scorch.Light.prototype.setX = function(X)
	{
		this.x = Math.round(X / options.resolution);
	}

	scorch.Light.prototype.setY = function(Y)
	{
		this.y = Math.round(Y / options.resolution);
	}

	scorch.Light.prototype.update = function()
	{

	}

	scorch.Light.prototype.getShaderName = function()
	{
		switch(this.shader)
		{
			case 0:{
				return 'Normal';
				break;
			}
			case 1:{
				return 'Specular';
				break;
			}
			case 2:{
				return 'Hole';
				break;
			}
			default:{
				return 'Normal';
			}
		}
	}

	scorch.Light.prototype.toggleLightInteraction = function()
	{
		this.interact = !this.interact;
	}

	scorch.Light.prototype.changeShader = function()
	{
		this.shader = this.shader + 1 > 2 ? 0 : this.shader + 1;
	}

	scorch.Light.prototype.changeSpecFactor = function(amount)
	{
		this.specularFactor += amount;
		this.baseSpecFactor = this.specularFactor;
	}

	scorch.Light.prototype.setBrightness = function(new_b)
	{
		//I realized you can get some pretty baller effects with my lighting system when you don't limit the brightness.
		//this.brightness = new_b > lighting.dark ? lighting.dark : new_b;
		//this.brightness = new_b < 1 ? 1 : new_b;
		this.brightness = new_b;
		this.a = lighting.dark - this.brightness;
		this.APL = ((lighting.dark - this.a) / this.radius);//alpha per layer
		this.baseAPL = this.APL;
		this.baseBrightness = this.a;
	}

	scorch.Light.prototype.setRadius = function(new_radius)
	{
		this.radius = new_radius
		this.radiusSq = this.radius * this.radius;
		this.APL = ((lighting.dark - this.a) / this.radius);
		this.baseAPL = this.APL;
	}

	scorch.Light.prototype.resize = function()
	{
		this.setBaseValues();
		this.x = Math.floor(this.worldX / lighting.resolution);
		this.y = Math.floor(this.worldY / lighting.resolution);
		this.radius = Math.floor(this.baseRadius / lighting.resolution);
		this.radiusSq = this.radius * this.radius;
		this.APL = ((lighting.dark - this.a) / this.radius);//alpha per layer
		this.baseBrightness = this.a;
		this.baseSpecFactor = this.specularFactor;
		this.baseRadius = Radius;
		this.baseAPL = this.APL;
	}

	scorch.Light.prototype.setBaseValues = function()
	{
		this.a = this.baseBrightness;
		this.specularFactor = this.baseSpecFactor;
		this.APL = this.baseAPL;
	}

	scorch.Light.prototype.updateLightCoverage = function(percentCovered)
	{
		this.a = (this.baseBrightness + (10 * percentCovered));
		this.specularFactor = this.baseSpecFactor * (1 - percentCovered);
		this.APL = ((lighting.dark - this.a) / this.radius);
	}

	return scorch;
})
(scorch || {});
*/
window.addEventListener("load", function()
{
	if(scorch.onload) scorch.onload();
},
false);