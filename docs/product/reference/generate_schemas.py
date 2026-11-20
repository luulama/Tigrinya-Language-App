"""Build explicit exchange contracts; no learner data or approved content is created."""
import copy,json
from pathlib import Path
base=Path(__file__).resolve().parents[1]
S={'type':'string','minLength':1};I={'type':'integer','minimum':0};B={'type':'boolean'}
ID={'type':'string','pattern':'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$'}
def arr(item,min_items=0):return {'type':'array','items':copy.deepcopy(item),'minItems':min_items}
def enum(*values):return {'type':'string','enum':list(values)}
def ref(name):return {'$ref':'#/$defs/'+name}
def obj(properties,required=None):return {'type':'object','additionalProperties':False,'properties':properties,'required':list(properties) if required is None else required}
def nullable(schema):return {'anyOf':[schema,{'type':'null'}]}
D={}
D['LanguagePack']=obj({'id':ID,'languageTag':S,'script':S,'direction':enum('ltr','rtl'),'scriptModel':enum('alphabet','abugida','syllabary','mixed','other'),'normalisation':{'const':'NFC'},'segmentationAdapter':S,'searchAdapter':S,'answerAdapter':S,'fontFamilies':arr(S,1),'contentReleaseId':nullable(ID)})
D['Word']=obj({'script':S,'senseId':ID,'lexemeId':ID,'transliteration':nullable(S),'pronunciationConvention':nullable(S),'meaning':S,'variety':nullable(S),'register':nullable(S),'sourceIds':arr(ID,1),'audioVersionId':nullable(ID),'imageVersionId':nullable(ID)})
D['Phrase']=obj({'script':S,'meaning':S,'functionId':ID,'wordVersionIds':arr(ID),'register':nullable(S),'sourceIds':arr(ID,1)})
D['Sentence']=obj({'script':S,'meaning':S,'context':S,'patternVersionIds':arr(ID),'sourceIds':arr(ID,1)})
D['Form']=obj({'script':S,'familyId':ID,'order':nullable({'type':'integer','minimum':1,'maximum':20}),'audioVersionId':nullable(ID),'strokeVersionId':nullable(ID),'sourceIds':arr(ID,1)})
D['Grammar']=obj({'functionId':ID,'explanation':S,'exampleVersionIds':arr(ID,1),'sourceIds':arr(ID,1)})
D['Segment']=obj({'id':ID,'text':S,'audioVersionId':nullable(ID),'imageVersionId':nullable(ID),'targetVersionIds':arr(ID)})
D['Story']=obj({'title':S,'genre':enum('picture_story','early_reader','graded_reader','chapter_story','native_story','article','news','podcast','audiobook'),'stage':enum('P','B','E','I','U','A','R'),'segments':arr(ref('Segment'),1),'introducedTargets':arr(ID),'recycledTargets':arr(ID),'sourceIds':arr(ID,1),'ageBands':arr(enum('4-8','9-12','13-18','adult'),1)})
D['Turn']=obj({'id':ID,'role':S,'sentenceVersionId':ID,'audioVersionId':nullable(ID)})
D['Dialogue']=obj({'purpose':S,'roles':arr(S,2),'turns':arr(ref('Turn'),2),'functionIds':arr(ID,1),'acceptableResponseVersionIds':arr(ID,1)})
D['Activity']=obj({'id':ID,'kind':enum('model','contrast','retrieval','production','communication','recap','transfer'),'promptVersionId':ID,'targetVersionIds':arr(ID,1),'responseMode':enum('tap','point','speak','write','type','accessible_alternative'),'acceptedVersionIds':arr(ID),'requiresAudio':B,'requiresVerifiedStrokes':B,'modelBeforeAnswer':B,'accessibleAlternativeId':nullable(ID)})
D['Lesson']=obj({'objectiveId':ID,'stage':enum('P','B','E','I','U','A','R'),'prerequisiteObjectiveIds':arr(ID),'activities':arr(ref('Activity'),1),'estimatedMinutes':{'type':'integer','minimum':1,'maximum':60},'requiredScopes':arr(enum('language','teaching','rights','accessibility','audio','culture','strokes'),1)})
for name,kind in [('Audio','audio'),('Image','image'),('Video','video')]:
 fields={'assetType':{'const':kind},'path':{'type':'string','pattern':'^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$))(?!.*://).+$'},'sha256':{'type':'string','pattern':'^[a-f0-9]{64}$'},'rightsSourceId':ID,'altText':S}
 if kind in ['audio','video']:fields.update({'durationMs':{'type':'integer','minimum':1},'transcriptVersionId':ID,'variety':S})
 if kind=='audio':fields['speakerKey']=ID
 if kind=='video':fields['captionsPath']=S
 D[name]=obj(fields)
