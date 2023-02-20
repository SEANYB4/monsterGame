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
            this.collisionRadius = 50;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;

        }


        draw(context) {

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

        update() {

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

            
        }
    }


    class Obstacle {


        constructor(game){

            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 100;

        }

        draw(context) {
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

    // JS classes are hoisted but they are not initialised until the specific line is called
    class Game {

        constructor(canvas) {
            this.canvas = canvas
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this); // this keyword refers to the entire object
            this.numberOfObstacles = 5;
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

        }


        render(context) {
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach((obstacle) => {
                obstacle.draw(context);
            })
    
        }

        init() {
            for (let i = 0; i < this.numberOfObstacles; i++){
                this.obstacles.push(new Obstacle(this));
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