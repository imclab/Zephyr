document.write('<script src="resources/js/states/Splash.js"></script>');
document.write('<script src="resources/js/states/Menu.js"></script>');
document.write('<script src="resources/js/states/Options.js"></script>');
document.write('<script src="resources/js/states/Credits.js"></script>');
document.write('<script src="resources/js/states/CharacterSelect.js"></script>');
document.write('<script src="resources/js/states/Mission.js"></script>');

document.write('<script src="resources/js/UI/Button.js"></script>');
document.write('<script src="resources/js/UI/Arrow.js"></script>');
document.write('<script src="resources/js/UI/RadioButton.js"></script>');
document.write('<script src="resources/js/UI/Slider.js"></script>');
document.write('<script src="resources/js/UI/SliderBackground.js"></script>');

function init()
{
	// Splash
    scorch.assets.add("resources/img/Splash Screen/SplashScreen.png");

    // UI
    scorch.assets.add("resources/img/UI/CF_Button.png");
    scorch.assets.add("resources/img/UI/CF_Button_Hover.png");
    scorch.assets.add("resources/img/UI/Arrow_Left.png");
    scorch.assets.add("resources/img/UI/Arrow_Left_Hover.png");
    scorch.assets.add("resources/img/UI/Arrow_Right.png");
    scorch.assets.add("resources/img/UI/Arrow_Right_Hover.png");
    scorch.assets.add("resources/img/UI/Arrow_Up.png");
    scorch.assets.add("resources/img/UI/Arrow_Up_Hover.png");
    scorch.assets.add("resources/img/UI/Arrow_Down.png");
    scorch.assets.add("resources/img/UI/Arrow_Down_Hover.png");
    scorch.assets.add("resources/img/UI/Radio_Button_On.png");
    scorch.assets.add("resources/img/UI/Radio_Button_Off.png");
    scorch.assets.add("resources/img/UI/Slider_Background.png");
    scorch.assets.add("resources/img/UI/Slider.png");
    scorch.assets.add("resources/img/UI/Reticle.png");

    // Backgrounds
    scorch.assets.add("resources/img/Backgrounds/Space_Parallax_Background_00.png");
    scorch.assets.add("resources/img/Backgrounds/Space_Parallax_Background_01.png");
    scorch.assets.add("resources/img/Backgrounds/Nebula_Parallax_Foreground_00.png");
    scorch.assets.add("resources/img/Backgrounds/Nebula_Parallax_Foreground_01.png");
    scorch.assets.add("resources/img/Backgrounds/BG_00.png");
    scorch.assets.add("resources/img/Backgrounds/BG_01.png");
    scorch.assets.add("resources/img/Backgrounds/BG_02.png");

    // Entities
    scorch.assets.add("resources/img/Characters/Enemy_Idle.png");

    scorch.assets.add("resources/img/Weapons/Player_Bullet.png");
    scorch.assets.add("resources/img/Weapons/Player_Beam.png");
    scorch.assets.add("resources/img/Weapons/Enemy_Bullet.png");

    // Ships
    scorch.assets.add("resources/img/Characters/Ships/ship1Green.png");
    scorch.assets.add("resources/img/Characters/Ships/ship2Green.png");
    scorch.assets.add("resources/img/Characters/Ships/ship3Green.png");

    scorch.assets.add("resources/img/Characters/Ships/ship1Grey.png");
    scorch.assets.add("resources/img/Characters/Ships/ship2Grey.png");
    scorch.assets.add("resources/img/Characters/Ships/ship3Grey.png");

    scorch.assets.add("resources/img/Characters/Ships/ship1Red.png");
    scorch.assets.add("resources/img/Characters/Ships/ship2Red.png");
    scorch.assets.add("resources/img/Characters/Ships/ship3Red.png");

    scorch.assets.add("resources/img/Characters/Ships/ship1Yellow.png");
    scorch.assets.add("resources/img/Characters/Ships/ship2Yellow.png");
    scorch.assets.add("resources/img/Characters/Ships/ship3Yellow.png");


    // Particles
    scorch.assets.add("resources/img/Particles/Fire.png");
    scorch.assets.add("resources/img/Particles/Smoke.png");
    scorch.assets.add("resources/img/Particles/Beam_Red.png");
    scorch.assets.add("resources/img/Particles/Beam_Green.png");
    scorch.assets.add("resources/img/Particles/Beam_Blue.png");
    scorch.assets.add("resources/img/Particles/Spark_Red.png");
    scorch.assets.add("resources/img/Particles/Spark_Green.png");
    scorch.assets.add("resources/img/Particles/Spark_Blue.png");

    var ship = {};
	ship.image = "resources/img/Characters/Ships/ship1Green.png";

    scorch.start(splashState, {cursor: false});
}