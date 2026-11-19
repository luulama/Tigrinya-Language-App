'use strict';
const REVIEW_STATUS = 'Awaiting qualified native Tigrinya review';
const CONTENT = JSON.parse(document.querySelector('#unit2Content').textContent);
const worldNames = {home:'Home', food:'Food', nature:'Animals', people:'Me'};
const words = CONTENT.items.filter(item => item.includedInChildActivity).map((item,index) => {
  const world = CONTENT.worlds.find(group => group.id === item.pictureLesson.group);
  return {id:item.id, word:item.scriptCandidate, letters:item.letters, concept:item.pictureLesson.englishConcept, art:item.pictureLesson.art, category:world.id, background:world.background, order:index};
});
const wordByScript = script => words.find(word => word.word === script);
const defaultPictures = ['ቤት','ማይ','ድሙ'].map(wordByScript);
const state = {screen:'home',category:'home',page:0,collection:false,saved:new Set(),session:[],wordIndex:0,stage:0,matched:false,placed:[],mistakes:0,hint:false,sessionComplete:false,sessionPhase:'words',pairPictures:[],pairDeck:[],pairOpen:[],pairMatched:new Set(),demonstrated:new Set()};
const select = selector => document.querySelector(selector);
const selectAll = selector => Array.from(document.querySelectorAll(selector));
const escapeText = value => String(value).replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const artwork = (word,className='') => `<svg class="${className}" viewBox="0 0 320 240" role="img" aria-label="${escapeText(word.concept)} picture. ${REVIEW_STATUS}." aria-describedby="reviewNotice"><use href="#art-${word.art}"/></svg>`;
const native = (word,className='native-word') => `<span class="${className}" lang="ti" data-review="pending" aria-describedby="reviewNotice">${escapeText(word.word)}</span>`;
let demoTimer = null;

function clearDemonstration() {
  if (demoTimer !== null) window.clearTimeout(demoTimer);
  demoTimer = null;
}

function showScreen(screen) {
  clearDemonstration();
  state.screen = screen;
  ['home','gallery','game','pairs','finish','grownups'].forEach(name => {select(`#${name}Screen`).hidden = name !== screen;});
  if (screen === 'gallery') select('#collectionButton').setAttribute('aria-current',state.collection ? 'page' : 'false');
  else select('#collectionButton').removeAttribute('aria-current');
  if (screen === 'grownups') select('#grownupsButton').setAttribute('aria-current','page');
  else select('#grownupsButton').removeAttribute('aria-current');
  window.scrollTo({top:0,behavior:'instant'});
  const heading = select(`#${screen === 'game' ? 'game' : screen}Heading`);
  if (heading) heading.focus({preventScroll:true});
}

function goHome() {
  if (select('#parentDialog').open) select('#parentDialog').close();
  showScreen('home');
}

function startSession(selectedWords) {
  if (!selectedWords.length) return;
  state.session = selectedWords;
  state.wordIndex = 0;
  state.stage = 0;
  state.sessionComplete = false;
  state.sessionPhase = 'words';
  state.pairPictures = selectedWords.filter((word,index) => selectedWords.findIndex(candidate => candidate.art === word.art) === index);
  state.pairDeck = [];
  state.pairOpen = [];
  state.pairMatched.clear();
  resetActivity();
  showScreen('game');
  renderGame(true);
}

function play() {
  if (state.session.length && !state.sessionComplete) {
    if (state.sessionPhase === 'pairs') {
      openPairs();
      return;
    }
    showScreen('game');
    renderGame(true);
    return;
  }
  const newWords = words.filter(word => !state.saved.has(word.id));
  const firstPlay = state.saved.size === 0;
  startSession(firstPlay ? defaultPictures : (newWords.length ? newWords.slice(0,3) : defaultPictures));
}

function resetActivity() {
  state.matched = false;
  state.placed = [];
  state.mistakes = 0;
  state.hint = false;
}

