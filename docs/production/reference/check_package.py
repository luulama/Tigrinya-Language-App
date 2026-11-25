"""Local structural checks, not full OpenAPI/JSON Schema conformance."""
import hashlib
import json
import math
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit
from uuid import UUID

BASE = Path(__file__).resolve().parents[1]
ROOT = BASE.parents[1]
GROUPS = {'audio','media','speech','placement','review','analytics','parents','privacy',
          'scenarios','offline','governance','culture','accessibility','security','operations','economics','delivery'}


class SpecError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise SpecError(message)


def anchor(text):
    return re.sub(r'[^\w\s-]', '', text.lower()).replace(' ', '-')


def link_exists(source, destination):
    parsed = urlsplit(destination)
    if parsed.scheme or parsed.netloc:
        require(parsed.scheme in ('https', 'mailto'), 'Unexpected external scheme')
        return
    target = (source.parent / unquote(parsed.path)).resolve() if parsed.path else source
    require(target == ROOT or ROOT in target.parents, 'Link escapes repository')
    require(target.exists(), f'Missing link: {source.name} -> {destination}')
    if parsed.fragment:
        require(target.suffix == '.md', 'Unexpected anchor target')
        headings = re.findall(r'^#{1,6} (.+)$', target.read_text(), re.M)
        require(unquote(parsed.fragment) in {anchor(h) for h in headings}, f'Missing anchor: {destination}')


def check_register(register):
    require(register['status'] == 'proposed-not-implemented-or-approved', 'Status overclaims approval')
    require([s['number'] for s in register['sections']] == list(range(1, 21)), 'Twenty ordered deliverables required')
    for section in register['sections']:
        link_exists(BASE / 'requirements.json', section['location'])
    requirements = register['requirements']
    require(len({r['id'] for r in requirements}) == len(requirements), 'Duplicate requirement')
    require({r['group'] for r in requirements} == GROUPS, 'Missing capability group')
    for item in requirements:
        require(item['status'] == 'specified', 'Specification is not implementation evidence')
        require(item['phase'] in ('MVP','V2','V3'), 'Unknown phase')
        require(item['acceptance'] and all(len(x) >= 20 for x in item['acceptance']), 'Missing concrete acceptance')
        link_exists(BASE / 'requirements.json', item['location'])
    vision = ROOT / 'Product-Bible/01-Vision.md'
    require(hashlib.sha256(vision.read_bytes()).hexdigest() == register['visionSha256'], 'Locked vision differs from inspected baseline')


def check_api(api):
    require(api['openapi'] == '3.1.0', 'Unexpected contract version')
    require(api['servers'] == [{'url':'/'}], 'Do not invent a backend URL')
    schemas = api['components']['schemas']
    def walk(value):
        if isinstance(value, dict):
            if '$ref' in value:
                require(value['$ref'].startswith('#/components/'), 'Unexpected contract reference')
                resolved = api
                for segment in value['$ref'][2:].split('/'):
                    require(segment in resolved, 'Unresolved contract reference')
                    resolved = resolved[segment]
            if value.get('type') == 'object':
                require(value.get('additionalProperties') is False, 'Object permits unbounded payload')
                require(set(value.get('required', [])) <= set(value.get('properties', {})), 'Invalid required field')
            for child in value.values():
                walk(child)
        if isinstance(value, list):
            for child in value:
                walk(child)
    walk(api)
    ids = []
    for path, methods in api['paths'].items():
        require(path.startswith('/api/v1/'), 'Existing endpoints must remain intact')
        for method, op in methods.items():
            require(method in ('get','post','put','delete'), 'Unknown operation')
            ids.append(op['operationId'])
            require(op['x-required-capability'], 'Missing capability policy')
            require(any(code.startswith('2') for code in op['responses']), 'No success response')
            parameters = {p['name']:p for p in op['parameters']}
            for name in re.findall(r'\{(\w+)\}', path):
                require(parameters[name]['in'] == 'path' and parameters[name]['required'], 'Missing path parameter')
            if method != 'get':
                require(parameters['Idempotency-Key']['required'], 'Mutation lacks idempotency')
    require(len(ids) == len(set(ids)), 'Duplicate operation ID')
    return len(ids), len(schemas)


def validate(value, rule, schemas):
    """Only the explicitly used subset; full conformance remains an adoption gate."""
    if '$ref' in rule:
        return validate(value, schemas[rule['$ref'].split('/')[-1]], schemas)
    for alternative in ('oneOf','anyOf'):
        if alternative in rule:
            successes = 0
            for child in rule[alternative]:
                try:
                    validate(value, child, schemas)
                    successes += 1
                except SpecError:
                    pass
            require(successes == 1 if alternative == 'oneOf' else successes >= 1, 'Invalid alternative')
            return
    kinds = {'object': lambda x:isinstance(x,dict), 'array':lambda x:isinstance(x,list),
             'string':lambda x:isinstance(x,str), 'boolean':lambda x:isinstance(x,bool),
             'null':lambda x:x is None, 'integer':lambda x:isinstance(x,int) and not isinstance(x,bool),
             'number':lambda x:isinstance(x,(float,int)) and not isinstance(x,bool) and math.isfinite(x)}
    if 'type' in rule:
        require(kinds[rule['type']](value), 'Wrong type')
    if 'const' in rule:
        require(value == rule['const'], 'Wrong constant')
    if 'enum' in rule:
        require(value in rule['enum'], 'Wrong enum')
    if isinstance(value, dict):
        require(set(rule.get('required', [])) <= set(value), 'Missing property')
        properties = rule.get('properties', {})
        if rule.get('additionalProperties') is False:
            require(set(value) <= set(properties), 'Unexpected property')
        for key, child in value.items():
            validate(child, properties[key], schemas)
    if isinstance(value, list):
        require(rule.get('minItems', 0) <= len(value) <= rule.get('maxItems', math.inf), 'Array bound')
        if rule.get('uniqueItems'):
            require(len({json.dumps(x, sort_keys=True) for x in value}) == len(value), 'Duplicate item')
        for child in value:
            validate(child, rule['items'], schemas)
    if isinstance(value, str):
        require(rule.get('minLength', 0) <= len(value) <= rule.get('maxLength', math.inf), 'String bound')
        if 'pattern' in rule:
            require(re.search(rule['pattern'], value), 'Pattern mismatch')
        if rule.get('format') == 'uuid':
            try:
                UUID(value)
            except ValueError as error:
                raise SpecError('Invalid UUID') from error
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        require(rule.get('minimum', -math.inf) <= value <= rule.get('maximum', math.inf), 'Numeric bound')


def main():
    register = json.loads((BASE / 'requirements.json').read_text())
    check_register(register)
    operations, schemas = check_api(json.loads((BASE / 'openapi.json').read_text()))
    for source in BASE.rglob('*.md'):
        for destination in re.findall(r'\[[^\]]+\]\(([^)]+)\)', source.read_text()):
            link_exists(source, destination)
    for source in BASE.rglob('*.json'):
        json.loads(source.read_text())
    for source in BASE.rglob('*.py'):
        compile(source.read_text(), str(source), 'exec')
    print(f'PASS: 20 deliverables, {len(register["requirements"])} capability requirements, {operations} API operations, {schemas} schemas, local links, JSON/Python syntax and locked vision digest.')


if __name__ == '__main__':
    main()
