/*:
 * @target MZ
 * @plugindesc Associate a sound with a balloon icon.
 * @author Raidez
 * @url https://github.com/Raidez/rpgmz-plugins
 * @help
 * =============================================================================
 * Changelog
 * =============================================================================
 * Version 1.0.0:
 * - Finished plugin!
 * 
 * @param iconSoundList
 * @desc List of association of sound with a balloon icon.
 * @type struct<IconSound>[]
 */

/*~struct~IconSound:
 * @param balloonId
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
 * @param sound
 * @text Sound
 * @type file
 * @dir audio/se/
 *
 * @param volume
 * @text Volume
 * @desc Volume for audio playback.
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param pitch
 * @text Pitch
 * @desc Pitch for audio playback.
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @param pan
 * @text Pan
 * @desc Pan for audio playback.
 * @type number
 * @min -100
 * @max 100
 * @default 0
 */

(() => {
    const pluginName = "BalloonSound";

    let iconSoundList = [];
    iconSoundList = PluginManager.parameters(pluginName).iconSoundList;
    iconSoundList = JSON.parse(iconSoundList);
    iconSoundList = iconSoundList.map(JSON.parse);

    const _Game_Temp_requestBalloon = Game_Temp.prototype.requestBalloon;
    Game_Temp.prototype.requestBalloon = function () {
        const [target, balloonId] = [...arguments];

        // play SE if exists
        let iconSound = iconSoundList.find(is => is.balloonId == balloonId);
        if (iconSound) {
            AudioManager.playSe({
                name: iconSound.sound,
                volume: iconSound.volume,
                pitch: iconSound.pitch,
                pan: iconSound.pan,
            });
        }

        _Game_Temp_requestBalloon.apply(this, arguments);
    };
})();