function galleryItems() {
  return state.collection ? words.filter(word => state.saved.has(word.id)) : words.filter(word => word.category === state.category);
}

function openGallery(category,collection=false) {
  state.category = category || state.category;
  state.collection = collection;
  state.page = 0;
  renderGallery();
  showScreen('gallery');
}

function renderGallery() {
  const selectedWords = galleryItems();
  const pages = Math.max(1,Math.ceil(selectedWords.length/4));
  state.page = Math.max(0,Math.min(state.page,pages-1));
  select('#galleryHeading').textContent = state.collection ? 'Pictures' : worldNames[state.category];
  if (!selectedWords.length) {
    select('#galleryGrid').className = 'empty-collection';
    select('#galleryGrid').innerHTML = `<svg viewBox="0 0 260 240" role="img" aria-label="The little lion waves"><use href="#art-guide"/></svg><button class="play-button" data-action="play">Play ${icon('play')}</button>`;
  } else {
    select('#galleryGrid').className = 'gallery-grid';
    select('#galleryGrid').innerHTML = selectedWords.slice(state.page*4,state.page*4+4).map(word => `<button class="picture-tile" data-word="${word.id}" aria-label="Play ${escapeText(word.concept)} word" aria-describedby="reviewNotice"><span class="tile-art" style="--tile-bg:${word.background}">${artwork(word)}</span>${native(word,'tile-word')}</button>`).join('');
  }
  select('#galleryPager').hidden = pages <= 1;
  select('#previousPage').disabled = state.page === 0;
  select('#nextPage').disabled = state.page === pages-1;
  select('#pagerDots').innerHTML = Array.from({length:pages},(_,index) => `<i class="${index === state.page ? 'current' : ''}"></i>`).join('');
}

function choiceWords(word) {
  const preferred = [wordByScript('ቤት'),wordByScript('ማይ'),wordByScript('ድሙ'),wordByScript('ሙዝ')];
  const distractors = preferred.filter(candidate => candidate.art !== word.art).slice(0,2);
  const options = [...distractors];
  options.splice((word.order+state.wordIndex)%3,0,word);
  return options;
}

function reference(word,className='') {
  return `<div class="reference-card ${className}" aria-describedby="reviewNotice">${artwork(word)}${native(word)}</div>`;
}

