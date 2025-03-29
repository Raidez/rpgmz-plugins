/*:
 * @target MZ
 * @plugindesc Play animations from  a specified file.
 * @author Raidez
 * @help Check the exemple below to see how to use this plugin:
 * 
 * Example: animations.yaml
 * animation_name:
 *     - <move down>
 *     - <move left>
 * 
 * =============================================================================
 * TODO:
 * =============================================================================
 * - Add all commands.
 * - Stress tests timing.
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
 * @param animation_file
 * @text Animation File
 * @desc The animation file to load.
 * 
 * 
 * 
 * @command play_animation_at_event
 * @text Play Animation at Event
 * @desc Play an animation on the current event.
 * 
 * @arg animation_name
 * @text Animation Name
 * @desc The name of the animation to play.
 * 
 * @arg options
 * @text Options
 * @desc The options to use (repeat, skippable, wait).
 * @type struct<options>
 * @default {"repeat":"false","skippable":"false","wait":"true"}
 * 
 * 
 * 
 * @command play_animation_on_event
 * @text Play Animation on Event
 * @desc Play an animation on the specified event.
 * 
 * @arg event_id
 * @text Event ID
 * @desc The ID of the event to play the animation on.
 * @type number
 * 
 * @arg animation_name
 * @text Animation Name
 * @desc The name of the animation to play.
 * 
 * @arg options
 * @text Options
 * @desc The options to use (repeat, skippable, wait).
 * @type struct<options>
 * @default {"repeat":"false","skippable":"false","wait":"true"}
 * 
 * 
 * 
 * @command play_animation_on_character
 * @text Play Animation on Character
 * @desc Play an animation on the specified character.
 * 
 * @arg character_id
 * @text Character ID
 * @desc The ID of the character to play the animation on.
 * @type actor
 * 
 * @arg animation_name
 * @text Animation Name
 * @desc The name of the animation to play.
 * 
 * @arg options
 * @text Options
 * @desc The options to use (repeat, skippable, wait).
 * @type struct<options>
 * @default {"repeat":"false","skippable":"false","wait":"true"}
 */

/*~struct~options:
 * @param repeat
 * @text Repeat Movements
 * @desc Whether to repeat the movements of the animation.
 * @type boolean
 * 
 * @param skippable
 * @text Skip If Cannot Move
 * @desc Whether to skip failed movements.
 * @type boolean
 * 
 * @param wait
 * @text Wait for Completion
 * @desc Whether to wait for the animation to complete before continuing.
 * @type boolean
 */

