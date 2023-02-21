window.addEventListener('load', () => {

    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;


    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';

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
            this.spriteHeight = 255;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            //  these two proeprties will defien the top left corner of the sprite image we are currently drawing to represent the player.
            this.spriteX = this.collisionX - (this.width/2);
            this.spriteY = this.collisionY - (this.height/2);
            this.frameX = 0;
            this.frameY = 0;
            this.image = document.getElementById('bull');


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
    }

    // JS classes are hoisted but they are not initialised until the specific line is called
    class Game {

        constructor(canvas) {
            this.canvas = canvas
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.topMargin = 260;
            this.debug = true;
            this.player = new Player(this); // this keyword refers to the entire object
            this.numberOfObstacles = 10;
            this.obstacles = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

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
                
            })

        }


        render(context) {
            this.obstacles.forEach((obstacle) => {
                obstacle.draw(context);
            })
            this.player.draw(context);
            this.player.update();

        }


        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
        }

        init() {
            // for (let i = 0; i < this.numberOfObstacles; i++){
            //     this.obstacles.push(new Obstacle(this));
            // }



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
   




    function animate() {
        // clears the old paint
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        // creates an endless animation loop
        requestAnimationFrame(animate);
    }


    animate();



});