D['Assessment']=obj({'objectiveId':ID,'skill':enum('visual','listening','speaking','reading','writing'),'parallelSetId':ID,'promptVersionId':ID,'acceptedVersionIds':arr(ID),'rubricDimensions':arr(S,1),'requiresHumanAssessor':B,'modelBeforeAnswer':{'const':False}})
D['Culture']=obj({'title':S,'community':S,'region':S,'perspective':S,'sourceIds':arr(ID,1),'targetVersionIds':arr(ID,1),'ageBands':arr(enum('4-8','9-12','13-18','adult'),1)})
D['ContentVersion']=obj({'id':ID,'contentId':ID,'languageTag':S,'kind':enum('word','phrase','sentence','form','grammar','story','dialogue','lesson','audio','image','video','assessment','culture'),'revision':{'type':'integer','minimum':1},'status':enum('draft','submitted','changes_requested','approved','revoked'),'authorId':ID,'sha256':{'type':'string','pattern':'^[a-f0-9]{64}$'},'payload':{'type':'object'},'sourceIds':arr(ID,1)})
D['Approval']=obj({'id':ID,'contentVersionId':ID,'reviewerId':ID,'scope':enum('language','teaching','rights','accessibility','audio','culture','strokes'),'decision':enum('approved','changes_requested','revoked'),'payloadHash':{'type':'string','pattern':'^[a-f0-9]{64}$'},'notes':S,'decidedAt':I})
D['User']=obj({'id':ID,'tenantId':ID,'role':enum('adult','author','reviewer','administrator'),'externalSubject':nullable(S)})
D['Learner']=obj({'id':ID,'tenantId':ID,'ownerUserId':nullable(ID),'ageBand':enum('4-8','9-12','13-18','adult','unspecified'),'presentation':enum('child','teen','adult'),'languageTag':S,'path':enum('general','heritage','traveller','professional','academic'),'storageMode':enum('memory','device','consented_cloud')})
D['Parent']=obj({'id':ID,'userId':ID,'learnerIds':arr(ID),'relationshipStatus':enum('pending','verified','revoked'),'scopeIds':arr(ID)})
D['Teacher']=obj({'id':ID,'userId':ID,'classIds':arr(ID),'relationshipStatus':enum('pending','verified','revoked')})
D['Reviewer']=obj({'id':ID,'userId':ID,'languages':arr(S,1),'scopes':arr(enum('language','teaching','rights','accessibility','audio','culture','strokes'),1),'qualificationEvidence':S})
D['Attempt']=obj({'id':ID,'learnerId':ID,'targetKey':ID,'contentVersionId':ID,'skill':enum('visual','listening','speaking','reading','writing'),'taskKind':enum('word','phrase','sentence','story','pronunciation','grammar','conversation','form'),'sessionId':ID,'at':I,'outcome':enum('correct','incorrect','supported','skipped','exposure'),'helped':B,'modelFirst':B,'transferScore':nullable({'type':'number','minimum':0,'maximum':4}),'assessor':enum('answer_key','human','ai_practice','unscored')})
D['ReviewState']=obj({'targetKey':ID,'schedulerVersion':{'const':2},'step':{'type':'integer','minimum':0,'maximum':5},'dueAt':I,'lastAttemptAt':nullable(I),'lastExposureAt':nullable(I),'lastColdAt':nullable(I),'firstColdAt':nullable(I),'lastSessionId':nullable(ID),'lastOutcome':nullable(enum('correct','incorrect','supported','exposure')),'coldCorrect':I,'coldTotal':I,'delayedCorrect':I,'delayedTotal':I,'transferSum':{'type':'number','minimum':0},'transferTotal':I,'consumedEventIds':arr(ID)})
D['Progress']=obj({'learnerId':ID,'objectiveId':ID,'skill':enum('visual','listening','speaking','reading','writing'),'status':enum('introduced','practising','demonstrated','needs_review','not_assessed'),'evidenceAttemptIds':arr(ID),'policyVersion':ID,'assessedAt':nullable(I)})
D['Achievement']=obj({'id':ID,'objectiveId':ID,'name':S,'evidenceAttemptIds':arr(ID,1),'earnedAt':I})
D['Collection']=obj({'id':ID,'learnerId':ID,'title':S,'contentVersionIds':arr(ID)})
D['Subscription']=obj({'id':ID,'adultUserId':ID,'status':enum('inactive','active','cancelled'),'externalCustomerKey':nullable(S),'entitlements':arr(S)})
D['AIInteraction']=obj({'id':ID,'learnerId':ID,'purpose':enum('tutor','draft_lesson','review_assist','pronunciation','conversation','writing','listening'),'modelPolicyVersion':ID,'contentVersionIds':arr(ID),'outcome':enum('completed','abstained','failed'),'occurredAt':I,'expiresAt':I})
D['Source']=obj({'id':ID,'title':S,'locator':S,'rights':S,'attribution':S})
schema={'$schema':'https://json-schema.org/draft/2020-12/schema','$id':'urn:tigrinya:platform:1','title':'Language platform exchange contracts','$defs':D,'description':'Validate an entity against its named $defs entry; semantic release checks remain mandatory.'}
base.joinpath('schemas/platform.schema.json').write_text(json.dumps(schema,ensure_ascii=False,indent=2)+'\n')
examples={
 'LanguagePack':{'id':'ti','languageTag':'ti','script':'Ethi','direction':'ltr','scriptModel':'abugida','normalisation':'NFC','segmentationAdapter':'fidal-graphemes-v1','searchAdapter':'fidal-search-v1','answerAdapter':'reviewed-variants-v1','fontFamilies':['Noto Sans Ethiopic','Kefa'],'contentReleaseId':None},
 'Learner':{'id':'example-local','tenantId':'device','ownerUserId':None,'ageBand':'unspecified','presentation':'child','languageTag':'ti','path':'general','storageMode':'memory'},
 'Form':{'script':'በ','familyId':'b-family','order':1,'audioVersionId':None,'strokeVersionId':None,'sourceIds':['existing-fidal-review-record']},
 'Subscription':{'id':'example-inactive','adultUserId':'example-adult','status':'inactive','externalCustomerKey':None,'entitlements':[]},
 'AIInteraction':{'id':'example-abstention','learnerId':'example-local','purpose':'tutor','modelPolicyVersion':'disabled-v1','contentVersionIds':[],'outcome':'abstained','occurredAt':0,'expiresAt':0}
}
base.joinpath('examples/contracts.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2)+'\n')
