function splashState()
{
	var parallax = new scorch.Parallax();
	var alpha = 1.0;
	var fadeRate = 0.01;
	var fadeIn = 0;
	var wait = 0;

	this.Init = function()
	{
		// Background
		var background = new scorch.ParallaxLayer({speed: 0, layer: "background"});
			background.add(new scorch.Background({image: "resources/img/Splash Screen/SplashScreen.png", x: 0, y: 0, alpha: 1}));

		parallax.add(background);
	}

	this.Update = function()
	{
		if(scorch.pressed("esc space"))
		{
			scorch.switchGameState(menuState);
		}

		switch(fadeIn)
		{
			case 0:
				alpha -= fadeRate;
				if(alpha <= 0)
				{
					alpha = 0;
					fadeRate = 0.01;
					fadeIn = 1;
				}
				fadeRate += 0.00005;
			break;
			case 1:
				wait++;
				if(wait >= 75)
				{
					fadeIn = 2;
					wait = 0;
				}
			break;
			case 2:
				alpha += fadeRate;
				if(alpha >= 1)
				{
					fadeIn = 3;
				}
				fadeRate += 0.00005;
			break;
			case 3:
				wait++;
				if(wait >= 45)
				{
					fadeIn = 4;
					wait = 0;
				}
			break;
			case 4:
				scorch.switchGameState(menuState);
			break;
			default:
			break;
		}
	}

	this.Draw = function()
	{
		// Clear screen
		scorch.clear();

		// Background
		parallax.draw("background");

		scorch.context.save();
		scorch.context.globalAlpha = alpha;
		scorch.context.beginPath();
		scorch.context.rect(0, 0, scorch.width, scorch.height);
		scorch.context.fillStyle = 'black';
		scorch.context.fill();
		scorch.context.restore();
	}
}