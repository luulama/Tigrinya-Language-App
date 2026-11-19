const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname,'..');
const content = fs.readFileSync(path.join(root,'unit-2-content-review.json'),'utf8');
const nodes = new Map();
const nodeFor = selector => {
  if (!nodes.has(selector)) {
    const classes = new Set();
    nodes.set(selector,{
      textContent:selector === '#unit2Content' ? content : '',
      innerHTML:'',
      value:selector === '#bankPlacement' ? 'all' : '',
      disabled:false,
      hidden:false,
      open:false,
      classList:{add:name => classes.add(name),remove:name => classes.delete(name),contains:name => classes.has(name)},
      setAttribute(name,value) {this[name] = value;},
      removeAttribute(name) {delete this[name];},
      focus() {this.focused = true;},
      insertAdjacentHTML(position,markup) {this.innerHTML += markup;},
      addEventListener() {},
      close() {this.open = false;},
      showModal() {this.open = true;},
    });
  }
  return nodes.get(selector);
};
const context = vm.createContext({
  document:{querySelector:nodeFor,querySelectorAll:() => [],addEventListener() {}},
  window:{setTimeout:() => 1,clearTimeout() {},scrollTo() {}},
});
const source = fs.readFileSync(path.join(root,'src/unit2-child-app.js'),'utf8');
vm.runInContext(source + '\nglobalThis.app = {state,words,defaultPictures,createPairDeck,startSession,openPairs,flipPairCard,showPairHint,nextStep,updateNext,goHome,play,handleAction,keepPictures};',context);
const app = context.app;
const state = app.state;
let checks = 0;
const check = (name,run) => {
  app.startSession(app.defaultPictures);
  run();
  checks += 1;
  process.stdout.write(`PASS: ${name}\n`);
};
const pairFor = wordId => state.pairDeck.filter(card => card.word.id === wordId);
const revealPair = wordId => pairFor(wordId).forEach(card => app.flipPairCard(card.id));

