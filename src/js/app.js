import loadJson from '../components/load-json/'
import { $, $$, round, numberWithCommas, wait, getDimensions } from './modules/util'

import rzero from './modules/rzero'
import multiples from './modules/multiples'
import pathogen from './modules/pathogen'

import config from './settings/settings'
import { Preflight } from './modules/preflight'

var settings = new Preflight(config).getSettings()

rzero.init()

multiples.init()

pathogen.init(settings.pathogen, settings.sliders, settings.cases)