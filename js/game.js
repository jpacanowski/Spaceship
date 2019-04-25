var game = new Phaser.Game(800, 600);
game.state.add('main', mainState);
game.state.start('main');