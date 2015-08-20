'use strict';

var objectSettings = require('./control.json').ui.objects,
    EventEmitter = require('events').EventEmitter,
    uiObjects = {},
    font = "Comic Sans MS";

function Button(stage, index, getImage) {
    this.index = index;
    this.stage = stage;
    this.button = null;
    var emitter = new EventEmitter();

    this.on = emitter.on;
    this.getImage = getImage;
    this.emit = emitter.emit;
}

Button.prototype.draw = function () {
    var self = this,
        y = objectSettings.button.marginY,
        x;

    if (this.button !== undefined) {
        this.stage.removeChild(this.button);
    }

    if (this.index === 1) {
        x = objectSettings.button.x + objectSettings.button.marginX;
    } else {
        x = objectSettings.button.x;
    }

    this.button = new createjs.Bitmap(this.getImage('bt0' + this.playerId));
    this.button.x = x;
    this.button.y = y;

    this.button.addEventListener("click", function (event) {
        self.emit('click', event);
    });

    this.stage.addChild(this.button);
};

Button.prototype.setPlayerId = function (playerId) {
    this.playerId = playerId;
    this.draw();
};

Button.prototype.hide = function () {
    this.stage.removeChild(this.button);
};

function Character(stage,  getImage, userId) {
    this.stage = stage;
    this.image = new createjs.Bitmap(getImage('userImage' + userId));

    this.image.y = objectSettings.character.y;
    this.image.x = objectSettings.character.x;
    this.image.scaleX = objectSettings.character.scaleX;
    this.image.scaleY = objectSettings.character.scaleY;

    this.stage.addChild(this.image);
}

Character.prototype.hide = function () {
    this.stage.removeChild(this.image);
}

function MessageBoard(stage,  getImage) {
    this.stage = stage;
    this.board = new createjs.Bitmap(getImage('messages'));
    this.coundown = new createjs.Bitmap(getImage('countdown'));

    this.board.y = objectSettings.board.y;
    this.board.x = objectSettings.board.x;

    this.coundown.y = objectSettings.coundown.y;
    this.coundown.x = objectSettings.coundown.x;
}

MessageBoard.prototype.printToBoard = function (text, fontSize, color, fontWeight) {
    fontWeight = fontWeight || '';

    this.clearBoard();
    this.textElement = new createjs.Text(text, fontSize + "px " +  font + ' ' + fontWeight, color);

    this.textElement.x = this.board.x + (this.board.getBounds().width - this.textElement.getMeasuredWidth()) / 2;
    this.textElement.y = this.board.y + (this.board.getBounds().height - this.textElement.getMeasuredHeight()) / 2;
    this.stage.addChild(this.textElement);
};

MessageBoard.prototype.clearBoard = function () {
    if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
        this.messageTimeout = false;
    }
    this.stage.removeChild(this.textElement);
};

MessageBoard.prototype.welcomeMessage = function () {
    var self = this;

    this.showBoard();
    this.printToBoard('Welcome to the RACE', 25, 'black', 'bold');
    self.messageTimeout = setTimeout(function () {
        self.printToBoard('Connecting to arena', 20, 'black', 'bold');
        self.messageTimeout = setTimeout(function () {
            self.printToBoard("Still connecting...", 20, 'black', 'bold');
            self.messageTimeout = setTimeout(function () {
                self.printToBoard("This really shouldn't take this long :(", 15, 'black', 'bold');
                self.messageTimeout = setTimeout(function () {
                    self.printToBoard("Programing is hard...", 15, 'black', 'bold');
                    self.messageTimeout = setTimeout(function () {
                        self.welcomeMessage();
                    }, 5000);
                }, 12000);
            }, 8000);
        }, 8000);
    }, 2000);

};

MessageBoard.prototype.connectedMessage = function () {
    var self = this;

    this.showBoard();
    this.printToBoard('Connected to Arena!', 25, 'black', 'bold');
    self.messageTimeout = setTimeout(function () {
        self.printToBoard('Waiting for more players to join', 18, 'black', 'bold');
        self.messageTimeout = setTimeout(function () {
            self.connectedMessage();
        }, 5000);
    }, 2000);
};

