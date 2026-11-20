"""Check specification references, contract examples, graph and relational constraints.

The JSON check implements only this repository's used structural subset, not full
JSON Schema conformance. Production authoring CI also needs a standard validator.
"""
from pathlib import Path
import copy
import json
import math
import re
import sqlite3

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/product'
schema=json.loads((BASE/'schemas/platform.schema.json').read_text())
defs=schema['$defs']

def validate(value,rule):
    if '$ref' in rule:
        assert rule['$ref'].startswith('#/$defs/')
        return validate(value,defs[rule['$ref'].split('/')[-1]])
    if 'anyOf' in rule:
        for branch in rule['anyOf']:
            try:
                validate(value,branch)
                return
            except ValueError:
                pass
        raise ValueError('No matching alternative')
    kind=rule.get('type')
    types={'object':lambda x:isinstance(x,dict),'array':lambda x:isinstance(x,list),'string':lambda x:isinstance(x,str),'integer':lambda x:isinstance(x,int) and not isinstance(x,bool),'number':lambda x:isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x),'boolean':lambda x:isinstance(x,bool),'null':lambda x:x is None}
    if kind and not types[kind](value):raise ValueError('Wrong type: '+kind)
    if 'const' in rule and value!=rule['const']:raise ValueError('Wrong constant')
    if 'enum' in rule and value not in rule['enum']:raise ValueError('Not an allowed value')
    if isinstance(value,str):
        if len(value)<rule.get('minLength',0):raise ValueError('Too short')
        if 'pattern' in rule and not re.search(rule['pattern'],value):raise ValueError('Pattern mismatch')
    if kind in ['integer','number']:
        if value<rule.get('minimum',-math.inf) or value>rule.get('maximum',math.inf):raise ValueError('Out of range')
    if isinstance(value,dict):
        if any(name not in value for name in rule.get('required',[])):raise ValueError('Missing field')
        if rule.get('additionalProperties') is False and set(value)-set(rule.get('properties',{})):raise ValueError('Unexpected field')
        for name,child in rule.get('properties',{}).items():
            if name in value:validate(value[name],child)
    if isinstance(value,list):
        if len(value)<rule.get('minItems',0):raise ValueError('Too few items')
        for item in value:validate(item,rule.get('items',{}))

def validate_named(name,value):
    validate(value,defs[name])
    if name=='ContentVersion':
        names={'word':'Word','phrase':'Phrase','sentence':'Sentence','form':'Form','grammar':'Grammar','story':'Story','dialogue':'Dialogue','lesson':'Lesson','audio':'Audio','image':'Image','video':'Video','assessment':'Assessment','culture':'Culture'}
        validate(value['payload'],defs[names[value['kind']]])

def must_reject(run):
    try:run()
    except (ValueError,sqlite3.IntegrityError):return
    raise AssertionError('Expected rejection')

def check_schema_refs(value):
    if isinstance(value,dict):
        if '$ref' in value:assert value['$ref'].split('/')[-1] in defs
        if value.get('type')=='object' and 'properties' in value:assert set(value.get('required',[]))<=set(value['properties'])
        for child in value.values():check_schema_refs(child)
    if isinstance(value,list):
        for child in value:check_schema_refs(child)

check_schema_refs(schema)
examples=json.loads((BASE/'examples/contracts.json').read_text())
for name,value in examples.items():validate_named(name,value)
bad=copy.deepcopy(examples['Learner']);bad['storageMode']='automatic_upload';must_reject(lambda:validate_named('Learner',bad))
bad=copy.deepcopy(examples['Learner']);bad['fullBirthDate']='2020-01-01';must_reject(lambda:validate_named('Learner',bad))
bad=copy.deepcopy(examples['Form']);bad['order']=True;must_reject(lambda:validate_named('Form',bad))
media={'assetType':'image','path':'../secret.png','sha256':'a'*64,'rightsSourceId':'source','altText':'Synthetic contract fixture'}
must_reject(lambda:validate_named('Image',media))
media['path']='images/example.png';validate_named('Image',media)
print(f'PASS: {len(defs)} schema definitions, all local references, {len(examples)} examples and invalid-record guards')

course=json.loads((BASE/'curriculum.json').read_text())
assert course['status']=='specification' and course['teachingContentGenerated'] is False
assert len(course['stages'])==7
ids=set();lesson_ids=set();lessons=[];previous=None;units_count=0;module_count=0
for stage in course['stages']:
    assert len(stage['units'])==4
    for unit in stage['units']:
        units_count+=1
        assert unit['id'] not in ids;ids.add(unit['id'])
        assert unit['defaultRouteAfter']==previous;previous=unit['id']
        assert len(unit['modules'])==2
        for module in unit['modules']:
            module_count+=1
            assert module['id'] not in ids;ids.add(module['id'])
            assert len(module['lessons'])==4
            for lesson in module['lessons']:
                assert lesson['id'] not in ids;ids.add(lesson['id']);lesson_ids.add(lesson['id'])
                assert lesson['status']=='blocked_content' and lesson['contentVersionIds']==[]
                assert lesson['evidence']['proficiencyClaim'] is False
                assert {'language','teaching','rights','accessibility'}<=set(lesson['requiredScopes'])
                assert 'audio' not in lesson['targetKinds'] or 'audio' in lesson['requiredScopes']
                lessons.append(lesson)
