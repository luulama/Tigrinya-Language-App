'use strict';
// Target-specific reference reducer. The current app does not import this module.
const DAY=86400000, intervals=[1,3,7,14,30,60];
const keyPattern=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const validKey=value=>typeof value==='string'&&keyPattern.test(value);
function initial(targetKey,at){
 if(!validKey(targetKey)||!Number.isSafeInteger(at)||at<0)throw Error('Invalid target or timestamp');
 return {targetKey,schedulerVersion:2,step:0,dueAt:at+DAY,lastAttemptAt:null,lastExposureAt:null,lastColdAt:null,firstColdAt:null,lastSessionId:null,lastOutcome:null,coldCorrect:0,coldTotal:0,delayedCorrect:0,delayedTotal:0,transferSum:0,transferTotal:0,consumedEventIds:[]};
}
function reduce(previous,event){
 if(!event||!validKey(event.id)||!validKey(event.sessionId)||!validKey(event.targetKey)||!Number.isSafeInteger(event.at)||event.at<0)throw Error('Invalid event identity or timestamp');
 if(!['correct','incorrect','supported','skipped','exposure'].includes(event.outcome)||typeof event.helped!=='boolean'||typeof event.modelFirst!=='boolean')throw Error('Invalid outcome/support');
 if(!['answer_key','human','ai_practice','unscored'].includes(event.assessor))throw Error('Invalid assessor');
 if(event.transferScore!==null&&(!Number.isFinite(event.transferScore)||event.transferScore<0||event.transferScore>4))throw Error('Invalid transfer score');
 if(['ai_practice','unscored'].includes(event.assessor)&&!['exposure','skipped'].includes(event.outcome))throw Error('Practice-only assessors cannot score evidence');
 const state=previous?JSON.parse(JSON.stringify(previous)):initial(event.targetKey,event.at);
 if(state.schedulerVersion!==2||state.targetKey!==event.targetKey)throw Error('Target/version mismatch');
 if(state.consumedEventIds.includes(event.id))return state;
 const latest=Math.max(state.lastAttemptAt??0,state.lastExposureAt??0);
 if(event.at<latest)throw Error('Clock rollback or unsorted events');
 state.consumedEventIds.push(event.id);
 if(event.outcome==='skipped')return state;
 if(event.outcome==='exposure'){
  state.lastExposureAt=event.at;state.lastOutcome='exposure';return state;
 }
 const supported=event.helped||event.modelFirst||event.outcome==='supported';
 const firstInSession=state.lastSessionId!==event.sessionId;
 const independent=!supported&&firstInSession&&(state.lastExposureAt===null||event.at-state.lastExposureAt>=DAY);
 const delayed=independent&&state.lastExposureAt!==null&&event.at-state.lastExposureAt>=DAY;
 const correct=event.outcome==='correct';
 if(independent){
  state.coldTotal++;if(correct)state.coldCorrect++;
  state.firstColdAt=state.firstColdAt??event.at;state.lastColdAt=event.at;
  if(delayed){state.delayedTotal++;if(correct)state.delayedCorrect++}
  if(event.transferScore!==null){state.transferSum+=event.transferScore;state.transferTotal++}
 }
 if(!correct||supported){state.step=0;state.dueAt=event.at+DAY}
 else if(independent&&delayed&&event.at>=state.dueAt){state.step=Math.min(state.step+1,intervals.length-1);state.dueAt=event.at+intervals[state.step]*DAY}
 state.lastAttemptAt=event.at;state.lastExposureAt=event.at;state.lastSessionId=event.sessionId;state.lastOutcome=supported?'supported':event.outcome;
 return state;
}
function scores(state){
 const retention=state.delayedTotal>=5?Math.round(100*state.delayedCorrect/state.delayedTotal):null;
 const sufficient=state.coldTotal>=3&&state.delayedTotal>=2&&state.transferTotal>=2&&state.firstColdAt!==null&&state.lastColdAt-state.firstColdAt>=7*DAY;
 const evidence=sufficient?Math.round(100*(.4*state.coldCorrect/state.coldTotal+.3*state.delayedCorrect/state.delayedTotal+.3*state.transferSum/(4*state.transferTotal))):null;
 return {observedRetention:retention,retentionNumerator:state.delayedCorrect,retentionDenominator:state.delayedTotal,evidenceScore:evidence,predictedRetention:null};
}
function queue(targets,at,budget){
 if(!Number.isSafeInteger(at)||at<0||!Number.isInteger(budget)||budget<0)throw Error('Invalid queue request');
 const sorted=targets.filter(target=>target.approved&&target.assetsAvailable&&target.accessible&&target.state.dueAt<=at).sort((a,b)=>a.state.dueAt-b.state.dueAt||Number(['supported','incorrect'].includes(b.state.lastOutcome))-Number(['supported','incorrect'].includes(a.state.lastOutcome))|| (a.id<b.id?-1:a.id>b.id?1:0));
 const result=[],seen=new Set();
 while(sorted.length&&result.length<budget){
  let index=sorted.findIndex(target=>!seen.has(target.id)&&(result.length<2||result.at(-1).skill!==target.skill||result.at(-2).skill!==target.skill));
  if(index<0)break; // A shorter queue is preferable to forced repetitive blocks.
  const [target]=sorted.splice(index,1);seen.add(target.id);result.push(target);
 }
 return result;
}
module.exports={DAY,intervals,initial,reduce,scores,queue};