check('a shuffled deck contains exactly two cards for each taught word',() => {
  const deck = app.createPairDeck(app.defaultPictures,() => 0.25);
  assert.equal(deck.length,6);
  assert.equal(new Set(deck.map(card => card.id)).size,6);
  app.defaultPictures.forEach(word => assert.equal(deck.filter(card => card.word.id === word.id).length,2));
  assert.ok(deck.every(card => card.word.letters.length === 2));
});
check('the final word leads to the pair game, not straight to completion',() => {
  state.wordIndex = state.session.length-1;
  state.stage = 2;
  state.placed = [0,1];
  app.updateNext();
  app.nextStep();
  assert.equal(state.screen,'pairs');
  assert.equal(state.sessionPhase,'pairs');
  assert.equal(state.sessionComplete,false);
  assert.equal(nodeFor('#pairNextButton').disabled,true);
});
check('one tap reveals one card, and tapping it twice cannot create a pair',() => {
  app.openPairs();
  const card = state.pairDeck[0];
  app.flipPairCard(card.id);
  app.flipPairCard(card.id);
  assert.equal(state.pairOpen.length,1);
  assert.equal(state.pairMatched.size,0);
});
check('mismatched pictures stay visible until the next card tap',() => {
  app.openPairs();
  const firstCard = state.pairDeck[0];
  const otherCard = state.pairDeck.find(card => card.word.id !== firstCard.word.id);
  app.flipPairCard(firstCard.id);
  app.flipPairCard(otherCard.id);
  assert.equal(state.pairOpen.length,2);
  assert.equal(state.pairMatched.size,0);
  assert.equal(nodeFor('#pairFeedback').textContent,'Look again');
  const nextCard = pairFor(firstCard.word.id).find(card => card.id !== firstCard.id);
  app.flipPairCard(nextCard.id);
  assert.equal(state.pairOpen.length,1);
  assert.equal(state.pairOpen[0],nextCard.id);
});
check('matched cards stay face up and cannot be counted again',() => {
  app.openPairs();
  const wordId = state.session[0].id;
  revealPair(wordId);
  assert.equal(state.pairMatched.size,1);
  const open = Array.from(state.pairOpen);
  revealPair(wordId);
  assert.equal(state.pairMatched.size,1);
  assert.deepEqual(Array.from(state.pairOpen),open);
});
check('the lion points to a matching card without turning it or changing results',() => {
  app.openPairs();
  const pair = pairFor(state.session[0].id);
  app.flipPairCard(pair[0].id);
  app.showPairHint();
  assert.equal(nodeFor(`[data-pair="${pair[1].id}"]`).classList.contains('hint-target'),true);
  assert.equal(state.pairOpen.length,1);
  assert.equal(state.pairMatched.size,0);
});
check('hints can reset a mismatch without losing an earlier match',() => {
  app.openPairs();
  revealPair(state.session[0].id);
  app.flipPairCard(pairFor(state.session[1].id)[0].id);
  app.flipPairCard(pairFor(state.session[2].id)[0].id);
  app.showPairHint();
  assert.equal(state.pairOpen.length,0);
  assert.equal(state.pairMatched.size,1);
});
check('unfinished pair play resumes after returning home',() => {
  app.openPairs();
  revealPair(state.session[0].id);
  app.flipPairCard(pairFor(state.session[1].id)[0].id);
  const order = state.pairDeck.map(card => card.id).join(',');
  const open = state.pairOpen[0];
  app.goHome();
  app.play();
  assert.equal(state.screen,'pairs');
  assert.equal(state.pairMatched.size,1);
  assert.equal(state.pairOpen[0],open);
  assert.equal(state.pairDeck.map(card => card.id).join(','),order);
});
check('finishing is blocked until every pair matches',() => {
  app.openPairs();
  app.handleAction('finish-pairs');
  assert.equal(state.screen,'pairs');
  state.session.forEach(word => revealPair(word.id));
  assert.equal(nodeFor('#pairNextButton').disabled,false);
  assert.equal(nodeFor('#pairHelpButton').disabled,true);
  app.handleAction('finish-pairs');
  assert.equal(state.screen,'finish');
  assert.equal(state.sessionComplete,true);
});
check('only explicit Keep saves completed-session pictures',() => {
  state.saved.clear();
  app.openPairs();
  app.keepPictures();
  assert.equal(state.saved.size,0);
  state.session.forEach(word => revealPair(word.id));
  app.handleAction('finish-pairs');
  assert.equal(state.saved.size,0);
  app.keepPictures();
  assert.equal(state.saved.size,3);
});
check('a single-picture activity keeps its short original finish flow',() => {
  app.startSession([app.defaultPictures[0]]);
  state.stage = 2;
  state.placed = [0,1];
  app.updateNext();
  app.nextStep();
  assert.equal(state.screen,'finish');
  assert.equal(state.pairDeck.length,0);
});
check('starting another activity clears the previous pair board',() => {
  app.openPairs();
  revealPair(state.session[0].id);
  app.startSession([app.defaultPictures[0]]);
  assert.equal(state.pairDeck.length,0);
  assert.equal(state.pairOpen.length,0);
  assert.equal(state.pairMatched.size,0);
  assert.equal(state.sessionPhase,'words');
});
check('same-art headwords never become visually indistinguishable pairs',() => {
  const houseWords = app.words.filter(word => word.art === 'house');
  assert.equal(houseWords.length,2);
  app.startSession([...houseWords,app.defaultPictures[1]]);
  app.openPairs();
  assert.equal(state.pairPictures.length,2);
  assert.equal(state.pairDeck.length,4);
  state.pairPictures.forEach(word => revealPair(word.id));
  assert.equal(nodeFor('#pairNextButton').disabled,false);
});
check('unknown card IDs and taps outside the pair screen have no effect',() => {
  app.openPairs();
  app.flipPairCard('missing-card');
  app.goHome();
  app.flipPairCard(state.pairDeck[0].id);
  assert.equal(state.pairOpen.length,0);
  assert.equal(state.pairMatched.size,0);
});
process.stdout.write(`${checks} pair-game checks passed.\n`);