(() => {
    const pluginName = "AnimationPlayer";

    const command_aliases = new Map(Object.entries({
        '<direction_fix> off': Game_Character.ROUTE_DIR_FIX_OFF,
        '<direction_fix> on': Game_Character.ROUTE_DIR_FIX_ON,
        '<through> on': Game_Character.ROUTE_THROUGH_ON,
        '<through> off': Game_Character.ROUTE_THROUGH_OFF,
        '<move_lower_left>': Game_Character.ROUTE_MOVE_LOWER_L,
        '<move_lower_right>': Game_Character.ROUTE_MOVE_LOWER_R,
        '<move_upper_left>': Game_Character.ROUTE_MOVE_UPPER_L,
        '<move_upper_right>': Game_Character.ROUTE_MOVE_UPPER_R,
    }));

    const animation_file = PluginManager.parameters(pluginName).animation_file;
    if (!animation_file) {
        throw new Error("Animation File not specified.");
    }

    const animation_data = new Map();

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = async function () {
        _Scene_Boot_start.call(this);

        // load js-yaml lib
        await addScript("https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js");
        if (!window.jsyaml) {
            throw new Error("Failed to load js-yaml, check your internet connection.");
        }

        // load animation data
        const data = await loadAnimationFile(animation_file);
        if (!data) {
            SceneManager.onError(new Error("Not animation data found."));
        }
        data.forEach((value, key) => {
            animation_data.set(key, value);
        });
    };

    PluginManager.registerCommand(pluginName, "play_animation_at_event", async function (args) {
        const animation_name = args.animation_name;
        const options = JSON.parse(args.options || '{"repeat":"false","skippable":"false","wait":"true"}');

        // check args
        if (!animation_name) {
            throw new Error("Animation Name not specified.");
        }
        if (!animation_data.has(animation_name)) {
            throw new Error(`Animation Name don't exist: ${animation_name}.`);
        }

        // get target
        const target = $gameMap.event(this.eventId());
        if (!target) {
            throw new Error("Event not found.");
        }

        // play animation
        playAnimation(target, animation_name, options);
    });

    PluginManager.registerCommand(pluginName, "play_animation_on_event", async function (args) {
        const event_id = args.event_id;
        const animation_name = args.animation_name;
        const options = JSON.parse(args.options || '{"repeat":"false","skippable":"false","wait":"true"}');

        // check args
        if (!event_id) {
            throw new Error("Event ID not specified.");
        }
        if (!animation_name) {
            throw new Error("Animation Name not specified.");
        }
        if (!animation_data.has(animation_name)) {
            throw new Error(`Animation Name don't exist: ${animation_name}.`);
        }

        // get target
        const target = $gameMap.event(event_id);
        if (!target) {
            throw new Error("Event not found.");
        }

        // play animation
        playAnimation(target, animation_name, options);
    });

    PluginManager.registerCommand(pluginName, "play_animation_on_character", async function (args) {
        const character_id = Number(args.character_id);
        const animation_name = args.animation_name;
        const options = JSON.parse(args.options || '{"repeat":"false","skippable":"false","wait":"true"}');

        // check args
        if (!character_id) {
            throw new Error("Character ID not specified.");
        }
        if (!animation_name) {
            throw new Error("Animation Name not specified.");
        }
        if (!animation_data.has(animation_name)) {
            throw new Error(`Animation Name don't exist: ${animation_name}.`);
        }

        // get target
        const actor = $gameActors._data.find(x => x?.actorId() == character_id)

        let target;
        if ($gameParty.leader().actorId() == actor.actorId()) {
            target = $gamePlayer;
        } else {
            target = $gamePlayer.followers().data().find(x => x.actor().actorId() == character_id);
        }

        if (!target) {
            throw new Error("Character not found.");
        }

        // play animation
        playAnimation(target, animation_name, options);
    });

    function playAnimation(target, animation_name, options) {
        // parse move route
        const move_route = {
            repeat: JSON.parse(options.repeat),
            skippable: JSON.parse(options.skippable),
            list: animation_data.get(animation_name).map(parseCommand),
        };

        // check if move route contains a end
        if (!move_route.list.some(x => x.code == Game_Character.ROUTE_END)) {
            move_route.list.push({ code: Game_Character.ROUTE_END });
        }

        // play animation
        target.forceMoveRoute(move_route);

        // waiting logic
        let waiting = JSON.parse(options.wait);
        if (waiting) {
            $gameMap._interpreter.setWaitMode('custom');

            let intervalId;
            intervalId = setInterval(() => {
                if (!target.isMoveRouteForcing()) {
                    clearInterval(intervalId);
                    $gameMap._interpreter.setWaitMode('');
                }
            });
        }
    }

    const Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode == 'custom') {
            return true;
        }

        return Game_Interpreter_updateWaitMode.call(this);
    }

    function parseCommand(command) {
        const match = /<(.+)> ?(.*)/.exec(command);
        if (!match)
            return { code: Game_Character.ROUTE_END };

        const [, code_name, parameters] = [...match];

        let code;
        if (command_aliases.has(command)) {
            code = command_aliases.get(command);
        } else {
            code = Game_Character["ROUTE_" + code_name.toUpperCase()];
        }

        return {
            code: code,
            parameters: parameters ? parameters.split(",").map(Number) : []
        };
    }

    // ASYNCHRONOUS FUNCTIONS
    async function loadAnimationFile(filename) {
        // check extension
        const extension = filename.split('.').pop();
        if (!['yaml', 'yml', 'json'].includes(extension)) {
            throw new Error(`Not supported file type: ${extension}.`);
        }

        // try to fetch the file
        try {
            await fetch(filename);
        } catch (error) {
            throw new Error(`Failed to fetch file: ${filename}.`);
        }

        // parse data
        let animation_data;
        if (extension === "yaml" || extension === "yml") {
            animation_data = await fetch(filename).then(response => response.text()).then(window.jsyaml.load);
        } else if (extension === "json") {
            animation_data = await fetch(filename).then(response => response.json());
        }
        if (!animation_data) {
            throw new Error(`Failed to parse file: ${filename}.`);
        }

        return new Map(Object.entries(animation_data));
    }

    async function addScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
})();
