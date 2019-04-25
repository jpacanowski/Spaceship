'use strict';

var mainState = {

    preload: function() {

        this.score = 0;
        this.laserTime = 0;

        /* load sprites */
        game.load.image('stars', 'assets/images/stars.png');
        game.load.image('ship', 'assets/images/ship.png');
        game.load.image('laser', 'assets/images/laser.png');
        game.load.image('invader', 'assets/images/invader.png');

        /* load audio */
        game.load.audio('shot', 'assets/audio/laser.mp3');
        game.load.audio('crash', 'assets/audio/crash.mp3');
        game.load.audio('music', 'assets/audio/music.mp3');
    },

    create: function() {

        /////////////////////////////////////////////////////////////////////////////////
        // BACKGROUND                                                                  //
        /////////////////////////////////////////////////////////////////////////////////

        this.stars = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'stars');

        /////////////////////////////////////////////////////////////////////////////////
        // SHIP                                                                        //
        /////////////////////////////////////////////////////////////////////////////////

        this.ship = game.add.sprite(game.world.centerX, game.world.centerY + 200, 'ship');
        
        /* set the anchorpoint to the middle */
        this.ship.anchor.setTo(0.5, 0.5);

        /* enable physics on the ship */
        game.physics.enable(this.ship, Phaser.Physics.ARCADE);

        /* set to collide against the world bounds */
        this.ship.body.collideWorldBounds = true;

        /////////////////////////////////////////////////////////////////////////////////
        // LASERS                                                                      //
        /////////////////////////////////////////////////////////////////////////////////

        /* create the group */
        this.lasers = game.add.group();

        /* enable physics for any object that is created in this group */
        this.lasers.enableBody = true;

        /* create 20 sprites */
        this.lasers.createMultiple(20, 'laser');

        this.lasers.setAll('anchor.x', 0.5);
        this.lasers.setAll('anchor.y', 1.0);

        this.lasers.setAll('outOfBoundsKill', true);

        this.lasers.setAll('checkWorldBounds', true);

        /////////////////////////////////////////////////////////////////////////////////
        // INVADERS                                                                    //
        /////////////////////////////////////////////////////////////////////////////////

        this.invaders = game.add.group();
        
        this.invaders.enableBody = true;
        this.invaders.physicsBodyType = Phaser.Physics.ARCADE;

        for(let y=0; y<=4; y++)
        {
            for(let x=0; x<=10; x++)
            {
                this.invader = this.invaders.create(x * 58, y * 60, 'invader');
                this.invader.anchor.setTo(0.5, 0.5);
            }
        }

        this.invaders.x = 100;
        this.invaders.y = 100;

        /* create our Timer */
        let timer = game.time.create(false);

        /* set a TimerEvent to occur after 2 seconds */
        timer.loop(2000, function() { this.invaders.y += 10; }, this);

        /* start the timer running */
        timer.start();

        /////////////////////////////////////////////////////////////////////////////////
        // TEXT                                                                        //
        /////////////////////////////////////////////////////////////////////////////////

        this.scoreText = game.add.text(85, 37, 'Score: ' + this.score,
            {font: "16px Courier", fill: "#fff"});

        this.winText = game.add.text(0, 0, "YOU ARE THE WINNER",
            {font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });

        this.winText.setTextBounds(0, 0, game.world.width, game.world.height);

        this.winText.visible = false;

        this.loseText = game.add.text(0, 0, "GAME OVER",
            {font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });

        this.loseText.setTextBounds(0, 0, game.world.width, game.world.height);

        this.loseText.visible = false;

        /////////////////////////////////////////////////////////////////////////////////
        // AUDIO                                                                       //
        /////////////////////////////////////////////////////////////////////////////////

        this.shot = game.add.audio('shot');

        this.crash = game.add.audio('crash');

        this.music = game.add.audio('music');
        this.music.volume = 0.4;
        this.music.loopFull();
        this.music.play();

        /////////////////////////////////////////////////////////////////////////////////
        // CURSORS                                                                     //
        /////////////////////////////////////////////////////////////////////////////////

        this.cursors = game.input.keyboard.createCursorKeys();
    },

    update: function() {

        this.ship.body.velocity.x = 0;
        this.stars.tilePosition.y += 2;

        /* check to see if the laser overlaps with a invader */
        game.physics.arcade.overlap(this.lasers, this.invaders, this.hitInvader, null, this);

        /* check to see if the ship overlaps with a invader */
        game.physics.arcade.overlap(this.ship, this.invaders, this.shipCrash, null, this);

        if(this.cursors.left.isDown)
        {
            this.ship.body.velocity.x = -300;
        }
        else if(this.cursors.right.isDown)
        {
            this.ship.body.velocity.x = 300;
        }

        if(this.cursors.up.isDown)
        {
            this.fireLaser();
        }

        if(this.score == 5500)
        {
            this.winText.visible = true;
            this.scoreText.visible = false;
        }
    },

    fireLaser: function() {

        if(game.time.now > this.laserTime)
        {
            /* get the first laser that's inactive */
            this.laser = this.lasers.getFirstExists(false);

            if(this.laser)
            {
                /* if we have a laser, set it to the starting position */
                this.laser.reset(this.ship.x, this.ship.y - 38);

                /* give it a velocity of -500 so it starts shooting */
                this.laser.body.velocity.y = -500;

                this.laserTime = game.time.now + 200;

                this.shot.play();
            }
        }
    },

    hitInvader: function(laser, invader) {
        
        laser.kill();
        invader.kill();

        this.score += 100;
        this.scoreText.text = 'Score: ' + this.score;
    },

    shipCrash: function(ship, invader) {
        
        this.ship.kill();
        this.invaders.destroy();

        this.crash.play();

        //game.camera.shake(0.05, 2000);

        this.loseText.visible = true;
        this.scoreText.visible = false;
    },
};