import ScrollyTeller from "../modules/scrollyteller"

export default (function boom() {

	console.log("Boom")

	 const scrolly = new ScrollyTeller({
            parent: document.querySelector("#scrolly-2"),
            triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
            triggerTopMobile: 0.75,
            transparentUntilActive: true
     });

     scrolly.watchScroll();

})();