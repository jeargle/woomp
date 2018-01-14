var score, bootState, loadState, titleState, playState, endState, game;

score = 0;

bootState = {
    create: function() {
        'use strict';

        // Load physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.state.start('load');
    }
};

loadState = {
    preload: function() {
        'use strict';
        var loadLbl;

        loadLbl = game.add.text(80, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'});

        // Load images
        game.load.image('player', 'assets/circle-blue.png');
        game.load.image('enemy', 'assets/circle-red.png');
        game.load.image('platform', 'assets/square-green.png');

        // Load sound effects
    },
    create: function() {
        'use strict';
        game.state.start('title');
    }
};

titleState = {
    create: function() {
        'use strict';
        var nameLbl, startLbl, wKey;

        nameLbl = game.add.text(80, 160, 'WOOMP',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.addOnce(this.start, this);
    },
    start: function() {
        'use strict';
        game.state.start('play');
    }
};

playState = {
    create: function() {
        'use strict';
        var block;

        this.keyboard = game.input.keyboard;

        game.physics.startSystem(Phaser.Physics.ARCADE);


        // Walls
        this.walls = game.add.group();
        this.walls.enableBody = true;

        block = this.walls.create(0, game.world.height - 32, 'platform');
        block.scale.setTo(25, 1);
        block.body.immovable = true;

        block = this.walls.create(0, 0, 'platform');
        block.scale.setTo(25, 1);
        block.body.immovable = true;

        block = this.walls.create(0, 32, 'platform');
        block.scale.setTo(1, 17);
        block.body.immovable = true;

        block = this.walls.create(game.world.width - 32, 32, 'platform');
        block.scale.setTo(1, 17);
        block.body.immovable = true;

        block = this.walls.create(200, 200, 'platform');
        block.scale.setTo(8, 1);
        block.body.immovable = true;

        block = this.walls.create(400, 400, 'platform');
        block.scale.setTo(8, 1);
        block.body.immovable = true;

        // Player
        this.player = game.add.sprite(150, game.world.height - 150, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.playerSpeed = 300;

        game.physics.arcade.enable(this.player);

        // Enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemies.setAll('outOfBoundsKill', true);
        this.enemies.setAll('checkWorldBounds', true);
        this.enemiesKilled = 0;
        this.enemySpeed = 100;
        this.createEnemies();

        // Woomp
        this.woompTime = 0;
        this.woompTimeOffset = 300;

        // Controls
        this.cursors = game.input.keyboard.addKeys({
            'up': Phaser.Keyboard.W,
            'down': Phaser.Keyboard.S,
            'left': Phaser.Keyboard.A,
            'right': Phaser.Keyboard.D,
            'woomp': Phaser.Keyboard.SPACEBAR
        });

    },
    update: function() {
        'use strict';
        var enemy, that;

        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.collide(this.enemies, this.enemies);
        game.physics.arcade.overlap(this.player, this.enemies,
                                    this.end, null, this);

        // Update player.
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.playerSpeed;
        }
        else if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.playerSpeed;
        }
        else if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.playerSpeed;
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.playerSpeed;
        }

        if (this.cursors.woomp.isDown) {
            this.woomp();
        }

        // Update enemies.
        // Also could use this.enemies.children (array of objects).
        that = this;
        this.enemies.forEach(function(enemy) {
            if (Math.abs(enemy.body.velocity.x) < that.enemySpeed &&
                Math.abs(enemy.body.velocity.y) < that.enemySpeed) {
                // console.log('setting velocity');
                switch(game.rnd.integerInRange(0, 3)) {
                case 0:
                    enemy.body.velocity.x = that.enemySpeed;
                    break;
                case 1:
                    enemy.body.velocity.y = that.enemySpeed;
                    break;
                case 2:
                    enemy.body.velocity.x = -that.enemySpeed;
                    break;
                case 3:
                    enemy.body.velocity.y = -that.enemySpeed;
                    break;
                }
            }
        })

    },
    woomp: function() {
        'use strict';

        if (game.time.now > this.woompTime) {
            console.log('woomp');
            this.woompTime = game.time.now + this.woompTimeOffset;
        }
    },
    createEnemies: function() {
        'use strict';
        var i, positions, pos, enemy;

        console.log('createEnemies()');

        positions = [
            [50, 50],
            [150, 100],
            [250, 50],
            [350, 100]
        ];
        for (i=0; i<positions.length; i++) {
            pos = positions[i];
            enemy = this.enemies.create(pos[0], pos[1], 'enemy');
            enemy.anchor.setTo(0.5, 0.5);
        }
    },
    die: function(player, enemy) {
        'use strict';

        console.log('die');

        this.end();
    },
    end: function() {
        'use strict';
        game.state.start('end');
    }
};

endState = {
    create: function() {
        'use strict';
        var scoreLbl, nameLbl, startLbl, wKey;

        scoreLbl = game.add.text(600, 10, 'Score: ' + score,
                                 {font: '30px Courier',
                                  fill: '#ffffff'});
        nameLbl = game.add.text(80, 160, 'YOU DIED',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = game.add.text(80, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
        wKey.onDown.addOnce(this.restart, this);
    },
    restart: function() {
        'use strict';
        game.state.start('title');
    }
};


game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-div');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('title', titleState);
game.state.add('play', playState);
game.state.add('end', endState);

game.state.start('boot');