function renderGame(demonstrate=false) {
  clearDemonstration();
  select('#nextButton').classList.remove('hint-target');
  const word = state.session[state.wordIndex];
  const stages = [{name:'Look',icon:'eye'},{name:'Find it',icon:'tap'},{name:'Make it',icon:'puzzle'}];
  select('#gameHeading').textContent = stages[state.stage].name;
  select('#stageTrail').innerHTML = stages.map((stage,index) => `${index ? '<li class="trail-line" aria-hidden="true"></li>' : ''}<li class="${index === state.stage ? 'active' : index < state.stage ? 'complete' : ''}" ${index === state.stage ? 'aria-current="step"' : ''} aria-label="${stage.name}${index === state.stage ? ', current step' : ''}">${icon(index < state.stage ? 'check' : stage.icon)}</li>`).join('');
  select('#sessionPebbles').innerHTML = state.session.map((entry,index) => `<i class="${index === state.wordIndex ? 'current' : ''}" aria-hidden="true"></i>`).join('');
  select('#sessionPebbles').setAttribute('aria-label',`Picture ${state.wordIndex+1} of ${state.session.length}`);
  select('#gameFeedback').textContent = '';
  if (state.stage === 0) {
    select('#activity').innerHTML = `<button class="teach-scene" data-action="notice" style="--tile-bg:${word.background}" aria-label="Explore the ${escapeText(word.concept)} picture" aria-describedby="reviewNotice">${artwork(word)}<span class="tap-dot" aria-hidden="true">${icon('tap')}</span></button><div class="teach-word">${native(word)}</div><div class="two-letter-mini" aria-label="Two letters" aria-describedby="reviewNotice">${word.letters.map(letter => `<span lang="ti">${escapeText(letter)}</span>`).join('')}</div>`;
  } else if (state.stage === 1) {
    select('#activity').innerHTML = `${reference(word)}<div class="picture-choices">${choiceWords(word).map(candidate => `<button class="match-choice" data-choice="${candidate.id}" ${state.matched ? 'aria-disabled="true"' : ''} ${state.matched && candidate.id === word.id ? 'data-result="match"' : ''} aria-label="Choose ${escapeText(candidate.concept)} picture" aria-describedby="reviewNotice">${artwork(candidate)}${state.matched && candidate.id === word.id ? `<span class="choice-tick" aria-hidden="true">${icon('check')}</span>` : ''}</button>`).join('')}</div>`;
  } else {
    const tokenOrder = word.order%2 ? [0,1] : [1,0];
    select('#activity').innerHTML = `${reference(word,'build-model')}<div class="letter-slots" aria-label="Build the two-letter word" aria-describedby="reviewNotice">${word.letters.map((letter,index) => `<div class="letter-slot ${state.placed.length > index ? 'filled' : state.placed.length === index ? 'next-slot' : ''}" ${state.placed.length > index ? 'lang="ti"' : ''} aria-label="${state.placed.length > index ? 'Placed letter '+escapeText(letter) : 'Empty letter place '+(index+1)}">${state.placed.length > index ? escapeText(letter) : `<span class="ghost" aria-hidden="true">${state.hint && state.placed.length === index ? escapeText(letter) : ''}</span>`}</div>`).join('')}</div><div class="letter-pool">${tokenOrder.map(index => `<button class="letter-token" data-token="${index}" ${state.placed.includes(index) ? 'disabled' : ''} lang="ti" aria-label="Place letter ${escapeText(word.letters[index])}" aria-describedby="reviewNotice">${escapeText(word.letters[index])}</button>`).join('')}</div>`;
  }
  updateNext();
  if (demonstrate && (state.stage === 0 || !state.demonstrated.has(state.stage))) demoTimer = window.setTimeout(() => {
    if (state.screen === 'game') {
      state.demonstrated.add(state.stage);
      showHint(false);
    }
  },700);
}

function updateNext() {
  select('#nextButton').disabled = state.stage === 1 ? !state.matched : state.stage === 2 ? state.placed.length !== 2 : false;
}

function handMarkup() {
  return `<span class="demo-hand" aria-hidden="true">${icon('hand')}</span>`;
}

function showHint(explicit=true) {
  if (state.screen === 'pairs') {
    showPairHint();
    return;
  }
  if (state.screen !== 'game') return;
  clearDemonstration();
  const word = state.session[state.wordIndex];
  selectAll('.demo-hand').forEach(hand => hand.remove());
  selectAll('.hint-target').forEach(target => target.classList.remove('hint-target'));
  let target = null;
  if (state.stage === 0) target = select('.teach-scene');
  if (state.stage === 1 && !state.matched) target = select(`[data-choice="${word.id}"]`);
  if (state.stage === 2 && state.placed.length < 2) {
    state.hint = true;
    const requiredIndex = word.letters.findIndex((letter,index) => letter === word.letters[state.placed.length] && !state.placed.includes(index));
    target = select(`[data-token="${requiredIndex}"]`);
    const ghost = select('.next-slot .ghost');
    if (ghost) ghost.textContent = word.letters[state.placed.length];
  }
  if (target) {
    target.classList.add('hint-target');
    target.insertAdjacentHTML('beforeend',handMarkup());
  } else if (explicit || state.stage === 0) {
    select('#nextButton').classList.add('hint-target');
  }
}

function noticePicture(button) {
  if (state.stage !== 0) return;
  clearDemonstration();
  button.classList.remove('popped');
  void button.offsetWidth;
  button.classList.add('popped');
  selectAll('.demo-hand').forEach(hand => hand.remove());
  select('#nextButton').classList.add('hint-target');
}

