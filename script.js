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

        }


        render(context) {
            this.player.draw(context);
    
        }

    }



    const game = new Game(canvas);
    game.render(ctx);
    console.log(game);




    function animate() {




    }



})