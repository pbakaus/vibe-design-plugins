// Command demos registry

import animate from "./animate.js";
import bolder from "./bolder.js";
import normalize from "./normalize.js";

export const commandDemos = {
	normalize,
	bolder,
	animate,
};

export function getCommandDemo(commandId) {
	return commandDemos[commandId] || null;
}
