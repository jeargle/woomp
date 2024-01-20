let score, game

score = 0

class BootScene extends Phaser.Scene {
    constructor() {
        super('boot')
    }

    init(config) {
        console.log('[BOOT] init', config)
    }

    preload() {
        console.log('[BOOT] preload')
    }

    create() {
        game.scene.start('load')
        game.scene.remove('boot')
    }

    update() {
        console.log('[BOOT] update')
    }
}

class LoadScene extends Phaser.Scene {
    constructor() {
        super('load')
    }

    init(config) {
        console.log('[LOAD] init', config)
    }

    preload() {
        this.add.text(80, 160, 'loading...',
                      {font: '30px Courier',
                       fill: '#ffffff'})

        // Load images
        this.load.image('player', 'assets/circle-blue.png')
        this.load.image('enemy', 'assets/circle-red.png')
        this.load.image('platform', 'assets/square-green.png')

        // Load sound effects
    }

    create() {
        game.scene.start('title')
        game.scene.remove('load')
    }

    update() {
        console.log('[LOAD] update')
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super('title')
    }

    init(config) {
        console.log('[TITLE] init', config)
    }

    preload() {
        console.log('[TITLE] preload')
    }

    create() {
        this.add.text(80, 160, 'WOOMP',
                      {font: '50px Courier',
                       fill: '#ffffff'})
        this.add.text(80, 240, 'press "E" to start',
                      {font: '30px Courier',
                       fill: '#ffffff'})

        this.input.keyboard.on('keydown-E', this.play, this)
    }

    update() {
        console.log('[TITLE] update')
    }

    play() {
        console.log('[TITLE] play')
        game.scene.switch('title', 'play')
    }
}

class PlayScene extends Phaser.Scene {
    constructor() {
        super('play')
    }

    create() {
        console.log('[PLAY] create')

        // Walls
        this.walls = this.physics.add.staticGroup()

        const height = 600
        const width = 800
        let block = this.walls.create(0, height - 32, 'platform')
            .setOrigin(0, 0)
            .setScale(25, 1)
            .refreshBody()

        block = this.walls.create(0, 0, 'platform')
            .setOrigin(0, 0)
            .setScale(25, 1)
            .refreshBody()

        block = this.walls.create(0, 32, 'platform')
            .setOrigin(0, 0)
            .setScale(1, 17)
            .refreshBody()

        block = this.walls.create(width - 32, 32, 'platform')
            .setOrigin(0, 0)
            .setScale(1, 17)
            .refreshBody()

        block = this.walls.create(200, 200, 'platform')
            .setOrigin(0, 0)
            .setScale(8, 1)
            .refreshBody()

        block = this.walls.create(400, 400, 'platform')
            .setOrigin(0, 0)
            .setScale(8, 1)
            .refreshBody()

        // Player
        this.player = this.physics.add.sprite(150, 150, 'player')
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)
        this.playerSpeed = 300

        this.physics.add.collider(this.player, this.walls)

        // Enemies
        this.enemies = this.physics.add.group()
        this.enemiesKilled = 0
        this.enemySpeed = 80
        this.createEnemies()

        // Woomp
        this.woompTime = 0
        this.woompTimeOffset = 300

        // Controls
        this.cursors = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'woomp': Phaser.Input.Keyboard.KeyCodes.SPACE
        })

        this.physics.add.collider(this.enemies, this.walls)
        this.physics.add.collider(this.enemies, this.enemies)
        this.physics.add.overlap(this.player, this.enemies,
                                 this.end, null, this)

    }

    update() {
        let enemy, that, now

        // console.log('[PLAY] update')

        // Update player.
        this.player.body.setVelocityX(0)
        this.player.body.setVelocityY(0)
        if (this.cursors.right.isDown) {
            console.log('RIGHT')
            this.player.body.setVelocityX(this.playerSpeed)
        }
        else if (this.cursors.left.isDown) {
            console.log('LEFT')
            this.player.body.setVelocityX(-this.playerSpeed)
        }
        else if (this.cursors.up.isDown) {
            console.log('UP')
            this.player.body.setVelocityY(-this.playerSpeed)
        }
        else if (this.cursors.down.isDown) {
            console.log('DOWN')
            this.player.body.setVelocityY(this.playerSpeed)
        }

        if (this.cursors.woomp.isDown) {
            this.woomp()
        }

        // Update enemies.
        // Also could use this.enemies.children (array of objects).
        that = this
        this.enemies.children.iterate(function(enemy) {
            now = that.time.now
            const absVelX = Math.abs(enemy.body.velocity.x)
            const absVelY = Math.abs(enemy.body.velocity.y)
            if ((absVelX < that.enemySpeed &&
                 absVelY < that.enemySpeed) ||
                (absVelX > 0 && absVelY > 0) ||
                now > enemy.moveTime) {
                enemy.body.setVelocityX(0)
                enemy.body.setVelocityY(0)
                switch(Phaser.Math.RND.integerInRange(0, 3)) {
                case 0:
                    enemy.body.setVelocityX(that.enemySpeed)
                    break
                case 1:
                    enemy.body.setVelocityY(that.enemySpeed)
                    break
                case 2:
                    enemy.body.setVelocityX(-that.enemySpeed)
                    break
                case 3:
                    enemy.body.setVelocityY(-that.enemySpeed)
                    break
                }
                enemy.moveTime = now + Phaser.Math.RND.integerInRange(5, 10)*200
            }
        })
    }

    woomp() {
        const now = this.time.now

        if (now > this.woompTime) {
            console.log('woomp')
            this.woompTime = now + this.woompTimeOffset
        }
    }

    createEnemies() {
        console.log('createEnemies()')

        const positions = [
            [50, 50],
            [150, 100],
            [250, 50],
            [350, 100]
        ]
        for (let pos of positions) {
            this.enemies.create(pos[0], pos[1], 'enemy')
        }
    }

    die(player, enemy) {
        console.log('die')

        this.end()
    }

    end() {
        console.log('[PLAY] end')
        this.registry.destroy()
        this.events.off()
        game.scene.switch('play', 'end')
        this.cursors.right.isDown = false
        this.cursors.left.isDown = false
        this.cursors.up.isDown = false
        this.cursors.down.isDown = false
        console.log('[PLAY] CURSORS OFF')
        this.scene.stop()
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super('end')
    }

    create() {
        console.log('[END] create')

        this.add.text(600, 10, 'Score: ' + score,
                      {font: '30px Courier',
                       fill: '#ffffff'})
        this.add.text(80, 160, 'YOU DIED',
                      {font: '50px Courier',
                       fill: '#ffffff'})
        this.add.text(80, 240, 'press "W" to restart',
                      {font: '30px Courier',
                       fill: '#ffffff'})

        this.input.keyboard.on('keydown-W', this.restart, this)
    }

    restart() {
        console.log('[END] restart')
        game.scene.switch('end', 'title')
    }
}


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
    scene: [
        BootScene,
        LoadScene,
        TitleScene,
        PlayScene,
        EndScene
    ]
}

game = new Phaser.Game(gameConfig)
game.scene.start('boot', { someData: '...arbitrary data' })
