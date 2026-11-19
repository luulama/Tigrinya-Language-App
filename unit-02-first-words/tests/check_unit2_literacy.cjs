const assert = require('node:assert/strict');
const {createHarness} = require('./app_test_harness.cjs');

let checks = 0;
const check = (name,run) => {
  const harness = createHarness();
  harness.app.startSession(harness.app.defaultPictures);
  run(harness);
  checks += 1;
  process.stdout.write(`PASS: ${name}\n`);
};
const token = (nodeFor,index) => {
  const button = nodeFor(`[data-token="${index}"]`);
  button.dataset.token = String(index);
  return button;
};
const choice = (nodeFor,word) => {
  const button = nodeFor(`[data-choice="${word.id}"]`);
  button.dataset.choice = word.id;
  return button;
};
const buildWord = (app,nodeFor) => {
  app.placeLetter(token(nodeFor,0));
  app.placeLetter(token(nodeFor,1));
};

check('the child sees the word before guided assembly and recognition',({app,nodeFor}) => {
  assert.equal(nodeFor('#gameHeading').textContent,'Look');
  assert.ok(nodeFor('#activity').innerHTML.includes(app.state.session[0].word));
  app.nextStep();
  assert.equal(nodeFor('#gameHeading').textContent,'Make it');
  assert.equal(app.state.stage,1);
  assert.equal(nodeFor('#nextButton').disabled,true);
  buildWord(app,nodeFor);
  app.nextStep();
  assert.equal(nodeFor('#gameHeading').textContent,'Find it');
  assert.equal(app.state.stage,2);
  assert.equal(nodeFor('#nextButton').disabled,true);
});
check('the first recognition activity is a guided single-word example',({app,nodeFor}) => {
  app.state.stage = 2;
  app.renderGame();
  assert.equal(app.choiceWords(app.state.session[0]).length,1);
  assert.match(nodeFor('#activity').innerHTML,/data-count="1"/);
  assert.doesNotMatch(nodeFor('#activity').innerHTML,/id="wordCue" hidden/);
});
check('choices grow from one to two to three introduced words',({app}) => {
  [1,2,3].forEach((count,index) => {
    app.state.wordIndex = index;
    const options = app.choiceWords(app.state.session[index]);
    assert.equal(options.length,count);
    assert.ok(options.every(option => app.state.session.slice(0,index+1).some(word => word.id === option.id)));
    assert.equal(new Set(options.map(word => word.id)).size,count);
  });
  app.words.forEach((word,index) => {
    const lesson = [app.words[(index+app.words.length-1)%app.words.length],word,app.words[(index+1)%app.words.length]];
    app.startSession(lesson);
    lesson.forEach((target,position) => {
      app.state.wordIndex = position;
      const options = app.choiceWords(target);
      assert.equal(options.filter(option => option.id === target.id).length,1);
      assert.ok(options.every(option => lesson.slice(0,position+1).some(introduced => introduced.id === option.id)));
      assert.ok(options.every(option => option.id === target.id || option.art !== target.art));
    });
  });
});
check('later choices are printed words rather than identical picture copies',({app,nodeFor}) => {
  app.state.wordIndex = 2;
  app.state.stage = 2;
  app.renderGame();
  const markup = nodeFor('#activity').innerHTML;
  assert.match(markup,/id="wordCue" hidden/);
  const buttons = Array.from(markup.matchAll(/<button class="match-choice word-choice"(.*?)<\/button>/gs));
  assert.equal(buttons.length,3);
  buttons.forEach(button => {
    assert.match(button[1],/class="choice-word" lang="ti"/);
    assert.doesNotMatch(button[1],/<svg/);
  });
});
check('different headwords with the same picture are not competing answers',({app}) => {
  const houseWords = app.words.filter(word => word.art === 'house');
  app.startSession(houseWords);
  app.state.wordIndex = 1;
  const options = app.choiceWords(houseWords[1]);
  assert.equal(options.length,1);
  assert.equal(options[0].id,houseWords[1].id);
});
check('a hint reveals the model without completing the recognition activity',({app,nodeFor}) => {
  app.state.wordIndex = 1;
  app.state.stage = 2;
  app.renderGame();
  nodeFor('#wordCue').hidden = true;
  app.showHint();
  assert.equal(nodeFor('#wordCue').hidden,false);
  assert.equal(app.state.hint,true);
  assert.equal(app.state.matched,false);
  assert.equal(nodeFor('#nextButton').disabled,true);
  assert.equal(choice(nodeFor,app.state.session[1]).classList.contains('hint-target'),true);
});
check('a wrong word supplies a model and lets the child try again',({app,nodeFor}) => {
  app.state.wordIndex = 1;
  app.state.stage = 2;
  app.renderGame();
  app.matchWord(choice(nodeFor,app.state.session[0]));
  assert.equal(app.state.matched,false);
  assert.equal(app.state.hint,true);
  assert.equal(nodeFor('#nextButton').disabled,true);
  app.matchWord(choice(nodeFor,app.state.session[1]));
  assert.equal(app.state.matched,true);
  assert.equal(nodeFor('#gameFeedback').textContent,'Found it!');
  assert.equal(nodeFor('#nextButton').disabled,false);
});
check('untaught words cannot be submitted as recognition choices',({app,nodeFor}) => {
  app.state.stage = 2;
  app.renderGame();
  app.matchWord(choice(nodeFor,app.state.session[2]));
  assert.equal(app.state.matched,false);
  assert.equal(app.state.mistakes,0);
});
check('letter fitting still recovers from a wrong first letter',({app,nodeFor}) => {
  app.nextStep();
  app.placeLetter(token(nodeFor,1));
  assert.equal(app.state.placed.length,0);
  assert.equal(app.state.hint,true);
  buildWord(app,nodeFor);
  assert.equal(app.state.placed.length,2);
  assert.equal(nodeFor('#nextButton').disabled,false);
});
check('recognition handlers ignore clicks outside recognition',({app,nodeFor}) => {
  app.matchWord(choice(nodeFor,app.state.session[0]));
  assert.equal(app.state.matched,false);
  app.state.stage = 2;
  app.goHome();
  app.matchWord(choice(nodeFor,app.state.session[0]));
  assert.equal(app.state.matched,false);
});
check('an unfinished recognition step resumes with its hint intact',({app,nodeFor}) => {
  app.state.wordIndex = 1;
  app.state.stage = 2;
  app.renderGame();
  app.showHint();
  app.goHome();
  app.play();
  assert.equal(app.state.screen,'game');
  assert.equal(app.state.stage,2);
  assert.equal(app.state.wordIndex,1);
  assert.doesNotMatch(nodeFor('#activity').innerHTML,/id="wordCue" hidden/);
});
check('the complete three-word lesson reaches pairs only after recognition',({app,nodeFor}) => {
  app.state.session.forEach((word,index) => {
    assert.equal(app.state.wordIndex,index);
    assert.equal(app.state.stage,0);
    app.nextStep();
    buildWord(app,nodeFor);
    app.nextStep();
    assert.equal(app.state.stage,2);
    app.nextStep();
    assert.equal(app.state.stage,2);
    app.matchWord(choice(nodeFor,word));
    app.nextStep();
  });
  assert.equal(app.state.screen,'pairs');
  assert.equal(app.state.sessionComplete,false);
  assert.equal(app.state.pairDeck.length,6);
  assert.equal(app.state.saved.size,0);
});
process.stdout.write(`${checks} literacy-flow checks passed.\n`);
