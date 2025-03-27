/*:
 * @target MZ
 * @plugindesc Allow to show balloon icon anywhere.
 * @author Raidez
 * @help Balloon Icon index (by default):
 *       1. Exclamation
 *       2. Question
 *       3. Music Note
 *       4. Heart
 *       5. Anger
 *       6. Sweat
 *       7. Frustration
 *       8. Silence
 *       9. Light Bulb
 *       10. Zzz
 * 
 * =============================================================================
 * TODO:
 * =============================================================================
 * - Look how to populate option arg dynamically.
 * 
 * =============================================================================
 * Changelog
 * =============================================================================
 * 
 * Version 1.0.0:
 * - Finished plugin!
 * 
 * 
 * 
 * @command balloon_follower
 * @text Show Ballon Icon on Follower
 * @desc Display a balloon icon on a follower.
 * 
 * @arg followerId
 * @text Follower
 * @type actor
 * 
 * @arg balloonId
 * @text Balloon Icon
 * @desc Check plugin help to get Balloon Icon index.
 * @type number
 * @min 1
 * 
 * @arg waitForCompletion
 * @text Wait for Completion
 * @type boolean
 * @default false
 */

(() => {
    const pluginName = "EmotionAnywhere";

    PluginManager.registerCommand(pluginName, "balloon_follower", function (args) {
        let followerId = Number(args.followerId);
        let balloonId = Number(args.balloonId);
        let waitForCompletion = JSON.parse(args.waitForCompletion || false);

        for (const follower of $gamePlayer.followers().data()) {
            if (follower.actor()?.actorId() == followerId) {
                $gameTemp.requestBalloon(follower, balloonId);
                if (waitForCompletion) {
                    this.wait(60);
                }
            }
        }
    });
})();
