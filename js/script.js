
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var play = false; 

	document.getElementById("play").addEventListener("click", function () {
	
		// Display main message
		document.getElementById("play").style.display = "none";
		document.getElementById("message").style.display = "none";

		let parameter = {
			score:0,
			live:3,
			level:1,
			skills:0.00,
		}

		function dom(dom, init){
			document.getElementById(dom).textContent = init
		}
		
		dom("score", parameter.score)
		dom("live", parameter.live)
		dom("level", parameter.level)
		dom("skills", parameter.skills)
		
		//sound effect

		var sound = {
			fireGun:new Audio('sons/shoot.wav'),
			explosion:new Audio('sons/explosion.wav'),
			shock:new Audio('sons/shock.wav'),
			newLevel:new Audio('sons/level.mp3'),
			speed:new Audio('sons/speed.ogg'),
			round_1:new Audio('sons/round_1.mp3'),
			round_2:new Audio('sons/round_2.mp3'),
			round_3:new Audio('sons/round_3.mp3'),
			round_4:new Audio('sons/round_4.mp3'),
			round_5:new Audio('sons/round_5.mp3'),
			round_6:new Audio('sons/battleMode.mp3'),
			kill_it:new Audio('sons/kill_it.mp3'),
			domages:new Audio("sons/domages.mp3"),
			loser:new Audio("sons/loser.mp3"),
		}

		let paraShip = {
			X:300,
			Y:0,
			velocity:5,
			up:false,
			down:false,
			right:false,
			left:false,
			live:22,
			shootGun:false
		}
		let badBoy = {
			X:300,
			Y:0,
			color:['', 'yellow'],
			moveX:0,
			moveY:0,
			speedX:3,
			speedY:2,
			switchDirectionX:true,
			switchDirectionY:true
		}
		let paraGun = {
			X:[],
			Y:[],
			limit:685,
			fire:false,
			step:3,
		}
		
		let impactArea = {
			zone:0
		}
		
		function shootingArea(valuX, valuY){
			if(paraGun.X.length < 1){
				paraGun.X.push(valuX)
				paraGun.Y.push(valuY)
				sound.fireGun.play();
				paraGun.fire = true
			}
		}
		
		
		
		//////////////////////////////////////////////////////////////////
		function globalLoop(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			
			// Move left and right
			paraShip.left && paraShip.X >= 5 ? paraShip.X -= paraShip.velocity :''
			paraShip.right && paraShip.X <= 560 ? paraShip.X += paraShip.velocity : ''
			
			// // Move up and down
			paraShip.up && paraShip.Y >= -300 ? paraShip.Y -=  paraShip.velocity : ''
			paraShip.down && paraShip.Y <= -5 ? paraShip.Y += paraShip.velocity : ''
			
			ctx.beginPath();
			ctx.fillStyle = "white";
			ctx.fillRect(paraShip.X + 11, paraShip.Y + 685, 5, 5);
			ctx.fillRect(paraShip.X + 8, paraShip.Y + 695, 12, 5);
			
			ctx.fillStyle = "white";
			ctx.fillRect(paraShip.X + 0, paraShip.Y + 690, 30, 10);
			ctx.fillStyle = "red"
			ctx.fillRect(paraShip.X + 4, paraShip.Y + 693, paraShip.live, 5);
			

			
			if(badBoy.switchDirectionX){
				badBoy.moveX+=badBoy.speedX
				badBoy.moveX <= 560 ? badBoy.switchDirectionX = true:badBoy.switchDirectionX = false
			}
			else if (!badBoy.switchDirectionX){
				badBoy.moveX-=badBoy.speedX
				badBoy.moveX >= 0 ? badBoy.switchDirectionX = false:badBoy.switchDirectionX = true
			}

			if(badBoy.switchDirectionY){
				badBoy.moveY+=badBoy.speedY
				badBoy.moveY <= 200 ? badBoy.switchDirectionY = true:badBoy.switchDirectionY = false
			}
			else if (!badBoy.switchDirectionY){
				badBoy.moveY-=badBoy.speedY
				badBoy.moveY >= 0 ? badBoy.switchDirectionY = false:badBoy.switchDirectionY = true
			}

			//BadBoy
			ctx.beginPath();
			ctx.fillStyle = badBoy.color[parameter.level];
			ctx.fillRect(0 + badBoy.moveX, 6 + badBoy.moveY, 30, 10);
			ctx.fillRect(4 + badBoy.moveX, 3 + badBoy.moveY, 4, 3);
			ctx.fillRect(20 + badBoy.moveX, 0 + badBoy.moveY, 1, 6);
			ctx.fillRect(12 + badBoy.moveX, 16 + badBoy.moveY, 4, 3);
			ctx.fillStyle = "red";
			ctx.fillRect(2 + badBoy.moveX, 10 + badBoy.moveY, 25, 3);
			
			


			




			paraShip.shootGun ? shootingArea(paraShip.X, paraShip.Y):''

			if(paraGun.fire){
				paraGun.step+=10
				ctx.beginPath()
				ctx.fillStyle = "yellow"
				ctx.fillRect(
							paraGun.X[0]+13,
							paraGun.limit-paraGun.step+paraGun.Y[0],
							2,
							5
							)
				if((paraGun.step-paraGun.Y[0]) > paraGun.limit){
					paraGun.step=0,
					paraGun.X=[],
					paraGun.Y=[],
					paraGun.fire = false,
					paraShip.shootGun= false
				}
				else{
					console.log('bad by X : '+badBoy.moveX)
					console.log('bad by Y : '+badBoy.moveY)


				}

			}
			loop_globalLoop = window.requestAnimationFrame(globalLoop);
			
		}
		globalLoop();

		
		//////////////////////////////////////////////////////////////////
		
		// Push button 
		function yesMove(touche) {
			touche.keyCode == 32 ? paraShip.shootGun = true : ''
			touche.keyCode == 37 ? paraShip.left = true :''
			touche.keyCode == 39 ? paraShip.right = true :''
			touche.keyCode == 38 ? paraShip.up = true :''
			touche.keyCode == 40 ? paraShip.down = true :''
		}

		
		function stopMove(touche) {
			// touche.keyCode == 32 ? paraShip.shootGun = false : ''
			touche.keyCode == 37 ? paraShip.left = false :''
			touche.keyCode == 39 ? paraShip.right = false :''
			touche.keyCode == 38 ? paraShip.up = false :''
			touche.keyCode == 40 ? paraShip.down = false :''
		};

		// Ecoute du keybord
		document.addEventListener('keydown', yesMove);
		document.addEventListener('keyup', stopMove);
})