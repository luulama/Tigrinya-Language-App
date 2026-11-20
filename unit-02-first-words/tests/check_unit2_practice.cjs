const assert = require('node:assert/strict');
const {createHarness,finishCheck} = require('./app_test_harness.cjs');
let checks = 0;
function check(name,run) {
  run(createHarness());
  checks += 1;
  process.stdout.write(`PASS: ${name}\n`);
}
function finishWord(app,nodeFor) {
  const word=app.state.session[app.state.wordIndex];
  app.nextStep();
  [0,1].forEach(index=>app.placeLetter({dataset:{token:String(index)}}));
  app.nextStep();
  const button=nodeFor(`[data-choice="${word.id}"]`);
  button.dataset.choice=word.id;
  app.matchWord(button);
  app.nextStep();
}
function finishLesson(app,nodeFor) {
  const count=app.state.session.length;
  for(let n=0;n<count;n++)finishWord(app,nodeFor);
  if(app.state.screen==='pairs') {
    app.state.pairPictures.forEach(word=>app.state.pairDeck.filter(card=>card.word.id===word.id).forEach(card=>app.flipPairCard(card.id)));
    app.handleAction('finish-pairs');
  }
  assert.equal(app.state.sessionPhase,'recap');
  finishCheck(app);
  assert.equal(app.state.screen,'finish');
}
check('starting or viewing a word never counts as practice',({app,nodeFor})=>{
  assert.match(nodeFor('#playButton').innerHTML,/Start/);
  app.play();
  assert.equal(app.state.practised.size,0);
  app.nextStep();
  assert.equal(app.state.practised.size,0);
  app.showHint();
  assert.equal(app.state.practised.size,0);
});
check('progress follows completed word activities, independently of Keep',({app,nodeFor})=>{
  app.play();finishWord(app,nodeFor);
  assert.equal(app.state.practised.size,1);
  assert.equal(app.state.saved.size,0);
  app.goHome();
  assert.match(nodeFor('#practiceSummary').textContent,/1 of 32/);
  assert.equal(nodeFor('#practiceProgress').value,1);
  assert.match(nodeFor('#playButton').innerHTML,/Continue/);
  assert.equal(nodeFor('#reviewButton').hidden,true);
});
check('Continue preserves partial assembly instead of starting a new lesson',({app,nodeFor})=>{
  app.play();app.nextStep();app.placeLetter({dataset:{token:'0'}});
  const ids=app.state.session.map(word=>word.id).join();
  app.goHome();app.review();app.play();
  assert.equal(app.state.stage,1);
  assert.equal(app.state.placed.length,1);
  assert.equal(app.state.session.map(word=>word.id).join(),ids);
  assert.equal(nodeFor('#nextButton').disabled,true);
});
check('finishing without Keep offers familiar and new words',({app,nodeFor})=>{
  app.play();finishLesson(app,nodeFor);app.goHome();
  assert.equal(app.state.saved.size,0);
  assert.equal(app.state.practised.size,3);
  assert.match(nodeFor('#playButton').innerHTML,/Next words/);
  assert.equal(nodeFor('#reviewButton').hidden,false);
  app.play();
  assert.equal(app.state.session.length,3);
  assert.equal(app.state.session.filter(word=>app.state.practised.has(word.id)).length,1);
  assert.equal(app.state.session.filter(word=>!app.state.practised.has(word.id)).length,2);
});
check('review uses only previously practised words and rotates',({app,nodeFor})=>{
  app.words.slice(0,7).forEach(word=>app.state.practised.add(word.id));
  app.review();
  const first=app.state.session.map(word=>word.id).join();
  assert.equal(app.state.session.length,3);
  assert.ok(app.state.session.every(word=>app.state.practised.has(word.id)));
  finishLesson(app,nodeFor);
  app.review();
  assert.notEqual(app.state.session.map(word=>word.id).join(),first);
  assert.equal(app.state.practised.size,7);
});
check('all 32 existing candidates remain reachable, including both house headwords',({app,nodeFor})=>{
  let sessions=0;
  while(app.state.practised.size<app.words.length && sessions<40) {
    app.play();
    assert.ok(app.state.session.length<=3);
    assert.ok(app.state.session.some(word=>!app.state.practised.has(word.id)));
    finishLesson(app,nodeFor);sessions++;
  }
  assert.equal(app.state.practised.size,32);
  app.goHome();
  assert.match(nodeFor('#playButton').innerHTML,/Review/);
  assert.equal(nodeFor('#practiceProgress').value,32);
  app.play();
  assert.ok(app.state.session.every(word=>app.state.practised.has(word.id)));
});
check('a near-complete bank gives an accurate familiar/new count',({app,nodeFor})=>{
  app.words.slice(0,-1).forEach(word=>app.state.practised.add(word.id));
  app.renderHome();
  assert.match(nodeFor('#resumeLabel').textContent,/1 familiar\. 1 new/);
});
check('next actions name the coming step and preserve answer gates',({app,nodeFor})=>{
  app.startSession([app.defaultPictures[0]]);
  assert.match(nodeFor('#nextButton').innerHTML,/Make it/);
  app.nextStep();
  assert.match(nodeFor('#nextButton').innerHTML,/Find it/);
  assert.equal(nodeFor('#nextButton').disabled,true);
  [0,1].forEach(index=>app.placeLetter({dataset:{token:String(index)}}));
  app.nextStep();
  assert.match(nodeFor('#nextButton').innerHTML,/Finish/);
  assert.equal(nodeFor('#nextButton').disabled,true);
});
check('a reload starts with no learner state',()=>{
  const first=createHarness();
  first.app.play();finishLesson(first.app,first.nodeFor);first.app.keepPictures();
  const fresh=createHarness();
  assert.equal(fresh.app.state.practised.size,0);
  assert.equal(fresh.app.state.saved.size,0);
  assert.equal(fresh.app.state.session.length,0);
});
check('wrong choices give specific, non-punitive help',({app,nodeFor})=>{
  app.play();app.nextStep();app.placeLetter({dataset:{token:'1'}});
  assert.equal(nodeFor('#gameFeedback').textContent,'Try this shape');
  app.startSession(app.defaultPictures);finishWord(app,nodeFor);
  app.nextStep();[0,1].forEach(index=>app.placeLetter({dataset:{token:String(index)}}));app.nextStep();
  const wrong=nodeFor(`[data-choice="${app.state.session[0].id}"]`);wrong.dataset.choice=app.state.session[0].id;
  app.matchWord(wrong);
  assert.equal(nodeFor('#gameFeedback').textContent,'Compare the letters');
  assert.equal(nodeFor('#wordCue').hidden,false);
  assert.equal(app.state.practised.size,1);
});
process.stdout.write(`${checks} practice-and-review checks passed.\n`);