graph={lesson['id']:lesson['prerequisites'] for lesson in lessons}
visited=set();active=set()
def visit(key):
    if key in visited:return
    assert key not in active,'Curriculum cycle'
    active.add(key)
    for dependency in graph[key]:
        assert dependency in lesson_ids,'Unknown prerequisite'
        visit(dependency)
    active.remove(key);visited.add(key)
for key in graph:visit(key)
for source in course['sourceMap']:assert (ROOT/source['path']).is_file()
assert units_count==28 and module_count==56 and len(lessons)==224
print('PASS: 7 stages, 28 units, 56 modules, 224 blocked authoring assignments; unique IDs, sources and acyclic prerequisites')

con=sqlite3.connect(':memory:')
con.executescript((BASE/'schema.sql').read_text())
con.execute("INSERT INTO tenants VALUES ('t','Synthetic test tenant')")
for name,role in [('author','author'),('reviewer','reviewer')]:con.execute('INSERT INTO users VALUES (?,?,?,NULL)',(name,'t',role))
con.execute("INSERT INTO languages VALUES ('ti','Ethi','ltr','{}')")
con.execute("INSERT INTO learners VALUES ('learner','t',NULL,'unspecified','child',0)")
con.execute("INSERT INTO content VALUES ('content','ti','example','form')")
con.execute("INSERT INTO content_versions VALUES ('v1','content',1,'draft','author','{}',?,0)",('a'*64,))
con.execute("INSERT INTO forms VALUES ('v1','በ','b',1)")
con.execute("INSERT INTO reviewers VALUES ('r','reviewer','[\"ti\"]','[\"language\"]','Synthetic test qualification')")
con.execute("INSERT INTO reviewers VALUES ('self','author','[\"ti\"]','[\"language\"]','Synthetic test qualification')")
con.execute("INSERT INTO releases VALUES ('release','ti','candidate','policy-v1',0)")
must_reject(lambda:con.execute("INSERT INTO release_items VALUES ('release','v1')"))
must_reject(lambda:con.execute("INSERT INTO words VALUES ('v1','x','sense','meaning','lexeme',NULL,NULL)"))
must_reject(lambda:con.execute("UPDATE content_versions SET payload_json='{\"changed\":true}' WHERE id='v1'"))
must_reject(lambda:con.execute("INSERT INTO approvals VALUES ('a1','v1','self','language','approved',?,'test',0)",('a'*64,)))
must_reject(lambda:con.execute("INSERT INTO approvals VALUES ('a2','v1','r','language','approved',?,'test',0)",('b'*64,)))
con.execute("INSERT INTO approvals VALUES ('a3','v1','r','language','approved',?,'Synthetic test only',0)",('a'*64,))
must_reject(lambda:con.execute("INSERT INTO collection_items VALUES ('missing','v1')"))
con.execute("INSERT INTO attempts VALUES ('event','t','learner','v1',NULL,'visual','session','supported','[]',1,0,NULL,NULL)")
must_reject(lambda:con.execute("INSERT INTO attempts VALUES ('event','t','learner','v1',NULL,'visual','session','supported','[]',1,0,NULL,NULL)"))
con.execute("INSERT INTO tenants VALUES ('other','Other test tenant')")
must_reject(lambda:con.execute("INSERT INTO attempts VALUES ('cross','other','learner','v1',NULL,'visual','session','supported','[]',1,0,NULL,NULL)"))
assert not con.execute('PRAGMA foreign_key_check').fetchall()
tables=con.execute("SELECT count(*) FROM sqlite_master WHERE type='table'").fetchone()[0]
con.close()
print(f'PASS: {tables} relational tables; foreign keys, wrong kinds, version immutability, approval hash/independence, release gate, event deduplication and tenant guards')

for path in BASE.glob('*.md'):
    text=path.read_text()
    for target in re.findall(r'\]\(([^)]+)\)',text):
        if '://' in target or target.startswith('#'):continue
        assert (path.parent/target.split('#')[0]).exists(),(path,target)
assert len(re.findall(r'^\| (?:[1-9]|1[0-7]) ',(BASE/'README.md').read_text(),re.M))==17
print('PASS: all 17 phase references and local documentation links')
