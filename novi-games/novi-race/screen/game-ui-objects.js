'use strict';

var config = require('./game.json'),
    avatars = require('./character-animations'),
    font = "Comic Sans MS";

function FinishLine (stage, getImage) {
    this.stage = stage;
    this.getImage = getImage;

    this.bitmap = new createjs.Bitmap(getImage('lines'));
    //this.bitmap.visible = false;
    this.bitmap.y = config.ui.objects.finishLine.y;
    this.bitmap.x = config.ui.objects.finishLine.x;
    stage.addChild(this.bitmap);
    this.fruit = [];


    for (var i = 0; i < 4; i++) {
        var fruit = new createjs.Sprite(avatars.fruit);

        fruit.x = config.ui.objects.finishLine.fruit.x;
        fruit.y = config.ui.objects.finishLine.fruit.y + config.ui.objects.finishLine.fruit.buffer * i;

        fruit.gotoAndStop(i);

        stage.addChild(fruit);
        this.fruit.push(fruit);
    }


}

FinishLine.prototype.show = function () {
    this.bitmap.visible = true;

}

FinishLine.prototype.hide = function () {
    this.bitmap.visible = false;

}

function OnlineIndicator(stage, playerIndex, getImage, name) {
    this.stage = stage;
    this.nickName = '-';
    this.flagBitmap = new createjs.Sprite(avatars.flags);
    this.stage.addChild(this.flagBitmap);
    this.playerIndex = playerIndex;

    this.flagBitmap.y = config.ui.objects.flags.y + playerIndex * config.ui.objects.flags.margin;
    this.flagBitmap.x = config.ui.objects.flags.x;

    this.nameHolder = new createjs.Bitmap(getImage('nameHolder'));

    this.nameHolder.y = config.ui.objects.nameHolder.y + playerIndex * config.ui.objects.nameHolder.margin;
    this.nameHolder.x = config.ui.objects.nameHolder.x;
    this.stage.addChild(this.nameHolder);
    this.playerNickName = name;
}

OnlineIndicator.prototype.draw = function (frameIndex) {
    this.flagBitmap.gotoAndStop(frameIndex);

};

OnlineIndicator.prototype.drawOffline = function () {
    this.draw(this.playerIndex + 4);
    this.isOnline = false;
    this.printNickName();

};

OnlineIndicator.prototype.drawOnline = function () {
    this.draw(this.playerIndex);
    this.printNickName();
    this.isOnline = true;
};

OnlineIndicator.prototype.printNickName = function () {
    this.nickName = new createjs.Text(this.playerNickName, '15px ' + font + ' bold', 'green');
    this.nickName.x = this.nameHolder.x + this.nameHolder.getBounds().width / 2 - this.nickName.getMeasuredWidth()/ 2;
    this.nickName.y = this.nameHolder.y + 2;
    this.stage.addChild(this.nickName);

};

OnlineIndicator.prototype.updateUserInfo = function (userInfo) {
    this.isOnline = userInfo.online;
    this.printNickName(userInfo.nickName);
};

function Mil (stage) {
    this.stage = stage;
    this.bitmap = new createjs.Sprite(avatars.mil);
    this.stage.addChild(this.bitmap);

    this.bitmap.y = config.ui.objects.mil.y;
    this.bitmap.x = config.ui.objects.mil.x;
    this.bitmap.gotoAndPlay("mil");
}

var gridPosition = ['yaen', 'kof', 'berale', 'shafan'];

function Player(stage, index, color) {
    this.index = index;
    this.stage = stage;
    this.avatar = avatars[gridPosition[index]];
    this.speed = 0;


}

