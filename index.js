/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const wdk = require('./wikidata');
const utils = require('./utils');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'Pubblicazioni autori';
const HELP_MESSAGE = 'Chiedimi di dirti qualcosa su un autore... Come ti posso aiutare?';
const HELP_REPROMPT = 'Come ti posso aiutare?';
const STOP_MESSAGE = 'Ciao!';

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const getPublications = function(autore) {
    const sparqlAuthor = `
        SELECT ?book ?book_label ?authorLabel ?genre_label ?series_label ?publicationDate ?year
        WHERE
        {
            ?author ?label "${autore}"@it .
            ?book wdt:P31 wd:Q571 .
            ?book wdt:P50 ?author .
            ?book rdfs:label ?book_label filter (lang(?book_label) = "it").
            
            OPTIONAL {
                ?book wdt:P136 ?genre .
                ?genre rdfs:label ?genre_label filter (lang(?genre_label) = "it").
            }
            OPTIONAL {
                ?book wdt:P577 ?publicationDate .
            }
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "it" .
            }
            BIND(YEAR(?publicationDate) AS ?year)
        }
    `;
    console.log('Preparing query');
    const authorUrl = wdk.sparqlQuery(sparqlAuthor);
    console.log('Author URL', authorUrl);
    let publications = [];
    utils.getContent(authorUrl).then((data) => {
        console.log(data);
    let simplified = wdk.simplify.sparqlResults(data);
    console.log(simplified);
    if (simplified.length) {
        publications.push(autore + ' ha pubblicato '+ simplified[0].book_label + ' nel ' + simplified[0].year);
    }

    let speak = '';

    if (publications.length === 0) {
        speak = 'Nessuna pubblicazione trovata';
    } else {
        speak = publications.join('. \n');
    }

    speak = utils.escapeXml(speak);

    this.response.cardRenderer(SKILL_NAME, speak);
    this.response.speak(speak);
    this.emit(':responseReady');
}).catch((err) => console.log(err));
}
const handlers = {
    'LaunchRequest': function () {
        this.emit('Pubblicazioni');
    },
    'Pubblicazioni': function () {
        const {autore} = this.event.request.intent ? this.event.request.intent.slots : {autore: 'Agatha Christie'};

        getPublications.call(this, utils.ucCase(autore.value));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.emit('FattiDiMusica');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

