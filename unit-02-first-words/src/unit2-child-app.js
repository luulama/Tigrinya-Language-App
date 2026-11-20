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
const state = {screen:'home',category:'home',page:0,collection:false,saved:new Set(),practised:new Set(),reviewCursor:0,session:[],wordIndex:0,stage:0,matched:false,placed:[],mistakes:0,hint:false,sessionComplete:false,sessionPhase:'words',pairPictures:[],pairDeck:[],pairOpen:[],pairMatched:new Set(),demonstrated:new Set()};
const select = selector => document.querySelector(selector);
const selectAll = selector => Array.from(document.querySelectorAll(selector));
const escapeText = value => String(value).replace(/[&<>"']/g,character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const artwork = (word,className='') => `<svg class="${className}" viewBox="0 0 320 240" role="img" aria-label="${escapeText(word.concept)} picture. ${REVIEW_STATUS}." aria-describedby="reviewNotice"><use href="#art-${word.art}"/></svg>`;
const native = (word,className='native-word') => `<span class="${className}" lang="ti" dir="ltr" data-review="pending" aria-describedby="reviewNotice">${escapeText(word.word)}</span>`;
state.check = null;
state.checkSummaries = [];
let demoTimer = null;

function clearDemonstration() {
  if (demoTimer !== null) window.clearTimeout(demoTimer);
  demoTimer = null;
}

function showScreen(screen) {
  clearDemonstration();
  state.screen = screen;
  select('#learningPath').hidden = screen !== 'home';
  ['home','gallery','game','pairs','journey','finish','grownups'].forEach(name => {select(`#${name}Screen`).hidden = name !== screen;});
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
  renderHome();
  showScreen('home');
}

function reviewSelection() {
  const familiar = words.filter(word => state.practised.has(word.id));
  return Array.from({length:Math.min(3,familiar.length)},(_,index) => familiar[(state.reviewCursor+index)%familiar.length]);
}

function planLesson() {
  const dueIds = LearningPath.due('words');
  const dueWords = dueIds.map(id=>words.find(word=>word.id===id)).filter(Boolean);
  if(dueWords.length)return dueWords.slice(0,LearningPath.wordLimit());
  if(LearningPath.wordLimit()===1&&state.practised.size){
    const fresh=words.find(word=>!state.practised.has(word.id));
    if(fresh)return [fresh];
  }
  return newWordsPlan().slice(0,LearningPath.wordLimit());
}

function newWordsPlan() {
  if (!state.practised.size) return defaultPictures;
  const fresh = words.filter(word => !state.practised.has(word.id));
  if (!fresh.length) return reviewSelection();
  const familiar = reviewSelection().find(word => word.art !== fresh[0].art);
  return familiar ? [familiar,...fresh.filter(word => word.art !== familiar.art).slice(0,2)] : fresh.slice(0,3);
}

function renderHome() {
  LearningPath.render();
  const unfinished = state.session.length > 0 && !state.sessionComplete;
  const nextWords = unfinished ? state.session : planLesson();
  const allPractised = state.practised.size === words.length;
  select('#playButton').innerHTML = `${unfinished ? 'Continue' : LearningPath.due('words').some(id=>words.some(word=>word.id===id)) ? 'Review' : allPractised ? 'Review' : state.practised.size ? 'Next words' : 'Start'} ${icon('play')}`;
  select('#reviewButton').hidden = !state.practised.size || unfinished || allPractised;
  select('#practiceSummary').textContent = state.practised.size ? `${state.practised.size} of ${words.length} picture words practised` : `${nextWords.length} picture word${nextWords.length===1?'':'s'} to begin`;
  select('#practiceProgress').value = state.practised.size;
  select('#practiceProgress').max = words.length;
  const newCount = nextWords.filter(word => !state.practised.has(word.id)).length;
  select('#resumeLabel').textContent = unfinished ? (state.sessionPhase === 'pairs' ? 'Continue finding pairs' : state.sessionPhase === 'recap' ? 'Continue to your recap' : state.sessionPhase === 'check' ? 'Continue your picture-word check' : `Continue word ${state.wordIndex+1} of ${state.session.length}`) : state.practised.size && !allPractised ? `${nextWords.length-newCount} familiar. ${newCount} new.` : allPractised ? 'Revisit familiar picture words' : '';
  select('#peekTray').innerHTML = nextWords.map(word => artwork(word)).join('')+icon('arrow');
}

function startSession(selectedWords) {
  if (!selectedWords.length) return;
  state.session = selectedWords;
  state.wordIndex = 0;
  state.stage = 0;
  state.sessionComplete = false;
  state.sessionPhase = 'words';
  state.check = null;
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
    if (state.sessionPhase === 'recap' || state.sessionPhase === 'check') {
      renderSessionPanel();
      return;
    }
    if (state.sessionPhase === 'pairs') {
      openPairs();
      return;
    }
    showScreen('game');
    renderGame(true);
    return;
  }
  startSession(planLesson());
  state.reviewCursor += 1;
}

function review() {
  if (state.session.length && !state.sessionComplete) return;
  const selectedWords = reviewSelection();
  if (!selectedWords.length) return;
  startSession(selectedWords);
  state.reviewCursor += Math.min(3,selectedWords.length);
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
  select('#galleryHeading').textContent = state.collection ? 'Kept pictures' : worldNames[state.category];
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
  const introduced = state.session.slice(0,state.wordIndex+1);
  const distractors = introduced.filter(candidate => candidate.id !== word.id && candidate.art !== word.art).slice(-2);
  const options = [...distractors];
  options.splice((word.order+state.wordIndex)%(options.length+1),0,word);
  return options;
}

function reference(word,className='') {
  return `<div class="reference-card ${className}" aria-describedby="reviewNotice">${artwork(word)}${native(word)}</div>`;
}

function renderGame(demonstrate=false) {
  clearDemonstration();
  select('#nextButton').classList.remove('hint-target');
  const word = state.session[state.wordIndex];
  const stages = [{name:'Look',icon:'eye'},{name:'Make it',icon:'puzzle'},{name:'Find it',icon:'tap'}];
  select('#gameScreen').dataset.activity = ['look','build','recognize'][state.stage];
  select('#gameHeading').textContent = stages[state.stage].name;
  select('#stageTrail').innerHTML = stages.map((stage,index) => `${index ? '<li class="trail-line" aria-hidden="true"></li>' : ''}<li class="${index === state.stage ? 'active' : index < state.stage ? 'complete' : ''}" ${index === state.stage ? 'aria-current="step"' : ''} aria-label="${stage.name}${index === state.stage ? ', current step' : ''}">${icon(index < state.stage ? 'check' : stage.icon)}</li>`).join('');
  select('#sessionPebbles').innerHTML = `<span class="session-count">Word ${state.wordIndex+1} of ${state.session.length}</span>`+state.session.map((entry,index) => `<span class="lesson-marker ${index === state.wordIndex ? 'current' : index < state.wordIndex ? 'done' : ''}" aria-hidden="true">${artwork(entry)}</span>`).join('');
  select('#sessionPebbles').setAttribute('aria-label',`Word ${state.wordIndex+1} of ${state.session.length}`);
  select('#gameFeedback').textContent = '';
  if (state.stage === 0) {
    select('#activity').innerHTML = `<button class="teach-scene" data-action="notice" style="--tile-bg:${word.background}" aria-label="Explore the ${escapeText(word.concept)} picture" aria-describedby="reviewNotice">${artwork(word)}<span class="tap-dot" aria-hidden="true">${icon('tap')}</span></button><div class="teach-word">${native(word)}</div><p class="teach-meaning">${escapeText(word.concept)}</p><div class="two-letter-mini" aria-label="Two Fidäl characters" aria-describedby="reviewNotice">${word.letters.map(letter => `<span lang="ti">${escapeText(letter)}</span>`).join('')}</div>`;
  } else if (state.stage === 1) {
    const tokenOrder = word.order%2 ? [0,1] : [1,0];
    select('#activity').innerHTML = `${reference(word,'build-model')}<div class="letter-slots" aria-label="Build the word using two Fidäl characters" aria-describedby="reviewNotice">${word.letters.map((letter,index) => `<div class="letter-slot ${state.placed.length > index ? 'filled' : state.placed.length === index ? 'next-slot' : ''}" ${state.placed.length > index ? 'lang="ti"' : ''} aria-label="${state.placed.length > index ? 'Placed character '+escapeText(letter) : 'Empty character place '+(index+1)}">${state.placed.length > index ? escapeText(letter) : `<span class="ghost" aria-hidden="true">${state.hint && state.placed.length === index ? escapeText(letter) : ''}</span>`}</div>`).join('')}</div><div class="letter-pool">${tokenOrder.map(index => `<button class="letter-token" data-token="${index}" ${state.placed.includes(index) ? 'disabled' : ''} lang="ti" aria-label="Place character ${escapeText(word.letters[index])}" aria-describedby="reviewNotice">${escapeText(word.letters[index])}</button>`).join('')}</div>`;
  } else {
    const options = choiceWords(word);
    const showModel = options.length === 1 || state.hint || state.matched;
    select('#activity').innerHTML = `<div class="word-prompt" style="--tile-bg:${word.background}">${artwork(word)}<div class="word-cue" id="wordCue" ${showModel ? '' : 'hidden'} aria-label="Word model" aria-describedby="reviewNotice">${native(word)}</div></div><div class="word-choices" data-count="${options.length}" role="group" aria-label="Choose the written word for this picture">${options.map(candidate => `<button class="match-choice word-choice" data-choice="${candidate.id}" ${state.matched ? 'aria-disabled="true"' : ''} ${state.matched && candidate.id === word.id ? 'data-result="match"' : ''} aria-label="Choose ${escapeText(candidate.word)}" aria-describedby="reviewNotice">${native(candidate,'choice-word')}${state.matched && candidate.id === word.id ? `<span class="choice-tick" aria-hidden="true">${icon('check')}</span>` : ''}</button>`).join('')}</div>`;
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
  select('#nextButton').disabled = state.stage === 1 ? state.placed.length !== 2 : state.stage === 2 ? !state.matched : false;
  const label = state.stage === 0 ? 'Make it' : state.stage === 1 ? 'Find it' : state.wordIndex+1 < state.session.length ? 'Next word' : state.pairPictures.length > 1 ? 'Find pairs' : 'Finish';
  select('#nextButton').innerHTML = `${label} ${icon('arrow')}`;
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
  if (state.stage === 2 && !state.matched) {
    state.hint = true;
    select('#wordCue').hidden = false;
    target = select(`[data-choice="${word.id}"]`);
  }
  if (state.stage === 1 && state.placed.length < 2) {
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

function matchWord(button) {
  if (state.screen !== 'game' || state.stage !== 2 || state.matched) return;
  const word = state.session[state.wordIndex];
  if (!choiceWords(word).some(candidate => candidate.id === button.dataset.choice)) return;
  clearDemonstration();
  if (button.dataset.choice === word.id) {
    state.matched = true;
    selectAll('.demo-hand').forEach(hand => hand.remove());
    selectAll('.hint-target').forEach(target => target.classList.remove('hint-target'));
    button.dataset.result = 'match';
    button.insertAdjacentHTML('beforeend',`<span class="choice-tick" aria-hidden="true">${icon('check')}</span>`);
    selectAll('.match-choice').forEach(choice => choice.setAttribute('aria-disabled','true'));
    select('#wordCue').hidden = false;
    select('#gameFeedback').textContent = 'Found it!';
    updateNext();
    select('#nextButton').classList.add('hint-target');
  } else {
    state.mistakes += 1;
    button.classList.remove('mismatch');
    void button.offsetWidth;
    button.classList.add('mismatch');
    select('#gameFeedback').textContent = 'Compare the letters';
    showHint();
  }
}

function placeLetter(button) {
  if (state.screen !== 'game' || state.stage !== 1 || state.placed.length === 2) return;
  const word = state.session[state.wordIndex];
  const index = Number(button.dataset.token);
  if (!Number.isInteger(index) || index < 0 || index >= word.letters.length) return;
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
    select('#gameFeedback').textContent = 'Try this shape';
    showHint();
  }
}

function nextStep() {
  if (state.screen !== 'game' || select('#nextButton').disabled) return;
  select('#nextButton').classList.remove('hint-target');
  if (state.stage === 2) state.practised.add(state.session[state.wordIndex].id);
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
  else openRecap();
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

function recapWords() {
  return `<div class="journey-recap">${state.session.map(word=>`<div>${artwork(word)}${native(word,'recap-script')}<span class="recap-meaning">${escapeText(word.concept)}</span></div>`).join('')}</div>`;
}

function openRecap() {
  state.sessionPhase = 'recap';
  renderSessionPanel();
}

function startWordCheck() {
  if (state.sessionPhase !== 'recap') return;
  state.check = UnitJourney.createCheck(state.session,UnitJourney.wordQuestion);
  state.sessionPhase = 'check';
  renderSessionPanel();
}

function renderSessionPanel() {
  if (state.sessionPhase === 'recap') {
    select('#journeyScreen').innerHTML = UnitJourney.panel({label:'RECAP',title:'Your picture words',body:`<p>Look once more. Then try without the model.</p>${recapWords()}`,primary:{action:'word-check',label:'Try the check'},secondary:'<button class="journey-secondary" data-journey-action="repeat-words">Practise again</button>'});
  } else if (state.sessionPhase === 'check' && state.check && !state.check.complete) {
    const check=state.check,entry=check.current,word=entry.item;
    const assisted=check.helped&&!entry.solved;
    const body=`<p class="unit-time">${entry.repeat?'Revisit':'Picture '+(check.position+1)+' of '+state.session.length}</p><div class="journey-prompt">${artwork(word)}</div><div class="journey-model" id="checkModel" ${assisted?'':'hidden'}>${native(word,'recap-script')}<span class="recap-meaning">${escapeText(word.concept)}</span></div><div class="journey-choices" role="group" aria-label="Choose the word for this picture">${entry.question.options.map(option=>`<button class="journey-choice" data-check-key="${option.key}" ${entry.solved?'aria-disabled="true"':''} ${assisted&&option.key===entry.question.correctKey?'data-hint="true"':''} ${entry.solved&&option.key===entry.question.correctKey?'data-result="correct"':''} aria-label="Choose ${escapeText(option.label)}"><span lang="ti" dir="ltr">${escapeText(option.label)}</span>${entry.solved&&option.key===entry.question.correctKey?'<span class="check-mark" aria-hidden="true">✓</span>':''}</button>`).join('')}</div><p id="checkFeedback" class="journey-feedback" role="status" aria-live="polite">${entry.solved?'Picture and word matched.':assisted?'Compare the model. Try the highlighted word.':''}</p>`;
    select('#journeyScreen').innerHTML=UnitJourney.panel({label:'PICTURE-WORD CHECK',title:'Find its word',body,primary:{action:'advance-check',label:'Continue'},disabled:!entry.solved,secondary:entry.solved?'':'<button class="journey-help" data-journey-action="check-help">Show me</button>'});
  } else return;
  select('#journeyScreen').insertAdjacentHTML('beforeend','<button class="journey-exit" data-action="home">Home · continue later</button>');
  showScreen('journey');
}

function answerWordCheck(key) {
  if (state.screen!=='journey'||state.sessionPhase!=='check'||!state.check) return;
  const result=state.check.answer(key);
  if(result==='ignored')return;
  renderSessionPanel();
  UnitJourney.announce(result==='correct'?'Picture and word matched.':'Compare the model. Try the highlighted word.');
  if(result==='correct') select('[data-journey-action="advance-check"]').focus({preventScroll:true});
  else select(`[data-check-key="${state.check.current.question.correctKey}"]`).focus({preventScroll:true});
}

function handleJourney(action) {
  if(state.screen!=='journey')return;
  if(action==='word-check')startWordCheck();
  if(action==='repeat-words'&&state.sessionPhase==='recap')startSession([...state.session]);
  if(action==='check-help'&&state.sessionPhase==='check'&&state.check){state.check.help();renderSessionPanel();select(`[data-check-key="${state.check.current.question.correctKey}"]`).focus({preventScroll:true})}
  if(action==='advance-check'&&state.sessionPhase==='check'&&state.check&&state.check.advance()){
    if(state.check.complete)finishSession();else renderSessionPanel();
  }
}

function finishSession() {
  if(!state.check||!state.check.complete||state.sessionComplete)return;
  state.session.forEach(word=>state.practised.add(word.id));
  LearningPath.record('words',state.check.itemResults);
  state.sessionComplete = true;
  state.sessionPhase = 'finish';
  select('#finishPictures').innerHTML = state.session.map(word => `<div aria-describedby="reviewNotice">${artwork(word)}</div>`).join('');
  select('#finishNextButton').innerHTML = `${state.practised.size === words.length ? 'Review' : 'Next words'} ${icon('arrow')}`;
  select('#finishSummary').textContent = `${state.session.length} picture word${state.session.length === 1 ? '' : 's'} practised`;
  select('#checkOutcome').innerHTML=UnitJourney.outcome(state.check.summary,'picture words');
  state.checkSummaries.push(state.check.summary);
  showScreen('finish');
}

function keepPictures() {
  if (!state.sessionComplete) return;
  state.session.forEach(word => state.saved.add(word.id));
  openGallery(null,true);
}

function searchText(value) {
  return FidalText.searchKey(value);
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
  if (action === 'review') review();
  if (action === 'collection') openGallery(null,true);
  if (action === 'previous-page' || action === 'next-page') {
    state.page += action === 'previous-page' ? -1 : 1;
    renderGallery();
    select('#galleryHeading').focus({preventScroll:true});
  }
  if (action === 'notice') noticePicture(button);
  if (action === 'next') nextStep();
  if (action === 'help') showHint();
  if (action === 'finish-pairs' && state.screen === 'pairs' && state.pairMatched.size === state.pairPictures.length) openRecap();
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
  if (button.dataset.journeyAction) handleJourney(button.dataset.journeyAction);
  if (button.dataset.checkKey) answerWordCheck(button.dataset.checkKey);
  if (button.dataset.choice) matchWord(button);
  if (button.dataset.token !== undefined) placeLetter(button);
  if (button.dataset.pair) flipPairCard(button.dataset.pair);
});
select('#bankSearch').addEventListener('input',renderReview);
select('#bankPlacement').addEventListener('change',renderReview);
select('#unitOverview').innerHTML=UnitJourney.overview('words');
renderHome();
renderReview();

LearningPath.completedWords().forEach(id=>{if(words.some(word=>word.id===id))state.practised.add(id)});
LearningPath.configure({unit:'words',refresh:renderHome,reset(){state.practised.clear();state.saved.clear();renderHome()}});
renderHome();
