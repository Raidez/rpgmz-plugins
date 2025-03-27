/*:
 * @target MZ
 * @plugindesc Restrict NPC roaming.
 * @author Raidez
 * @help
 * =============================================================================
 * TODO:
 * =============================================================================
 * - Actually, when event is restricted, it's waiting for the next update to try
 * moving again (maybe Game_Event.prototype.resetStopCount()
 * can force reupdate).
 * - Check for vehicle (implementing otherwise).
 * 
 * =============================================================================
 * Changelog
 * =============================================================================
 * Version 1.1.1:
 * - Code corrections.
 * 
 * Version 1.1.0:
 * - Add multiples region ID.
 * 
 * Version 1.0.0:
 * - Finished plugin!
 * 
 * =============================================================================
 * Credits
 * =============================================================================
 * Thanks to Yanfly Engin Plugins - Region Restrictions.
 * http://www.yanfly.moe/wiki/Region_Restrictions_(YEP)
 * I take a lot from it.
 * 
 * 
 * 
 * @param player_restrict
 * @text Player Restriction Region ID
 * @desc This region ID will restrict for player.
 *       Use comma for multiple region ID.
 * @default 0
 * 
 * @param event_restrict
 * @text Event Restriction Region ID
 * @desc This region ID will restrict for events.
 *       Use comma for multiple region ID.
 * @default 0
 * 
 * @param all_restrict
 * @text All Restriction Region ID
 * @desc This region ID will restrict for all.
 *       Use comma for multiple region ID.
 * @default 0
 * 
 * @param player_allow
 * @text Player Allow Region ID
 * @desc This region ID will allow for player.
 *       Use comma for multiple region ID.
 * @default 0
 * 
 * @param event_allow
 * @text Event Allow Region ID
 * @desc This region ID will allow for events.
 *       Use comma for multiple region ID.
 * @default 0
 * 
 * @param all_allow
 * @text All Allow Region ID
 * @desc This region ID will allow for all.
 *       Use comma for multiple region ID.
 * @default 0
 */

(() => {
    const pluginName = "DogSitter";

    let parameters = PluginManager.parameters(pluginName);
    let player_restrict = parameters.player_restrict.split(",").map(Number) || [0];
    let event_restrict = parameters.event_restrict.split(",").map(Number) || [0];
    let all_restrict = parameters.all_restrict.split(",").map(Number) || [0];
    let player_allow = parameters.player_allow.split(",").map(Number) || [0];
    let event_allow = parameters.event_allow.split(",").map(Number) || [0];
    let all_allow = parameters.all_allow.split(",").map(Number) || [0];

    function getRegionId(x, y, d) {
        switch (d) {
            case 1:
                return $gameMap.regionId(x - 1, y + 1);
            case 2:
                return $gameMap.regionId(x + 0, y + 1);
            case 3:
                return $gameMap.regionId(x + 1, y + 1);
            case 4:
                return $gameMap.regionId(x - 1, y + 0);
            case 5:
                return $gameMap.regionId(x + 0, y + 0);
            case 6:
                return $gameMap.regionId(x + 1, y + 0);
            case 7:
                return $gameMap.regionId(x - 1, y - 1);
            case 8:
                return $gameMap.regionId(x + 0, y - 1);
            case 9:
                return $gameMap.regionId(x + 1, y - 1);
            default:
                return $gameMap.regionId(x, y);
        }
    }

    function isPlayerRegionRestrict(x, y, d) {
        let regionId = getRegionId(x, y, d);
        if (regionId === 0) return false;
        if (all_restrict.includes(regionId)) return true;
        if (player_restrict.includes(regionId)) return true;
        return false;
    }

    function isEventRegionRestrict(x, y, d) {
        let regionId = getRegionId(x, y, d);
        if (regionId === 0) return false;
        if (all_restrict.includes(regionId)) return true;
        if (event_restrict.includes(regionId)) return true;
        return false;
    }

    function isPlayerRegionAllow(x, y, d) {
        let regionId = getRegionId(x, y, d);
        if (regionId === 0) return false;
        if (all_allow.includes(regionId)) return true;
        if (player_allow.includes(regionId)) return true;
        return false;
    }

    function isEventRegionAllow(x, y, d) {
        let regionId = getRegionId(x, y, d);
        if (regionId === 0) return false;
        if (all_allow.includes(regionId)) return true;
        if (event_allow.includes(regionId)) return true;
        return false;
    }

    const _Game_CharacterBase_isMapPassable = Game_CharacterBase.prototype.isMapPassable;
    Game_CharacterBase.prototype.isMapPassable = function () {
        const [x, y, d] = [...arguments];

        if (this instanceof Game_Player || this instanceof Game_Follower) {
            if (isPlayerRegionRestrict(x, y, d)) return false;
            if (isPlayerRegionAllow(x, y, d)) return true;
        }

        if (this instanceof Game_Event) {
            if (isEventRegionRestrict(x, y, d)) return false;
            if (isEventRegionAllow(x, y, d)) return true;
        }

        return _Game_CharacterBase_isMapPassable.apply(this, arguments);
    };

})();
