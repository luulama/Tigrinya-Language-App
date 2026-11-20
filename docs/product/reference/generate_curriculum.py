"""Generate authoring assignments only; never generate Tigrinya teaching content."""
import json
from pathlib import Path

stages = [
 ('P','Pre-literacy and foundations',50,['Meaning and sound awareness','Fidäl family relationships','Familiar picture words','First connected meanings']),
 ('B','Beginner',700,['Meeting and introducing','Home and everyday actions','Needs and simple exchanges','Short messages and stories']),
 ('E','Elementary',1500,['Routine plans and places','Describing and comparing','Events and short narratives','Community interactions']),
 ('I','Intermediate',3000,['Experiences and explanations','Managing situations','Stories and viewpoints','Connected projects']),
 ('U','Upper intermediate',5000,['Discussion and decisions','Media and interpretation','Negotiation and collaboration','Arguments and reports']),
 ('A','Advanced',8000,['Complex narratives and literature','Source synthesis','Register and audience','Extended presentations and writing']),
 ('R','Professional and advanced competency',12000,['Professional interaction','Specialist reading and listening','Academic and professional writing','Domain portfolio']),
]
recipes=[
 ('Establish meaning','Understand the meaning of a reviewed input','input',['model','supported_comprehension','new_example'],['word','phrase','audio','image']),
 ('Notice a pattern','Identify one reviewed form or language pattern','language',['model','contrast','guided_attempt'],['form','grammar','word']),
 ('Retrieve a target','Respond to a previously taught target before seeing its model','retrieval',['cold_prompt','feedback','corrective_retry'],['word','phrase','assessment']),
 ('Understand new input','Understand the taught target in a new passage','input_transfer',['new_input','comprehension','feedback'],['story','audio','assessment']),
 ('Rehearse production','Produce a relevant response with fading support','production',['model','rehearsal','independent_response'],['phrase','sentence','audio']),
 ('Complete an exchange','Accomplish a practical communication goal','communication',['scenario','response','feedback','retry'],['dialogue','assessment']),
 ('Revisit in context','Understand and reuse the target in a connected account','context',['story_or_dialogue','response','recap'],['story','dialogue','audio']),
 ('Transfer checkpoint','Use the target in an unfamiliar parallel task','assessment',['cold_transfer','rubric','next_objective'],['assessment']),
]
course={'schemaVersion':1,'courseId':'ti-platform','language':'ti','status':'specification','teachingContentGenerated':False,'stages':[], 'sourceMap':[
 {'path':'unit-01-fidel-foundations/index.html','targetUnit':'P-U2','status':'prototype_pending_review','scope':'293-form reference inventory; visual activities are not sound/reading assessments'},
 {'path':'unit-02-first-words/unit-2-content-review.json','targetUnit':'P-U3','status':'prototype_pending_review','scope':'32 picture candidates; all 142 dictionary matches stay in the review bank'}
]}
previous=None
for code,label,budget,names in stages:
 stage={'id':code,'title':label,'vocabularyBudget':budget,'budgetStatus':'provisional_authoring_target','graduationContract':'LEARNING_SPEC.md#exact-internal-graduation-rules','units':[]}
 for n,name in enumerate(names,1):
  uid=f'{code}-U{n}'
  unit={'id':uid,'title':name,'defaultRouteAfter':previous,'modules':[]}
  for m in [1,2]:
   mid=f'{uid}-M{m}'
   module={'id':mid,'title':'Input and language' if m==1 else 'Use and transfer','lessons':[]}
   for k,recipe in enumerate(recipes[(m-1)*4:m*4],1):
    title,goal,kind,steps,targets=recipe
    lid=f'{mid}-L{k}'
    previous_lesson=f'{mid}-L{k-1}' if k>1 else (f'{uid}-M1-L4' if m==2 else None)
    module['lessons'].append({'id':lid,'title':f'{name}: {title.lower()}','objectiveId':lid+'-objective','goal':f'{goal} in {name.lower()}.','kind':kind,'targetKinds':targets,'sequence':steps,'prerequisites':[previous_lesson] if previous_lesson else [],'estimatedMinutes':5,'status':'blocked_content','requiredScopes':['language','teaching','rights','accessibility']+(['audio'] if 'audio' in targets else []),'contentVersionIds':[],'evidence':{'independentOnly':kind in ['retrieval','assessment'],'supportsAccessibleAlternative':True,'scriptPrerequisitesRequired':code=='P' and n==2,'proficiencyClaim':False}})
   unit['modules'].append(module)
  stage['units'].append(unit);previous=uid
 course['stages'].append(stage)
Path(__file__).resolve().parents[1].joinpath('curriculum.json').write_text(json.dumps(course,ensure_ascii=False,indent=2)+'\n')