function matchPicture(button) {
  if (state.stage !== 1 || state.matched) return;
  const word = state.session[state.wordIndex];
  clearDemonstration();
  if (button.dataset.choice === word.id) {
    state.matched = true;
    selectAll('.demo-hand').forEach(hand => hand.remove());
    selectAll('.hint-target').forEach(target => target.classList.remove('hint-target'));
    button.dataset.result = 'match';
    button.insertAdjacentHTML('beforeend',`<span class="choice-tick" aria-hidden="true">${icon('check')}</span>`);
    selectAll('.match-choice').forEach(choice => choice.setAttribute('aria-disabled','true'));
    select('#gameFeedback').textContent = 'Same picture!';
    updateNext();
    select('#nextButton').classList.add('hint-target');
  } else {
    state.mistakes += 1;
    button.classList.remove('mismatch');
    void button.offsetWidth;
    button.classList.add('mismatch');
    select('#gameFeedback').textContent = 'Look';
    showHint();
  }
}

function placeLetter(button) {
  if (state.stage !== 2 || state.placed.length === 2) return;
  const word = state.session[state.wordIndex];
  const index = Number(button.dataset.token);
  if (state.placed.includes(index)) return;
  clearDemonstration();
  if (word.letters[index] === word.letters[state.placed.length]) {
    state.placed.push(index);
    state.hint = false;
    renderGame();
    if (state.placed.length === 2) {
      select('#gameFeedback').textContent = 'It fits!';
      select('#nextButton').classList.add('hint-target');
      select('#nextButton').focus({preventScroll:true});
    } else {
      const nextToken = select('.letter-token:not(:disabled)');
      if (nextToken) nextToken.focus({preventScroll:true});
      demoTimer = window.setTimeout(() => {if (state.screen === 'game') showHint(false);},450);
    }
  } else {
    state.mistakes += 1;
    select('#gameFeedback').textContent = 'Look';
    showHint();
  }
}

function nextStep() {
  if (state.screen !== 'game' || select('#nextButton').disabled) return;
  select('#nextButton').classList.remove('hint-target');
  if (state.stage < 2) {
    state.stage += 1;
    resetActivity();
    renderGame(true);
    select('#gameHeading').focus({preventScroll:true});
  } else if (state.wordIndex+1 < state.session.length) {
    state.wordIndex += 1;
    state.stage = 0;
    resetActivity();
    renderGame(true);
    select('#gameHeading').focus({preventScroll:true});
  } else if (state.pairPictures.length > 1) openPairs(true);
  else finishSession();
}

function createPairDeck(selectedWords,random=Math.random) {
  const deck = selectedWords.flatMap(word => [0,1].map(copy => ({id:`${word.id}-pair-${copy}`,word})));
  for (let position = deck.length-1; position > 0; position -= 1) {
    const otherPosition = Math.floor(random()*(position+1));
    [deck[position],deck[otherPosition]] = [deck[otherPosition],deck[position]];
  }
  return deck;
}

function openPairs(firstVisit=false) {
  state.sessionPhase = 'pairs';
  if (!state.pairDeck.length) state.pairDeck = createPairDeck(state.pairPictures);
  showScreen('pairs');
  renderPairs();
  if (firstVisit && !state.demonstrated.has('pairs')) {
    demoTimer = window.setTimeout(() => {
      if (state.screen !== 'pairs' || state.pairOpen.length) return;
      state.demonstrated.add('pairs');
      showPairHint();
    },700);
  }
}