Player.prototype.init = function (events) {
    var self = this;
    var y = config.ui.objects.player.startY + this.index * (config.ui.objects.player.radius * 2 + config.ui.objects.player.buffer);

    this.avatarBitmap = new createjs.Sprite(this.avatar);
    this.stage.addChild(this.avatarBitmap);

    this.avatarBitmap.y = y;
    this.avatarBitmap.visible = false;
    setTimeout(function () {
        self.avatarBitmap.visible = true;
        self.avatarBitmap.x = config.ui.objects.player.startX;
    }, 1000);

    self.targetX = config.ui.objects.player.startX;

    events.on('tick', function (deltaTime) {
        self.animate(deltaTime);
    });



    /* OLD CIRCLE AVATAR
    var y = config.ui.objects.player.startY + this.index * (config.ui.objects.player.radius * 2 + config.ui.objects.player.buffer);
    var self = this;
    this.circle = new createjs.Shape();
    this.circle.graphics.beginFill(this.color).drawCircle(config.ui.objects.player.startX, y, config.ui.objects.player.radius);
    self.targetX = 0;
    this.stage.addChild(this.circle);

    events.on('tick', function (deltaTime) {
        self.animate(deltaTime);
    });*/
};

Player.prototype.advancePlayer = function (newX, speed) {
    this.count = newX;
    var time = config.ui.objects.player.animation.advancePlayer.time;
    this.targetX = newX  * speed + config.ui.objects.player.startX;;
    this.speed = (this.targetX - this.avatarBitmap.x) / time;
};

Player.prototype.stop = function () {
  this.isAnimate = false;
  this.avatarBitmap.gotoAndStop(0);
};

Player.prototype.start = function () {
    this.isAnimate = true;
    this.avatarBitmap.gotoAndPlay("run");     //animate
};

Player.prototype.animate = function (deltaTime) {
    if (this.avatarBitmap.x < config.ui.objects.player.startX) {
        this.avatarBitmap.x = config.ui.objects.player.startX;
    }

    if (this.isAnimate && this.speed !== 0) {
        // Player's movement to target will always take 'time' seconds

        var newX = this.avatarBitmap.x + deltaTime * (this.speed);
        if (newX >= this.targetX) {
            this.speed = 0;
            this.avatarBitmap.x = this.targetX;
        } else {
            this.avatarBitmap.x = newX;
        }
    } else if (this.speed < 0) {
        this.speed = 0;
    }
};

Player.prototype.getX = function () {
    var x = this.avatarBitmap.x + 185;
    return x;
}

Player.prototype.getY = function () {
    return config.ui.objects.player.startY + this.index * (config.ui.objects.player.radius * 2 + config.ui.objects.player.buffer);
}

Player.prototype.resetPlayer = function () {
    this.avatarBitmap.x = 0;
    this.speed = 0;
    this.isAnimate = false;
    this.targetX = config.ui.objects.player.startX;
}

Player.prototype.show = function () {
    this.avatarBitmap.visible = true;
}

Player.prototype.hide = function () {
    this.avatarBitmap.visible = false;
}

function MessageBoard(stage, getImage) {
    this.stage = stage;
    this.textArray = [];
    this.flachBitmap = new createjs.Bitmap(getImage('flach'));
    this.flachBitmap.x = config.ui.objects.flach.x;
    this.flachBitmap.y = config.ui.objects.flach.y;

}

MessageBoard.prototype.playerWon = function (playerId) {
    this.clearText();
    this.showBoard();
    //this.printToCenter('Novisign is proud to present', 200, 25, 'black');
    this.printToCenter(playerId, 180, 45, 'white', 'bold');
    this.printToCenter('WON', 230, 80, 'white', 'bold');
};

MessageBoard.prototype.restarting = function () {
    this.clearText();
    this.showBoard();
    //this.printToCenter('Novisign is proud to present', 200, 25, 'black');
    this.printToCenter("Restarting game", 230, 65, 'white', 'bold');
};



MessageBoard.prototype.showBoard = function () {
    this.stage.removeChild(this.flachBitmap);
    this.stage.addChild(this.flachBitmap);
};

MessageBoard.prototype.hide = function () {
    this.clearText();
    this.stage.removeChild(this.flachBitmap);
};

