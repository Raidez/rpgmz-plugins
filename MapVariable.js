/*:
 * @target MZ
 * @plugindesc Allow variables on map.
 * @author Raidez
 * @url https://github.com/Raidez/rpgmz-plugins
 * @help
 * 
 * Only works with:
 * - variables \V[x]
 * - gold \G
 * - actor \N[x]
 * - party member \P[x]
 * 
 * =============================================================================
 * Changelog
 * =============================================================================
 * 
 * Version 1.0.0:
 * - Finished plugin!
 * 
 */

(() => {
    const pluginName = "MapVariable";

    const pattern = /\\(?<cmd>[VGNP]+)\[?(?<nth>\d+)?\]?/

    const _Game_Map_displayName = Game_Map.prototype.displayName;
    Game_Map.prototype.displayName = function () {
        let displayName = $dataMap.displayName;
        displayName = Window_Base.prototype.convertEscapeCharacters(displayName);
        return displayName;
    };

    /**
        let match;
        while ((match = pattern.exec(displayName)) !== null) {
            const { cmd, nth } = match.groups;
            switch (cmd) {
                case "G":
                    displayName = displayName.replace(pattern, $gameParty.gold());
                    break;
                case "V":
                    displayName = displayName.replace(pattern, $gameVariables.value(nth));
                    break;
                case "N":
                    displayName = displayName.replace(pattern, $gameActors.actor(nth).name());
                    break;
                case "P":
                    displayName = displayName.replace(pattern, $gameParty.members()[nth].name());
                    break;
            }
        }

        Window_Base.prototype.convertEscapeCharacters = function(text) {
            text = text.replace(/\\/g, "\x1b");
            text = text.replace(/\x1b\x1b/g, "\\");
            while (text.match(/\x1bV\[(\d+)\]/gi)) {
                text = text.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
                    $gameVariables.value(parseInt(p1))
                );
            }
            text = text.replace(/\x1bN\[(\d+)\]/gi, (_, p1) =>
                this.actorName(parseInt(p1))
            );
            text = text.replace(/\x1bP\[(\d+)\]/gi, (_, p1) =>
                this.partyMemberName(parseInt(p1))
            );
            text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
            return text;
        };
     */
})();

