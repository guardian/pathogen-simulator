import ScrollyTeller from "../modules/scrollyteller"
import * as d3 from "d3"
import Recur from '../modules/recur'
import Covid from '../modules/covid'
import screensizer from "../modules/screensizer"; 

export default {

	init: () => {

		var virus  = new Recur(2.6, "Covid-19", 2).json()

		var element = d3.select('.scroll-text').node();

		var unit = screensizer()

		document.getElementById("radial-chart").style.width = `${unit}px`;

		var covid  = new Covid(virus, "radial-chart", unit)

		covid.create(0)

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-1"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
	     });

		scrolly.addTrigger({num: 1, do: () => {

			covid.create(0)

		}});

		scrolly.addTrigger({num: 2, do: () => {

			covid.create(1)

		}});

		scrolly.addTrigger({num: 3, do: () => {

			covid.create(2)

		}});

		scrolly.addTrigger({num: 4, do: () => {

			covid.create(3)

		}});

		scrolly.watchScroll();

	}

}

