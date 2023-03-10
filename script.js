window.addEventListener('load', () => {

    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 710;


    // AUDIO
    const music = document.createElement("audio");
    music.src = "forest_beasts.mp3";
    


    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    //  font is a part of canvas state, and frequent changes to canvas state can effect performance

    ctx.font = '40px Bangers';
    ctx.textAlign = 'center';

    class Player {
        constructor(game){
            this.game = game; // Passed by reference, objects in JS are reference types
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            //  these two proeprties will defien the top left corner of the sprite image we are currently drawing to represent the player.
            this.spriteX = this.collisionX - (this.width/2);
            this.spriteY = this.collisionY - (this.height/2) - 100;;
            this.frameX = 0;
            this.frameY = 0;
            this.image = document.getElementById('bull');
            
        }


        restart() {

            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - (this.width/2);
            this.spriteY = this.collisionY - (this.height/2) - 100;

        }


        draw(context) {
            //  draw player image
            // context.drawImage(this.image, this.collisionX, this.collisionY);
            // context.drawImage(this.image, sx, sy, sw, sh, this.collisionX, this.collisionY, this.width, this.height);

            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

            if (this.game.debug) {

                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                // save method creates a snapshot of the current canvas state, including fillStyle
                // lineWidth, opacity (globalAlpha) as well as transformations and scaling
                context.globalAlpha = 0.5;
                context.fill();
                // restore method resets canvas settings to what they were before calling save
                context.restore();
                context.stroke();

                // save and restore methods allow us to apply specific drawing settings only to
                // selected shapes, without affecting the rest of our canvas drawings.

                context.beginPath();
                context.moveTo(this.collisionX, this.collisionY);
                context.lineTo(this.game.mouse.x, this.game.mouse.y);
                // call stroke to actually draw the line
                context.stroke();


            }
            


        }

        update() {


            // SPRITE ANIMATION

            // calculate the distance between the player and the mouse horizontally and vertically

            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;


            // MATH.ATAN2() - returns an angle in radians between the positive x axis and a line
            // , projected from 0, 0 towards a specific point
            //  expects dy first and then dx as arguments

            const angle = Math.atan2(this.dy, this.dx);
        
            // divide total radians in a circle (6.28) by 8 (total directions) and
            //  use the resultant figures to determine breakpoints for drawing different
            // parts of the sprite sheet.
            
            if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7; 
            else if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;
            
            
            // --------------------------------------------------------------------

            // PLAYER MOVEMENT

            // Technique 1

            // this.dx = this.game.mouse.x - this.collisionX;
            // this.dy = this.game.mouse.y - this.collisionY; 
            // this.speedX = (this.dx)*0.05;
            // this.speedY = (this.dy)*0.05;
            // this.collisionX += this.speedX;
            // this.collisionY += this.speedY;


            // Technique 2

            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY; 
            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier){
                this.speedX = this.dx/distance || 0;
                this.speedY = this.dy/distance || 0;
            } else {

                this.speedX = 0;
                this.speedY = 0;
            }
            
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
            this.spriteX = this.collisionX - (this.width/2);
            this.spriteY = this.collisionY - (this.height/2) - 100;



            // horizontal boundaries

            if (this.collisionX < (0 + this.collisionRadius)) {
                this.collisionX = (0 + this.collisionRadius);
            }

            else if (this.collisionX > this.game.width - this.collisionRadius) {
                this.collisionX = this.game.width - this.collisionRadius;
            }


            // vertical boundaries

            if (this.collisionY < (0 + this.game.topMargin + this.collisionRadius)){
                this.collisionY = this.game.topMargin + this.collisionRadius;
            }

            else if (this.collisionY > (this.game.height - this.collisionRadius)){

                this.collisionY = this.game.height - this.collisionRadius;
            }

            

            // collisions with obstacles
            this.game.obstacles.forEach(obstacle => {

                // return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
                // destructuring assignment - syntax is a Javascript expression that makes it possible to unpack values
                // from arrays, or properties from objects, into distinct variables

                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);
                if (collision) {
                    

                    //  SIMPLE PHYSICS
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii+ 1) * unit_y;

                }
                
            })
        }


    }


   

    class Obstacle {


        constructor(game){

            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
            this.image = document.getElementById('obstacles');
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - (this.width*0.5);
            this.spriteY = this.collisionY - (this.height*0.5) - 70;
            this.frameX = Math.floor(Math.random() * 4);
            this.frameY = Math.floor(Math.random() * 3);

        }

        draw(context) {
            // context.drawImage(this.image, sx, sy, sw, sh, this.collisionX,
            //     this.collisionY, this.width, this.height);

            context.drawImage(this.image, (this.frameX*this.spriteWidth), (this.frameY*this.spriteHeight), this.spriteWidth, this.spriteHeight, this.spriteX,
                this.spriteY, this.width, this.height);

            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                // save method creates a snapshot of the current canvas state, including fillStyle
                // lineWidth, opacity (globalAlpha) as well as transformations and scaling
                context.globalAlpha = 0.5;
                context.fill();
                // restore method resets canvas settings to what they were before calling save
                context.restore();
                context.stroke();

            }
            
        }

        update() {


        }
    }


    class Egg {

        constructor(game) {
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - (this.margin * 2)));
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - (this.width /2);
            this.spriteY = this.collisionY - (this.height/2) - 30;
            this.hatchTimer = 0;
            this.hatchInterval = 3000;
            this.markedForDeletion = false;
            
        }

        draw(context) {


            context.drawImage(this.image, this.spriteX, this.spriteY);
            
            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5);
            }
        }

        update(deltaTime) {
            this.spriteX = this.collisionX - (this.width /2);
            this.spriteY = this.collisionY - (this.height/2) - 30;

            // COLLISIONS
            // spread operator allows us to quickly expand elements in an array into another array
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies];

            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);

                if(collision) {
                    const unit_x = dx/distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }

            })


            // HATCHING
            
            if(this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY))
                this.markedForDeletion = true;
                this.game.removeGameObjects()
            } else {
                this.hatchTimer += deltaTime
            }

        }
    }


    class Larva {


        constructor(game, x, y) {

            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random();
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = Math.floor(2 * Math.random());

        }

        draw(context) {
            context.drawImage(this.image, this.frameX*this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update() {

            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - (this.width/2);
            this.spriteY = this.collisionY - (this.height/2) - 40;

            // move to safety
            if(this.collisionY < this.game.topMargin) {

                this.markedForDeletion = true;
                this.game.removeGameObjects();
                if(!this.game.gameOver) this.game.score++;

                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
                }
                
            }


            // COLLISION WITH OBJECTS
            // spread operator allows us to quickly expand elements in an array into another array
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.eggs];

            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);

                if(collision) {
                    const unit_x = dx/distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }

            });

            // collision with enemies
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0]) {
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    this.game.lostHatchlings ++;
                    for (let i = 0; i < 5; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'blue'));
                    }
                    


                }
            });

        }
    }


    class Enemy {


        constructor(game) {
            this.game = game;
            this.collisionRadius = 30;
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toads');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
            this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
            this.spriteX;
            this.spriteY;
            // navigate around the sprite sheet horizontally
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 4);
        }


        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save();
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }


        update() {

            this.spriteX = this.collisionX - this.spriteWidth/2;
            this.spriteY = this.collisionY - (this.spriteHeight / 2) - 100;

            this.collisionX -= this.speedX;

            if(this.spriteX + this.width < 0 && !this.game.gameOver){
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
                this.collisionY = this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
                this.frameY = Math.floor(Math.random() * 4);

            }


            let collisionObjects = [this.game.player, ...this.game.obstacles];

            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);

                if(collision) {
                    const unit_x = dx/distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }

            })
        }


    }



    // Object pooling - creating a collection of objects and only drawing them when you need them

    class Particle {
        constructor(game, x, y, color) {
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.color = color;
            this.radius = Math.floor(Math.random() * 10 + 5);
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * 2 + 0.5;
            this.angle = 0;
            this.va = Math.random() * 0.1 + 0.01;
            this.markedForDeletion = false;
        }

        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.beginPath();
            // Math.PI * 2 is a value in radians and it converts to 360 degrees (full circle). We have to use values in radians when passing them to the arc method.
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
        }

    }


    class Firefly extends Particle {

        update() {
            // va stands for angle velocity
            this.angle += this.va;
            this.collisionX += Math.cos(this.angle) * this.speedX;
            this.collisionY -= this.speedY;

            if (this.collisionY < 0 - this.radius) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }
        
        }


    }

    class Spark extends Particle {

        update() {

            this.angle += this.va * 0.5;
            this.collisionX -= Math.cos(this.angle) * this.speedX;
            this.collisionY -= Math.sin(this.angle) * this.speedY;

            if (this.radius > 0.1) this.radius -= 0.05;
            if( this.radius < 0.2) {
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            }


            
        }
    }


    // JS classes are hoisted but they are not initialised until the specific line is called
    class Game {

        constructor(canvas) {
            this.canvas = canvas
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = false;
            this.player = new Player(this); // this keyword refers to the entire object
            this.fps = 70;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.numberOfObstacles = 10;
            this.obstacles = [];
            this.maxEggs = 20;
            this.eggs = [];
            this.enemies = [];
            this.particles = [];
            this.hatchlings = [];
            this.gameObjects = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }
            this.winningScore = 30;
            this.lostHatchlings = 0;
            this.score = 0;
            this.gameOver = false;

            // event listeners - make sure they are automatically applied when creating an instance of the game

            // callback functions on event listeners auto generates an event object that contains
            // all kinds of information about the event that just happened
            // to get access to it we just need to give it a name.
            canvas.addEventListener('mousedown', (e) => {

                // one of the special features of ES6 arrow functions is that they
                // automatically inherit the reference to this keyword from the parent scope

                // offset.x/y coordinates give coordinates on the target node, e.g. canvas
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;

            });

            canvas.addEventListener('mouseup', (e) => {

                // one of the special features of ES6 arrow functions is that they
                // automatically inherit the reference to this keyword from the parent scope

                // offset.x/y coordinates give coordinates on the target node, e.g. canvas
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;

            });

            canvas.addEventListener('mousemove', (e) => {

                // one of the special features of ES6 arrow functions is that they
                // automatically inherit the reference to this keyword from the parent scope

                // offset.x/y coordinates give coordinates on the target node, e.g. canvas
                if (this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }

           
               
                

            });

            window.addEventListener('keydown', (e) => {

                if(e.key == 'd') this.debug = !this.debug;

                else if (e.key == 'r') this.restart()
                
            })

        }

        removeGameObjects() {


            this.eggs = this.eggs.filter((egg) => {

                if (!egg.markedForDeletion) {
                    return true;
                }
            })

            this.hatchlings = this.hatchlings.filter((larva) => {

                if(!larva.markedForDeletion) {

                    return true;
                }
            })


            this.particles = this.particles.filter((particle) => {

                if(!particle.markedForDeletion){
                    return true;
                }
            })
        }


        render(context, deltaTime) {
            if (this.timer > this.interval){
                // animate next frame
           
                // clears the old paint
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                
                this.gameObjects = [...this.eggs, ...this.obstacles, this.player, ...this.enemies, ...this.hatchlings, ...this.particles];


                 // sort game objects by vertical position to determine draw order

                // built in array sort function can take a compare function as an argument

                this.gameObjects.sort((a, b) => {
                    return a.collisionY - b.collisionY;

                });

                // Draw the game objects
                this.gameObjects.forEach((object) => {
                    object.draw(context);
                    object.update(deltaTime);
                })

               


                // this.obstacles.forEach((obstacle) => {
                //     obstacle.draw(context);
                // })
                // this.player.draw(context);
                // this.player.update();

                this.timer = 0;

            }
            this.timer += deltaTime;


            // add eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && (!this.gameOver)){
                this.addEgg();
                this.eggTimer = 0;
                
            } else {
                this.eggTimer += deltaTime;
            }

            // draw status text
            context.save();
            context.textAlign = 'left';
            context.fillText('SCORE: ' + this.score, 25, 50);

            if (this.debug) {
                context.fillText('LOST: ' + this.lostHatchlings, 25, 100)
            }
            context.restore();


            if (this.score >= this.winningScore) {
                this.gameOver = true;
                context.save();
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = "center";
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                let message1, message2;
                if (this.lostHatchlings <= 5) {
                    // win
                    message1 = "Bullseye!!!"
                    message2 = "You bullied the bullies!"
                } else {
                    // lose
                    message1 = "Bollocks!";
                    message2 = "You lost " + this.lostHatchlings + "hatchlings, don't be a pushover!";

                }
                context.font = "130px Bangers";
                context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
                context.font = "40px Bangers";
                context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText("Final score " + this.score + ". Press 'R' to butt heads again!", this.width * 0.5, this.height * 0.5 + 80);
                context.restore();
            }

        }


        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
        }


        addEgg() {
            this.eggs.push(new Egg(this));
        }

        addEnenmy() {

            this.enemies.push(new Enemy(this));
        }


        restart() {

            this.player.restart();
            this.obstacles = [];
            this.eggs = [];
            this.enemies = [];
            this.hatchlings = [];
            this.particles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }
            this.score = 0;
            this.lostHatchlings = 0;
            this.gameOver = false;
            this.init();

        }

        init() {
            // for (let i = 0; i < this.numberOfObstacles; i++){
            //     this.obstacles.push(new Obstacle(this));
            // }


            // AUDIO
            music.play();

            for (let i =0; i < 3; i++) {
                this.addEnenmy();
                

            }


            // circle packing
            let attempts = 0;
            while (this.obstacles.length < this.numberOfObstacles && attempts<500) {
                let testObstacle = new Obstacle(this);
                let overlap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;
                    const distance = Math.hypot(dy, dx);
                    const distanceBuffer = 150;
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;
                    if (distance < (sumOfRadii)) {
                        overlap = true;
                    }
                });
                const margin = testObstacle.collisionRadius * 3;
                if (!overlap && testObstacle.spriteX>0 && 
                    (testObstacle.spriteX<(this.width-testObstacle.width)) &&
                    testObstacle.collisionY > (this.topMargin + margin) &&
                    testObstacle.collisionY < (this.height-margin)
                    ){
                    this.obstacles.push(testObstacle);
                }

                attempts++;

            }
        }

        

    }



    const game = new Game(canvas);
    game.init();
   


    // timestamp of last animation loop
    let lastTime = 0;
    function animate(timeStamp) {
        
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        
        
        game.render(ctx, deltaTime);

        // creates an endless animation loop
        
        requestAnimationFrame(animate);
        
        //  delta time - the amount of milliseconds that passed between each call of requestAnimationFrame
        // only allow game to serve the next animation frame when a specific amount of milliseconds has passed

        // requestAnimationFrame() will automatically try to adjust itself to the screen refresh rate, in most cases 60 frames per second
        // it will automatically generate a timestamp and pass that timestamp to the function it calls, all we have to do is assign it a variable name

        // deltaTime is the difference between the timestamp from this animation loop and the timestamp from the previous animation loop.
    }

    // call with 0 to prevent NaN error when requestanimationframe first runs
    animate(0);



});