function renderPairs(focusCardId=null) {
  const complete = state.pairMatched.size === state.pairPictures.length;
  const mismatch = state.pairOpen.length === 2 && state.pairOpen.every(cardId => {
    const card = state.pairDeck.find(candidate => candidate.id === cardId);
    return !state.pairMatched.has(card.word.id);
  });
  select('#pairGrid').innerHTML = state.pairDeck.map((card,index) => {
    const matched = state.pairMatched.has(card.word.id);
    const open = matched || state.pairOpen.includes(card.id);
    const label = open ? `${matched ? 'Matched' : 'Revealed'} ${card.word.concept} picture, ${card.word.word}. ${REVIEW_STATUS}.` : `Turn picture card ${index+1}`;
    return `<button class="pair-card ${open ? 'is-open' : ''} ${matched ? 'is-matched' : ''} ${mismatch && state.pairOpen.includes(card.id) ? 'is-mismatch' : ''}" data-pair="${card.id}" aria-label="${escapeText(label)}" aria-pressed="${open}" ${matched ? 'aria-disabled="true"' : ''} ${open ? 'aria-describedby="reviewNotice"' : ''}><span class="pair-back" aria-hidden="true">${icon('puzzle')}<span class="pair-seeds"><i></i><i></i></span></span><span class="pair-front" ${open ? '' : 'hidden'}>${artwork(card.word)}${native(card.word,'pair-word')}</span>${matched ? `<span class="pair-tick" aria-hidden="true">${icon('check')}</span>` : ''}</button>`;
  }).join('');
  select('#pairGrid').setAttribute('data-pairs',state.pairPictures.length);
  select('#pairProgress').innerHTML = state.pairPictures.map(word => `<span class="pair-progress-picture ${state.pairMatched.has(word.id) ? 'is-matched' : ''}" aria-hidden="true">${artwork(word)}${state.pairMatched.has(word.id) ? icon('check') : ''}</span>`).join('');
  select('#pairProgress').setAttribute('aria-label',`${state.pairMatched.size} of ${state.pairPictures.length} picture pairs matched`);
  select('#pairNextButton').disabled = !complete;
  select('#pairHelpButton').disabled = complete;
  select('#pairFeedback').textContent = complete ? 'All pairs!' : mismatch ? 'Look again' : '';
  if (complete) select('#pairNextButton').classList.add('hint-target');
  else select('#pairNextButton').classList.remove('hint-target');
  if (focusCardId) select(`[data-pair="${focusCardId}"]`).focus({preventScroll:true});
}

function flipPairCard(cardId) {
  if (state.screen !== 'pairs') return;
  const card = state.pairDeck.find(candidate => candidate.id === cardId);
  if (!card || state.pairMatched.has(card.word.id)) return;
  if (state.pairOpen.length === 1 && state.pairOpen[0] === cardId) return;
  clearDemonstration();
  if (state.pairOpen.length === 2) state.pairOpen = [];
  state.pairOpen.push(cardId);
  if (state.pairOpen.length === 2) {
    const firstCard = state.pairDeck.find(candidate => candidate.id === state.pairOpen[0]);
    if (firstCard.word.id === card.word.id) state.pairMatched.add(card.word.id);
  }
  renderPairs(cardId);
  if (state.pairMatched.has(card.word.id)) {
    select('#pairFeedback').textContent = state.pairMatched.size === state.pairPictures.length ? 'All pairs!' : 'A pair!';
    if (state.pairMatched.size === state.pairPictures.length) select('#pairNextButton').focus({preventScroll:true});
    else {
      const nextCard = state.pairDeck.find(candidate => !state.pairMatched.has(candidate.word.id));
      select(`[data-pair="${nextCard.id}"]`).focus({preventScroll:true});
    }
  }
}

function showPairHint() {
  if (state.screen !== 'pairs' || state.pairMatched.size === state.pairPictures.length) return;
  clearDemonstration();
  if (state.pairOpen.length === 2) {
    state.pairOpen = [];
    renderPairs();
  }
  selectAll('.demo-hand').forEach(hand => hand.remove());
  selectAll('.pair-card.hint-target').forEach(card => card.classList.remove('hint-target'));
  const revealed = state.pairDeck.find(card => card.id === state.pairOpen[0]);
  const targetCard = state.pairDeck.find(card => !state.pairMatched.has(card.word.id) && !state.pairOpen.includes(card.id) && (!revealed || card.word.id === revealed.word.id));
  if (!targetCard) return;
  const target = select(`[data-pair="${targetCard.id}"]`);
  target.classList.add('hint-target');
  target.insertAdjacentHTML('beforeend',handMarkup());
}

