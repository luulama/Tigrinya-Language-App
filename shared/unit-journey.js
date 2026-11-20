/* Shared, offline unit structure. No learner data leaves memory. */
(function(root){
  'use strict';
  const units = {
    shapes:{title:'Fidäl families',goal:'Explore Tigrinya Fidäl, one group at a time.',context:'Read Tigrinya words and practise Fidäl forms.',time:'About 3–5 minutes per family',steps:['Meet','Practise','Recap','Check'],reviewStatus:'Native review pending'},
    words:{title:'Picture words',goal:'Connect pictures with their written words.',context:'Find words for things around you.',time:'About 3–5 minutes per activity',steps:['Meet','Practise','Recap','Check'],reviewStatus:'Native review pending'}
  };
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function shuffle(values,random=Math.random){
    const result=[...values];
    for(let n=result.length-1;n>0;n--){const other=Math.floor(random()*(n+1));[result[n],result[other]]=[result[other],result[n]]}
    return result;
  }
  function overview(type){
    const unit=units[type];
    return `<div class="unit-purpose"><p class="unit-context">${escape(unit.context)}</p><p class="unit-goal">${escape(unit.goal)}</p><p class="unit-time">${escape(unit.time)} · your pace</p><ol class="unit-route" aria-label="Activity sequence">${unit.steps.map(step=>`<li>${escape(step)}</li>`).join('')}</ol></div>`;
  }
  function panel({label,title,body,primary,secondary='',disabled=false}){
    return `<div class="journey-panel"><p class="journey-label">${escape(label)}</p><h1 id="journeyHeading" tabindex="-1">${escape(title)}</h1>${body}<div class="journey-actions"><button class="journey-primary" data-journey-action="${escape(primary.action)}" ${disabled?'disabled':''}>${escape(primary.label)}</button>${secondary}</div></div>`;
  }
  function outcome(summary,noun){
    return `<div class="check-outcome"><p><strong>${summary.withoutHelp}</strong> ${escape(noun)} matched without help.</p><p><strong>${summary.withHelp}</strong> practised with help.</p><p class="unit-time">This describes this activity, not language mastery.</p></div>`;
  }
  function announce(message){
    const region=root.document&&root.document.querySelector('#journeyAnnouncement');
    if(region)region.textContent=message;
  }
  function createCheck(items,makeQuestion,random=Math.random){
    if(!items.length || new Set(items.map(item=>item.id)).size!==items.length)throw new Error('A check needs distinct taught items');
    const helped=new Set(),revisited=new Set(),results=new Map();
    const entryFor=(item,repeat)=>{const question=makeQuestion(item,items,random);return {item,repeat,question,solved:false,assisted:question.options.length<2}};
    const queue=shuffle(items,random).map(item=>entryFor(item,false));
    let position=0;
    const current=()=>queue[position]||null;
    return {
      get current(){return current()},
      get position(){return position},
      get total(){return queue.length},
      get complete(){return position>=queue.length},
      get summary(){return {total:items.length,withoutHelp:Array.from(results.values()).filter(result=>!result.helped).length,withHelp:Array.from(results.values()).filter(result=>result.helped).length}},
      get itemResults(){return Array.from(results,([id,result])=>({id,helped:result.helped}))},
      get helped(){return current()?current().assisted:false},
      help(){if(current()&&!current().solved){helped.add(current().item.id);current().assisted=true}},
      answer(key){
        const entry=current();
        if(!entry||entry.solved||!entry.question.options.some(option=>option.key===key))return 'ignored';
        if(key!==entry.question.correctKey){helped.add(entry.item.id);entry.assisted=true;return 'retry'}
        entry.solved=true;
        if(!results.has(entry.item.id))results.set(entry.item.id,{helped:helped.has(entry.item.id)||entry.assisted});
        return 'correct';
      },
      advance(){
        const entry=current();
        if(!entry||!entry.solved)return false;
        if(helped.has(entry.item.id)&&!revisited.has(entry.item.id)){
          revisited.add(entry.item.id);
          queue.push(entryFor(entry.item,true));
        }
        position+=1;return true;
      }
    };
  }
  function shapeQuestion(item,items,random){
    const other=items[(items.findIndex(candidate=>candidate.id===item.id)+1)%items.length];
    if(other.id===item.id)throw new Error('Shape comparison needs at least two introduced shapes');
    const options=shuffle([item,other,other],random).map((value,index)=>({key:`choice-${index}`,label:value.script,correct:value.id===item.id}));
    return {options,correctKey:options.find(option=>option.correct).key};
  }
  function wordQuestion(item,items,random){
    const alternatives=items.filter(candidate=>candidate.id!==item.id&&candidate.art!==item.art).slice(0,2);
    const options=shuffle([item,...alternatives],random).map(value=>({key:value.id,label:value.word}));
    return {options,correctKey:item.id};
  }
  root.UnitJourney={units,escape,shuffle,overview,panel,outcome,announce,createCheck,shapeQuestion,wordQuestion};
})(globalThis);