MessageBoard.prototype.updatePlayersOnline = function (max, curOnline) {
    if (this.onlinePlayerText) {
        this.stage.removeChild(this.onlinePlayerText);
    }

    if (isNaN(max) && this.lastMax){
        max = this.lastMax;
    }

    if (isNaN(curOnline) && this.curOnline){
        curOnline = this.curOnline;
    }

    this.lastMax = max;
    this.curOnline = curOnline;
    this.onlinePlayerText = new createjs.Text("Waiting for players to connect: " + curOnline + '/' + max, '25px ' +  font + ' bold', 'white');
    this.onlinePlayerText.x = this.flachBitmap.x + this.flachBitmap.getBounds().width / 2 - this.onlinePlayerText.getMeasuredWidth()/ 2;
    this.onlinePlayerText.y = 350;
    this.stage.addChild(this.onlinePlayerText);
}

MessageBoard.prototype.startMessage = function (gameId, connectUrl) {
    var self = this;

    this.clearText();
    this.showBoard();
    this.printToCenter('Log in and join the game', 200, 25, 'white');
    this.printToCenter(connectUrl, 270, 20, 'white', 'bold');
    this.printToCenter('ID ' + gameId + '', 310, 40, 'gold', 'bold');

    /*
    $.get('/gameDB/' + gameId + '/winners', function (data) {
        var len = data.length,
            i;

        self.clearText();

        for (i = 0; i < len; i++) {
            self.printToCenter(data[i], 190 + i * 30, 20, 'white', 'bold');
        }
    });
    */
};

MessageBoard.prototype.showError = function (msg) {
    this.clearText();
    this.showBoard();
    this.printToCenter(msg, 250, 20, 'white', 'bold');
}

MessageBoard.prototype.countDownMessage = function (gameId, connectUrl, count) {
    this.clearText();
    this.showBoard();
    //this.printToCenter('Novisign is proud to present', 200, 25, 'black');
    this.printToCenter('Log in and join the game', 190, 30, 'white');
    this.printToCenter(connectUrl, 230, 20, 'white', 'bold');
    this.printToCenter('ID ' + gameId + '', 260, 35, 'gold', 'bold');
    this.printToCenter('COUNTDOWN', 295, 25, 'black', 'bold');
    this.printToCenter(count, 325, 25, 'black', 'bold');
    this.updatePlayersOnline();
};

MessageBoard.prototype.showDisconnectMessge = function () {
    this.clearText();
    this.showBoard();
    this.printToCenter('Error', 180, 50, 'white', 'bold');
    this.printToCenter('Disconnected. Please restart screen.', 250, 20, 'white');
}

MessageBoard.prototype.printToCenter = function (text, y, fontSize, color, fontWeight) {
    fontWeight = fontWeight || '';

    var textElement = new createjs.Text(text, fontSize + "px " +  font + ' ' + fontWeight, color);

    textElement.x = this.flachBitmap.x + this.flachBitmap.getBounds().width / 2 - textElement.getMeasuredWidth()/ 2;
    textElement.y = y;
    this.stage.addChild(textElement);
    this.textArray.push(textElement);
};


MessageBoard.prototype.clearText = function () {
    var self = this;

    this.textArray.forEach(function (element) {
        self.stage.removeChild(element);
    });
    this.textArray.splice(0, this.textArray.length);

    if (this.onlinePlayerText) {
        this.stage.removeChild(this.onlinePlayerText);
    }
};

MessageBoard.prototype.printTime = function (timeLeftMilli) {
    this.clearText();
    this.showBoard();
    this.printToCenter('Beginning in ...', 180, 50, 'black', 'bold');
    this.printToCenter(Math.round(timeLeftMilli / 1000) , 250, 50, 'black', 'bold');
    this.printToCenter('seconds', 310, 40, 'black', 'bold');
}


module.exports = {
    FinishLine: FinishLine,
    OnlineIndicator: OnlineIndicator,
    Player: Player,
    Mil: Mil,
    MessageBoard: MessageBoard
};