function finishSession() {
  state.sessionComplete = true;
  state.sessionPhase = 'finish';
  select('#finishPictures').innerHTML = state.session.map(word => `<div aria-describedby="reviewNotice">${artwork(word)}</div>`).join('');
  showScreen('finish');
}

function keepPictures() {
  if (!state.sessionComplete) return;
  state.session.forEach(word => state.saved.add(word.id));
  openGallery(null,true);
}

function searchText(value) {
  return String(value).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
}

function renderReview() {
  const query = searchText(select('#bankSearch').value.trim());
  const placement = select('#bankPlacement').value;
  const filtered = CONTENT.items.filter(item => {
    if (placement === 'picture' && !item.includedInChildActivity) return false;
    if (placement === 'bank' && item.includedInChildActivity) return false;
    return searchText([item.scriptCandidate,...item.englishMeaningCandidates,...item.transliterationCandidates].join(' ')).includes(query);
  });
  select('#reviewRows').innerHTML = filtered.map(item => `<tr><th scope="row"><span class="table-word" lang="ti">${escapeText(item.scriptCandidate)}</span><small class="bank-letters" lang="ti">${item.letters.map(escapeText).join(' + ')}</small></th><td>${item.senses.map(sense => `<div>${sense.glossCandidates.map(escapeText).join(' / ')}<small>${escapeText(sense.partOfSpeech)}${sense.tags.length ? ' · '+sense.tags.map(escapeText).join(', ') : ''}</small></div>`).join('')}</td><td>${item.transliterationCandidates.map(escapeText).join(' / ') || 'Not supplied'}<small>${REVIEW_STATUS}</small></td><td><span class="status-tag">Awaiting qualified native review</span><small>${item.includedInChildActivity ? 'Picture candidate' : 'Grown-up bank only'}</small><small>Word, image & future audio</small></td><td><a class="bank-source" href="${escapeText(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Dictionary source for ${escapeText(item.scriptCandidate)}">Wiktionary ↗</a></td></tr>`).join('');
  select('#bankCount').textContent = `${filtered.length} of ${CONTENT.items.length} headwords · all awaiting qualified native Tigrinya review`;
  select('#bankEmpty').hidden = filtered.length !== 0;
}

function handleAction(action,button) {
  if (action === 'home') goHome();
  if (action === 'play') play();
  if (action === 'collection') openGallery(null,true);
  if (action === 'previous-page' || action === 'next-page') {
    state.page += action === 'previous-page' ? -1 : 1;
    renderGallery();
    select('#galleryHeading').focus({preventScroll:true});
  }
  if (action === 'notice') noticePicture(button);
  if (action === 'next') nextStep();
  if (action === 'help') showHint();
  if (action === 'finish-pairs' && state.screen === 'pairs' && state.pairMatched.size === state.pairPictures.length) finishSession();
  if (action === 'keep') keepPictures();
  if (action === 'grownup-dialog') {
    clearDemonstration();
    select('#parentDialog').showModal();
  }
  if (action === 'cancel-grownups') select('#parentDialog').close();
  if (action === 'open-grownups') {
    select('#parentDialog').close();
    renderReview();
    showScreen('grownups');
  }
}

document.addEventListener('click',event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.world) openGallery(button.dataset.world);
  if (button.dataset.word) {
    const word = words.find(candidate => candidate.id === button.dataset.word);
    if (word) startSession([word]);
  }
  if (button.dataset.action) handleAction(button.dataset.action,button);
  if (button.dataset.choice) matchPicture(button);
  if (button.dataset.token !== undefined) placeLetter(button);
  if (button.dataset.pair) flipPairCard(button.dataset.pair);
});
select('#bankSearch').addEventListener('input',renderReview);
select('#bankPlacement').addEventListener('change',renderReview);
select('#peekTray').innerHTML = defaultPictures.map(word => artwork(word)).join('')+icon('arrow');
renderReview();
