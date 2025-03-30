/*:
 * @target MZ
 * @plugindesc Allow to show balloon icon on followers.
 * @author Raidez
 * @url https://github.com/Raidez/rpgmz-plugins
 * @help
 * =============================================================================
 * Changelog
 * =============================================================================
 * 
 * Version 1.2.0:
 * - Added default balloon icon value to the selection menu.
 * 
 * Version 1.1.0:
 * - Some refactoring and code cleanup.
 * - Added support for wait option.
 * - Added command to play balloon on every follower (instant or with delay).
 * 
 * Version 1.0.0:
 * - Finished plugin!
 * 
 * 
 * 
 * @command balloonFollower
 * @text Show Ballon Icon on Follower
 * @desc Displays the specified balloon icon above a follower's head.
 * 
 * @arg actorId
 * @text Follower
 * @desc Follower to be the target.
 * @type actor
 * 
 * @arg balloonId
 * @text Balloon Icon
 * @desc Type of balloon icon to be displayed.
 * @type select
 * @option Exclamation
 * @value 1
 * @option Question
 * @value 2
 * @option Music Note
 * @value 3
 * @option Heart
 * @value 4
 * @option Anger
 * @value 5
 * @option Sweat
 * @value 6
 * @option Frustration
 * @value 7
 * @option Silence
 * @value 8
 * @option Light Bulb
 * @value 9
 * @option Zzz
 * @value 10
 * @option User-defined 1
 * @value 11
 * @option User-defined 2
 * @value 12
 * @option User-defined 3
 * @value 13
 * @option User-defined 4
 * @value 14
 * @option User-defined 5
 * @value 15
 * 
 * @arg wait
 * @text Wait for Completion
 * @desc Waits for the effect to finish.
 * @type boolean
 * @default false
 * 
 * 
 * 
 * @command balloonAllFollowers
 * @text Show Ballon Icon on all Followers
 * @desc Displays the specified balloon icon above all followers' heads.
 * 
 * @arg balloonId
 * @text Balloon Icon
 * @desc Type of balloon icon to be displayed.
 * @type select
 * @option Exclamation
 * @value 1
 * @option Question
 * @value 2
 * @option Music Note
 * @value 3
 * @option Heart
 * @value 4
 * @option Anger
 * @value 5
 * @option Sweat
 * @value 6
 * @option Frustration
 * @value 7
 * @option Silence
 * @value 8
 * @option Light Bulb
 * @value 9
 * @option Zzz
 * @value 10
 * @option User-defined 1
 * @value 11
 * @option User-defined 2
 * @value 12
 * @option User-defined 3
 * @value 13
 * @option User-defined 4
 * @value 14
 * @option User-defined 5
 * @value 15
 * 
 * @arg initialDelay
 * @text Initial Delay
 * @desc Delay in frames before the first balloon icon.
 * @type number
 * @min 0
 * @max 76
 * @default 0
 * 
 * @arg delay
 * @text Delay
 * @desc Delay in frames between each balloon icon.
 * @type number
 * @min 0
 * @max 76
 * @default 0
 * 
 * @arg wait
 * @text Wait for Completion
 * @desc Waits for the effect to finish.
 * @type boolean
 * @default false
 */

(() => {
    const PLUGIN_NAME = "BalloonFollower";
    const WAIT_MODE = "balloon_follower";

    const followersList = new Array();
    const delayStack = new Array();
    let waitDelay = 0;

    PluginManager.registerCommand(PLUGIN_NAME, "balloonFollower", function (args) {
        const actorId = Number(args.actorId);
        const balloonId = Number(args.balloonId);
        const wait = JSON.parse(args.wait || false);

        // get follower by actorId
        const follower = $gamePlayer.followers().data()
            .find(x => x.actor()?.actorId() === actorId);
        if (!follower) {
            console.error(`Follower with ID '${actorId}' not found.`);
            return;
        }

        // show balloon and wait
        $gameTemp.requestBalloon(follower, balloonId);
        if (wait) {
            this.setWaitMode(WAIT_MODE);
            followersList.push(follower);
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "balloonAllFollowers", function (args) {
        const balloonId = Number(args.balloonId);
        const wait = JSON.parse(args.wait || false);
        const initialDelay = Number(args.initialDelay || 0);
        const delay = Number(args.delay || 0);

        // get followers
        const followers = $gamePlayer.followers().data();
        if (followers.length === 0) {
            console.error("No followers found.");
            return;
        }

        // show balloons and wait
        if (initialDelay || delay) {
            waitDelay = initialDelay;

            followers.forEach((x, i, arr) => {
                delayStack.push(() => {
                    if ((arr.length - 1) !== i) {
                        waitDelay = delay;
                    }

                    $gameTemp.requestBalloon(x, balloonId);
                });
            });
        } else {
            followers.forEach(x => $gameTemp.requestBalloon(x, balloonId));
        }

        if (wait) {
            this.setWaitMode(WAIT_MODE);
            followersList.push(...followers);
        }
    });

    // handle wait mode
    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode === WAIT_MODE) {
            let waiting = followersList.some(x => x.isBalloonPlaying());

            // empty list when waiting is over
            if (!waiting) {
                this._waitMode = "";
                followersList.length = 0;
            }

            return waiting;
        }

        return _Game_Interpreter_updateWaitMode.call(this);
    };

    // handle delay
    const _Game_Interpreter_update = Game_Interpreter.prototype.update;
    Game_Interpreter.prototype.update = function () {
        if (waitDelay > 0) {
            waitDelay--;
            return;
        } else if (delayStack.length > 0) {
            delayStack.shift()();
            return;
        }

        return _Game_Interpreter_update.call(this);
    };

})();
