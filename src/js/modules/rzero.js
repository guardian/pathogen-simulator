import ScrollyTeller from "../modules/scrollyteller"
import * as d3 from "d3"
import Recur from '../modules/recur'
import Radial from '../modules/radial'
import screensizer from "../modules/screensizer"; 

export default {

	init: () => {

		var covid  = new Recur(2, "Covid-19 (Diamond Princess)", 2).json()

		var measles  = new Recur(9, "Measles", 2).json()

		var sars  = new Recur(2.8, "SARS", 2).json()

		var element = d3.select('.scroll-text').node();

		var unit = screensizer()

		document.getElementById("radial-chart").style.width = `${unit}px`;

		var radial  = new Radial(covid, "radial-chart", unit)

		const scrolly = new ScrollyTeller({
			parent: document.querySelector("#scrolly-1"),
			triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
			triggerTopMobile: 0.75,
			transparentUntilActive: true
	     });

		scrolly.addTrigger({num: 1, do: () => {

		    radial.update(covid)

		}});

		scrolly.addTrigger({num: 2, do: () => {

		    radial.update(measles)

		}});

		scrolly.addTrigger({num: 3, do: () => {

		    radial.update(sars)

		}});

		scrolly.watchScroll();

	}

}

