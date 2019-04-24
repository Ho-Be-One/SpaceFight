
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var play = false; 

	document.getElementById("play").addEventListener("click", function () {
 
	var totalShoot = 0;
	function tShoot() {document.getElementById("shoot").textContent = totalShoot };
	tShoot();
	var damagesValue = 2;
	function damagesEcho() { document.getElementById("damages").textContent = damagesValue };
	damagesEcho();
	var scoreValue = 0;
	function scoreEcho() { document.getElementById("score").textContent = scoreValue };
	scoreEcho();
	var skillsvalus = 0;
	function skillsEcho() { document.getElementById("skills").textContent = "% " + skillsvalus };
	skillsEcho();
	var tReached = 0;
	function tTouch() { document.getElementById("targetReached").textContent = tReached };
	tTouch();
	gameLevelValue = 1;
	function gameLevelEcho() { document.getElementById("gameLevel").textContent = gameLevelValue };
	gameLevelEcho();
	
	var x = 300; // Coordinate x-axis SpanceShip 
	var y = 0; // Ordinate axis coordinates SpanceShip
	var velocity = 5; // Speed SpaceFighter
	
	// Switchs ///////////////////////////////////////////
	var haut = false; // Switch top
	var droite = false; // Switch right
	var bas = false; // Switch down
	var gauche = false; // Switch left
	
	var fire = 0; // Switch gun

	var sonTire = new Audio('sons/shoot.wav');
	var explosion = new Audio('sons/explosion.wav');
	var shock = new Audio('sons/shock.wav');
	var newLevel = new Audio('sons/level.mp3');
	var speed = new Audio('sons/speed.ogg');
	var round_1 = new Audio('sons/round_1.mp3');
	var round_2 = new Audio('sons/round_2.mp3');
	var round_3 = new Audio('sons/round_3.mp3');
	var round_4 = new Audio('sons/round_4.mp3');
	var round_5 = new Audio('sons/round_5.mp3');
	var round_6 = new Audio('sons/battleMode.mp3');
	var kill_it = new Audio('sons/kill_it.mp3');
	var domages = new Audio("sons/domages.mp3");
	var loser = new Audio("sons/loser.mp3");

	var widthBadBoy = 30; // la largeur bad boy
	var heightBlop = 10; // la hauteur bad boy
	var colorBadBoy = ["yellow", "green", "white"]; // Couleur niveau
	var colBlop = [0]; // coordonnées abscise et nombre de blop
	// var badBoySpeed = 3;
	var switchDirection = false;
	var badBoy_X = 100;
	var limitLeft = Math.min.apply(null, colBlop); // Les coordonnées du Blop le plus à gauche
	var limitRight = Math.max.apply(null, colBlop); // Les coordonnées du Blop le plus à droite
	var rocketSpeed = 10; // boulette speed
	var liveSpaceShip = 22;
	var liveBadBoy = 20;
	var calZoneImpactHeight = 0;

	// Function ////////////////////////////////////////////////////////// 
	function zoneArea(abscissaOne, abscissaTwo, objectWidth) {
		difference = abscissaOne - abscissaTwo;
		objectHalf = objectWidth/2;
		if(difference <= objectHalf && difference >= -(objectHalf)){
			return true;
		}
		return false;
		
	}

	// End function ////////////////////////////////////////////////////////// 




	document.getElementById("play").textContent = '';
	document.getElementById("message").textContent = '';

	play = true;

	function globalLoop() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

			


		function spaceShip(){
			// Move left and right
			gauche && x >= 5 ? x -= velocity :''
			droite && x <= 560 ? x += velocity : ''
			
			// // Move up and down
			// haut && y >= -300 ? y -=  velocity : ''
			// bas && y <= -5 ? y += velocity : ''
			
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.fillRect(x + 11, y + 685, 5, 5);
			ctx.fillRect(x + 8, y + 695, 12, 5);

			ctx.fillStyle = "white";
			ctx.fillRect(x + 0, y + 690, 30, 10);
			ctx.fillStyle = "red"
			ctx.fillRect(x + 4, y + 693, liveSpaceShip, 5);
			
			loop = window.requestAnimationFrame(globalLoop);

		}
		spaceShip();

		

		


		// Bad guy
		function badBoy(badBoy_Y, badBoySpeed, color) {

			if (switchDirection == true) {
				badBoy_X += badBoySpeed; 
				switchDirection = false;
				badBoy_X > canvas.width - limitRight - widthBadBoy ?	switchDirection = false : switchDirection = true;
			}
			else if (switchDirection == false) {
				badBoy_X -= badBoySpeed;
				badBoy_X < limitLeft ? switchDirection = true: switchDirection = false;	
			}
				ctx.beginPath();
				ctx.fillStyle = colorBadBoy[color];
				ctx.fillRect(badBoy_X , badBoy_Y, widthBadBoy, heightBlop);
				ctx.fillStyle = "red";
				ctx.fillRect(5 + badBoy_X , badBoy_Y + 4, liveBadBoy, 3);
				ctx.fillStyle = colorBadBoy[color];
				ctx.fillRect(5 + badBoy_X , badBoy_Y + 10, 4, 3);
				ctx.fillRect(20 + badBoy_X , badBoy_Y + 10, 4, 3);
				ctx.fillRect(17 + badBoy_X , badBoy_Y + -5, 1, 6);
				ctx.fillRect(13 + badBoy_X , badBoy_Y + -15, 1, 16);
				ctx.fillRect(9 + badBoy_X , badBoy_Y + -5, 1, 6);




				// Rocket bad boy
				function badBoyRocket() {
					
					roktY += rocketSpeed;
					ctx.beginPath();
					ctx.fillStyle = "red";
					ctx.fillRect(roktX + 13,  roktY + badBoy_Y, 2, 5);
					loop_1 = window.requestAnimationFrame(badBoyRocket);

					// touch floor
					if(roktY == 650 ){
						
						var checZone = zoneArea(x, roktX, widthBadBoy);
						if(checZone == true){
							liveSpaceShip -=1;
							if(liveSpaceShip < 0){
								damagesValue -=1;
								liveSpaceShip = 22 ;

								if(damagesValue >= 1){
									damagesValue -=1;
									play = false;
									document.getElementById("play").innerHTML = 'Geme Over';
									document.getElementById("message").innerHTML = 'Score ' + scoreValue ;

								}
							}
							damagesEcho();
							domages.play();
							cancelAnimationFrame(loop_1)
						}

					}else if(roktY >= canvas.height){
						cancelAnimationFrame(loop_1)
					}
				}
				var checZone = zoneArea(badBoy_X, x, widthBadBoy);
				if(checZone == true){badBoyRocket();}

				

				


				var roktX = x; // déclaration est affectation de coordonnées X pour le tire 
				var roktY = 0; // déclaration est affectation de coordonnées Y pour le tire 
				
				// rocket fire
				function rocket() {
					roktY -= rocketSpeed;
					ctx.beginPath();
					ctx.fillStyle = "yellow";
					ctx.fillRect(roktX + 13,  roktY + 678, 2, 5);
					loop_2 = window.requestAnimationFrame(rocket);
		
					// Le tire atteint le plafond
					
					calZoneImpactHeight = canvas.height + roktY - 20;

					if(calZoneImpactHeight == badBoy_Y){
						
						var checZone = zoneArea(roktX, badBoy_X, widthBadBoy);
						
						if(checZone == true){
							cancelAnimationFrame(loop_2);
							explosion.play();
							liveBadBoy -=1;
							liveBadBoy == 0 ? liveBadBoy = 20 : ''
							badBoy_X = Math.floor(Math.random() * Math.floor(canvas.width)); 
							switchDirection == true ? switchDirection = false : switchDirection = true;

							tReached +=1;
							skillsvalus = (tReached/totalShoot)*100;
							skillsvalus = Math.ceil(skillsvalus);

							scoreValue += skillsvalus * tReached * gameLevelValue;
							scoreValue = Math.ceil(scoreValue);
							skillsEcho();
							tTouch();
							scoreEcho();

						}

					}else if(roktY < -705){
						cancelAnimationFrame(loop_2);
					}
				}
		
				if(fire === 1){
					totalShoot +=1; 
					tShoot();
					sonTire.play(); // sound tire
					rocket();
				}



		}
		badBoy(50, 2, 0);





	play == false ? cancelAnimationFrame(loop):'';

	}
	globalLoop();
	
 
	// Action quand on enfonce la touche
	function yesMove(touche) {
		touche.keyCode == 32 ? fire += 1 :''
		touche.keyCode == 37 ? gauche = true :''
		touche.keyCode == 38 ? haut = true :''
		touche.keyCode == 39 ? droite = true :''
		touche.keyCode == 40 ? bas = true :''
		
	};
	// Action quand on relache la touche
	function stopMove(touche) {
		touche.keyCode == 32 ? fire = 0 : ''
		touche.keyCode == 37 ? gauche = false :''
		touche.keyCode == 38 ? haut = false :''
		touche.keyCode == 39 ? droite = false :''
		touche.keyCode == 40 ? bas = false :''
	};

	// Ecoute du keybord
	document.addEventListener('keydown', yesMove);
	document.addEventListener('keyup', stopMove);
});