import ScrollyTeller from "../modules/scrollyteller"
import { repo } from "../modules/repo"

export default {

	init: () => {

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-1"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
		});

		scrolly.addTrigger({num: 1, do: () => {

		    var virus = new repo(2.3, 5, "covid-19") // Reproductive number, cycles, canvas id

		}});

	    scrolly.watchScroll();

	}

};