MessageBoard.prototype.disconnectedMessage = function (disconnectReason) {
    var self = this;

    self.hide();
    this.showBoard();
    this.printToBoard(disconnectReason, 25, 'black', 'bold');
    self.messageTimeout = setTimeout(function () {
        self.printToBoard('Please refresh to try again', 25, 'black', 'bold');
        self.messageTimeout = setTimeout(function () {
            self.disconnectedMessage(disconnectReason);
        }, 5000);
    }, 5000);
};

MessageBoard.prototype.errorMessage = function (msg) {
    var self = this;

    self.hide();
    this.showBoard();
    this.printToBoard(msg, 18, 'black', 'bold');
};

MessageBoard.prototype.countDownMessage = function () {
    var self = this;

    this.showBoard();
    this.printToBoard('After the countdown tap repeatably', 15, 'black', 'bold');
    self.messageTimeout = setTimeout(function () {
        self.printToBoard('Tap as fast as you can to win', 18, 'black', 'bold');
        self.messageTimeout = setTimeout(function () {
            self.printToBoard('Be the fastest to win!', 18, 'black', 'bold');
            self.messageTimeout = setTimeout(function () {
                self.countDownMessage();
            }, 5000);
        }, 5000);
    }, 5000);
};


MessageBoard.prototype.hideCountdown = function (count) {
    this.stage.removeChild(this.coundown);
    if (this.countText) {
        this.stage.removeChild(this.countText);
    }
};

MessageBoard.prototype.showTap = function () {
    var self = this;
    this.hideCountdown();

    this.stage.addChild(this.coundown);
    this.countText = new createjs.Text('GO!', 50 + "px " +  font + ' ' + 'bold', 'white');
    this.countText.x = this.coundown.x + (this.coundown.getBounds().width - this.countText.getMeasuredWidth()) / 2 - 5;
    this.countText.y = this.coundown.y + (this.coundown.getBounds().height - this.countText.getMeasuredHeight()) / 2 - 5;
    this.stage.addChild(this.countText);
};

MessageBoard.prototype.countdown = function (count) {
    var self = this;
    this.hideCountdown();

    this.stage.addChild(this.coundown);
    this.countText = new createjs.Text(count.toString(), 50 + "px " +  font + ' ' + 'bold', 'white');
    this.countText.x = this.coundown.x + (this.coundown.getBounds().width - this.countText.getMeasuredWidth()) / 2 - 5;
    this.countText.y = this.coundown.y + (this.coundown.getBounds().height - this.countText.getMeasuredHeight()) / 2;
    this.stage.addChild(this.countText);
};



MessageBoard.prototype.showBoard = function () {
    this.hideBoard();
    this.stage.addChild(this.board);
};

MessageBoard.prototype.hideBoard = function () {
    this.stage.removeChild(this.board);
};

MessageBoard.prototype.showWin = function () {
    this.showBoard();
    this.printToBoard('You won!', 30, 'black', 'bold');
};

MessageBoard.prototype.showLose = function () {
    this.showBoard();
    this.printToBoard('You lost', 30, 'black', 'bold');
};

MessageBoard.prototype.hide = function () {
    this.hideCountdown();
    this.hideBoard();
    this.clearBoard();
};


function MessageBoard(stage,  getImage) {
    this.stage = stage;
    this.board = new createjs.Bitmap(getImage('messages'));
    this.coundown = new createjs.Bitmap(getImage('countdown'));

    this.board.y = objectSettings.board.y;
    this.board.x = objectSettings.board.x;

    this.coundown.y = objectSettings.coundown.y;
    this.coundown.x = objectSettings.coundown.x;
}


uiObjects.Button = Button;
uiObjects.Character = Character;
uiObjects.MessageBoard = MessageBoard;

module.exports = uiObjects;