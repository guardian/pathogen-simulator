import ScrollyTeller from "../modules/scrollyteller"
import { Contagion } from "../modules/contagion"

export default {

	init: (config) => {

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-2"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
		});

		var contagion = new Contagion(config, "pathogen-simulator")

	    scrolly.watchScroll();

	}

};
