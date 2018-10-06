var score, bootScene, loadScene, titleScene, playScene, endScene, game;

score = 0;

bootScene = {
    key: 'boot',
    active: true,
    init: (config) => {
        console.log('[BOOT] init', config);
    },
    preload: () => {
        console.log('[BOOT] preload');
    },
    create: function() {
        'use strict';

        game.scene.start('load');
        game.scene.remove('boot');
    },
    update: () => {
        console.log('[BOOT] update');
    }
};

loadScene = {
    key: 'load',
    renderToTexture: true,
    x: 64,
    y: 64,
    width: 320,
    height: 200,
    init: (config) => {
        console.log('[LOAD] init', config);
    },
    preload: function() {
        'use strict';
        var loadLbl;

        loadLbl = this.add.text(80, 160, 'loading...',
                                {font: '30px Courier',
                                 fill: '#ffffff'});

        // Load images
        this.load.image('player', 'assets/circle-blue.png');
        this.load.image('enemy', 'assets/circle-red.png');
        this.load.image('platform', 'assets/square-green.png');

        // Load sound effects
    },
    create: function() {
        'use strict';
        game.scene.start('title');
        game.scene.remove('load');
    },
    update: () => {
        console.log('[LOAD] update');
    }
};

titleScene = {
    key: 'title',
    init: (config) => {
        console.log('[TITLE] init', config);
    },
    preload: () => {
        console.log('[TITLE] preload');
    },
    create: function() {
        'use strict';
        var nameLbl, startLbl;

        nameLbl = this.add.text(80, 160, 'WOOMP',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = this.add.text(80, 240, 'press "E" to start',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        this.input.keyboard.on('keydown_E', this.play, this);
    },
    update: () => {
        console.log('[TITLE] update');
    },
    extend: {
        play: function() {
            'use strict';
            console.log('[TITLE] play');
            game.scene.switch('title', 'play');
        }
    }
};

playScene = {
    key: 'play',
    create: function() {
        'use strict';
        var block, height, width;

        console.log('[PLAY] create');

        // this.keyboard = game.input.keyboard;

        // Walls
        this.walls = this.physics.add.staticGroup();


        // console.log(this.height);
        // console.log(this.game.height);
        height = 600;
        width = 800;
        block = this.walls.create(0, height - 32, 'platform')
            .setOrigin(0, 0)
            .setScale(25, 1)
            .refreshBody();

        block = this.walls.create(0, 0, 'platform')
            .setOrigin(0, 0)
            .setScale(25, 1)
            .refreshBody();

        block = this.walls.create(0, 32, 'platform')
            .setOrigin(0, 0)
            .setScale(1, 17)
            .refreshBody();

        block = this.walls.create(width - 32, 32, 'platform')
            .setOrigin(0, 0)
            .setScale(1, 17)
            .refreshBody();

        block = this.walls.create(200, 200, 'platform')
            .setOrigin(0, 0)
            .setScale(8, 1)
            .refreshBody();

        block = this.walls.create(400, 400, 'platform')
            .setOrigin(0, 0)
            .setScale(8, 1)
            .refreshBody();

        // Player
        this.player = this.physics.add.sprite(150, 150, 'player');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.playerSpeed = 300;

        this.physics.add.collider(this.player, this.walls);

        // game.physics.arcade.enable(this.player);

        // Enemies
        // this.enemies = game.add.group();
        // this.enemies.enableBody = true;
        // this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        // this.enemies.setAll('outOfBoundsKill', true);
        // this.enemies.setAll('checkWorldBounds', true);
        this.enemies = this.physics.add.group();
        // this.enemies = this.physics.add.group({
        //     key: 'star',
        //     repeat: 11,
        //     setXY: { x: 12, y: 0, stepX: 70 }
        // });

        this.enemiesKilled = 0;
        this.enemySpeed = 80;
        this.createEnemies();

        // Woomp
        this.woompTime = 0;
        this.woompTimeOffset = 300;

        // Controls
        this.cursors = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'woomp': Phaser.Input.Keyboard.KeyCodes.SPACEBAR
        });

        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.enemies);
        this.physics.add.overlap(this.player, this.enemies,
                                 this.end, null, this);

    },
    update: function() {
        'use strict';
        var enemy, that;

        // console.log('[PLAY] update');

        // Update player.
        this.player.body.setVelocityX(0);
        this.player.body.setVelocityY(0);
        if (this.cursors.right.isDown) {
            console.log('RIGHT');
            this.player.body.setVelocityX(this.playerSpeed);
        }
        else if (this.cursors.left.isDown) {
            console.log('LEFT');
            this.player.body.setVelocityX(-this.playerSpeed);
        }
        else if (this.cursors.up.isDown) {
            console.log('UP');
            this.player.body.setVelocityY(-this.playerSpeed);
        }
        else if (this.cursors.down.isDown) {
            console.log('DOWN');
            this.player.body.setVelocityY(this.playerSpeed);
        }

        if (this.cursors.woomp.isDown) {
            this.woomp();
        }

        // Update enemies.
        // Also could use this.enemies.children (array of objects).
        that = this;
        // this.enemies.forEach(function(enemy) {
        //     if ((Math.abs(enemy.body.velocity.x) < that.enemySpeed &&
        //          Math.abs(enemy.body.velocity.y) < that.enemySpeed) ||
        //         game.time.now > enemy.moveTime) {
        //         enemy.body.velocity.x = 0;
        //         enemy.body.velocity.y = 0;
        //         switch(game.rnd.integerInRange(0, 3)) {
        //         case 0:
        //             enemy.body.velocity.x = that.enemySpeed;
        //             break;
        //         case 1:
        //             enemy.body.velocity.y = that.enemySpeed;
        //             break;
        //         case 2:
        //             enemy.body.velocity.x = -that.enemySpeed;
        //             break;
        //         case 3:
        //             enemy.body.velocity.y = -that.enemySpeed;
        //             break;
        //         }
        //         enemy.moveTime = game.time.now + game.rnd.integerInRange(5, 10)*200;
        //     }
        // });

    },
    extend: {
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
                // enemy.anchor.setTo(0.5, 0.5);
            }
        },
        die: function(player, enemy) {
            'use strict';

            console.log('die');

            this.end();
        },
        end: function() {
            'use strict';
            console.log('[PLAY] end');
            this.scene.restart();
            game.scene.switch('play', 'end')
            this.cursors.right.isDown = false;
            this.cursors.left.isDown = false;
            this.cursors.up.isDown = false;
            this.cursors.down.isDown = false;
            console.log('CURSORS OFF');
        }
    }
};

endScene = {
    key: 'end',
    create: function() {
        'use strict';
        var scoreLbl, nameLbl, startLbl;

        scoreLbl = this.add.text(600, 10, 'Score: ' + score,
                                 {font: '30px Courier',
                                  fill: '#ffffff'});
        nameLbl = this.add.text(80, 160, 'YOU DIED',
                                {font: '50px Courier',
                                 fill: '#ffffff'});
        startLbl = this.add.text(80, 240, 'press "W" to restart',
                                 {font: '30px Courier',
                                  fill: '#ffffff'});

        this.input.keyboard.on('keydown_W', this.restart, this);
    },
    extend: {
        restart: function() {
            'use strict';
            game.scene.switch('end', 'title')
        }
    }
};


const gameConfig = {
    // type: Phaser.CANVAS,
    type: Phaser.AUTO,
    parent: 'game-div',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [ bootScene, loadScene, titleScene, playScene, endScene ]
};

game = new Phaser.Game(gameConfig);
game.scene.start('boot', { someData: '...arbitrary data' });
