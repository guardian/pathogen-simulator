import config from './settings/settings'
import { Preflight } from './modules/preflight'

//import ScrollyTeller from "../modules/scrollyteller"
//import scrollTriggers from "../modules/scrollTriggers.js";
import loadJson from '../components/load-json/'
import { $, $$, round, numberWithCommas, wait, getDimensions } from './modules/util'

import rzero from './modules/rzero'
//import multiples from './modules/small-multiples'
import pathogen from './modules/pathogen'

var settings = new Preflight(config).getSettings()

//rzero.init(settings.pathogen)
pathogen.init(settings.pathogen, settings.sliders)


//import videoInview from "../modules/videoInview";
//import imageInview from "../modules/imageInview";
//import sticky from "../modules/sticky";
//import shareable from "../modules/shareable";
//import Lightbox from '../modules/lightbox'
//import intro from '../modules/intro'
//import Relocator from '../modules/relocator'
//import drawMultilineText from 'canvas-multiline-text'
//
//import smoothscroll from 'smoothscroll-polyfill';
//smoothscroll.polyfill();

/*


console.log(wrangle)

var triggers = document.querySelectorAll('.trigger');

var config = {

  rootMargin: '0px 0px 0px 100%',

  threshold: 0

}

let trigger = new IntersectionObserver(function(entries, exit) {

  entries.forEach( (entry) => {

    if (entry.isIntersecting) {

        var id = +entry.target.dataset.id

        //self.currentTrigger = id

        console.log(id)

    }

  });

}, config);

triggers.forEach( (elem, index) => {

  if (index < self.application.database.locations.length) {

    elem.setAttribute('data-id', index);

    trigger.observe(elem);

  }

});

*/