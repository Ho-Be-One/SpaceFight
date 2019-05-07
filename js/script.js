
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');


 
	var totalShoot = 200;
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
	let liveSpaceShip = 20;

	let loop;

    //////////////////////////////////////////////////////////////////
	function globalLoop(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		function spaceShip(){
			// Move left and right
			gauche && x >= 5 ? x -= velocity :''
			droite && x <= 560 ? x += velocity : ''
			
			// Move up and down
			haut && y >= -300 ? y -=  velocity : ''
			bas && y <= -5 ? y += velocity : ''
			
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.fillRect(x + 11, y + 685, 5, 5);
			ctx.fillRect(x + 8, y + 695, 12, 5);

			ctx.fillStyle = "white";
			ctx.fillRect(x + 0, y + 690, 30, 10);
			ctx.fillStyle = "red"
			ctx.fillRect(x + 4, y + 693, liveSpaceShip, 5);

			
		}
		spaceShip();

		loop = window.requestAnimationFrame(globalLoop);

	}
	globalLoop();
    //////////////////////////////////////////////////////////////////
	
 
	// Action quand on enfonce la touche
	function yesMove(touche) {
		touche.keyCode == 37 ? gauche = true :''
		touche.keyCode == 38 ? haut = true :''
		touche.keyCode == 39 ? droite = true :''
		touche.keyCode == 40 ? bas = true :''
		
	};
	// Action quand on relache la touche
	function stopMove(touche) {
		touche.keyCode == 37 ? gauche = false :''
		touche.keyCode == 38 ? haut = false :''
		touche.keyCode == 39 ? droite = false :''
		touche.keyCode == 40 ? bas = false :''
	};
	// Ecoute du keybord
	document.addEventListener('keydown', yesMove);
	document.addEventListener('keyup', stopMove);
