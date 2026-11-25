// Isolated storage-contract check. Never reads app environment files or connects
// to an existing database. Requires the repository's installed Node dependencies.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import EmbeddedPostgres from 'embedded-postgres';

const root = new URL('../../../', import.meta.url);
const port = await new Promise((resolve, reject) => {
 const socket = createServer();
 socket.on('error', reject);
 socket.listen(0, '127.0.0.1', () => {
  const port = socket.address().port;
  socket.close(() => resolve(port));
 });
});
const directory = await mkdtemp(join(process.platform === 'darwin' ? '/private/tmp' : tmpdir(), 'tigrinya-db-'));
const password = randomBytes(24).toString('hex');
const postgres = new EmbeddedPostgres({
 databaseDir: directory, user: 'design_test', password, port,
 persistent: false, createPostgresUser: false, autoRehydrateSymlinks: true,
 authMethod: 'scram-sha-256', postgresFlags: ['-h', '127.0.0.1', '-k', directory],
 initdbFlags: ['--encoding=UTF8', '--locale=C'],
 onLog: () => {}, onError: () => {},
});
let client;
let checks = 0;
async function insert(table, fields) {
 const entries = Object.entries(fields);
 const columns = entries.map(([name]) => `"${name}"`).join(',');
 const placeholders = entries.map((_, i) => `$${i + 1}`).join(',');
 await client.query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, entries.map(([, value]) => value));
}
async function rejects(action, code) {
 try { await action(); } catch (error) {
  assert.equal(error.code, code); checks++; return;
 }
 throw Error('Expected database constraint rejection');
}
const digest = 'a'.repeat(64);
try {
 await postgres.initialise();
 await postgres.start();
 await postgres.createDatabase('isolated_design');
 client = postgres.getPgClient('isolated_design', '127.0.0.1');
 await client.connect();
 // Use real existing migrations, not a hand-written stand-in schema.
 const baseSql = await readFile(new URL('infrastructure/database/migrations.sql', root), 'utf8');
 await client.query(baseSql.replace(/^\uFEFF/, ''));
 await client.query(await readFile(new URL('docs/production/schema.sql', root), 'utf8'));
 const tables = await client.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'production'");
 assert.equal(tables.rows[0].n, 25); checks++;

 const target = randomUUID(), version = randomUUID(), learner = randomUUID(), otherLearner = randomUUID();
 const speaker = randomUUID(), otherSpeaker = randomUUID(), rights = randomUUID(), variety = randomUUID();
 const recording = randomUUID(), release = randomUUID(), consent = randomUUID(), speech = randomUUID(), device = randomUUID();
 await insert('public."Languages"', {Tag:'ti',Name:'Schema test only',Script:'Ethiopic',Direction:'ltr',ScriptModel:'abugida'});
 await insert('public."Content"', {Id:target,LanguageTag:'ti',Kind:'Word',Title:'Storage fixture only',PublishedTitle:'',AuthorSubject:'synthetic-author',State:'Draft',Revision:1,PublishedRevision:null,ConcurrencyStamp:randomUUID(),Payload:'{}',PayloadHash:digest,UpdatedAt:0});
 await insert('public."VersionHistory"', {Id:version,ContentItemId:target,Revision:1,Title:'Storage fixture only',Payload:'{}',PayloadHash:digest,AuthorSubject:'synthetic-author',CreatedAt:0});
 for (const id of [learner,otherLearner]) await insert('public."Learners"', {Id:id,Subject:id,Presentation:'test',LanguageTag:'ti',Goal:'test',AnalyticsConsent:false,IsChild:false,UpdatedAt:0});
 await insert('production.variety', {id:variety,language_tag:'ti',reviewed_name:'Synthetic storage fixture',provenance:{fixture:true},approval_version_id:version});
 await rejects(() => client.query('UPDATE production.variety SET language_tag = $1 WHERE id = $2',['am',variety]), '23514');
 for (const id of [speaker,otherSpeaker]) await insert('production.speaker', {id,contributor_subject:'synthetic',display_name:'Fixture',adult_attested_at:new Date(),public_metadata:{}});
 const start = new Date(), tomorrow = new Date(start.valueOf()+86400000);
 await insert('production.rights_grant', {id:rights,speaker_id:speaker,evidence_digest:digest,permitted_uses:JSON.stringify(['fixture']),granted_at:start,expires_at:tomorrow});
 await insert('production.recording', {id:recording,target_version_id:version,variety_id:variety,speaker_id:speaker,rights_id:rights,author_subject:'synthetic',transcript:'Storage fixture; not language teaching',mode:'normal',original_sha256:digest,approval_digest:digest,private_master_key:'test-only',revision:1,state:'review',created_at:start});
 await rejects(() => client.query('UPDATE production.recording SET speaker_id = $1 WHERE id = $2',[otherSpeaker,recording]), '23503');
 await rejects(() => client.query('UPDATE production.recording SET original_sha256 = $1 WHERE id = $2',['invalid',recording]), '23514');
 const releaseFields={recording_id:recording,approval_digest:digest,manifest_sha256:digest,manifest_key:'test-only',released_at:start,lease_expires_at:tomorrow};
 // Storage fixture bypasses application publication; it makes no approval claim.
 await insert('production.recording_release',{id:release,...releaseFields});
 await rejects(() => insert('production.recording_release',{id:randomUUID(),...releaseFields,manifest_sha256:'b'.repeat(64)}),'23505');
 await insert('production.consent_receipt',{id:consent,learner_id:learner,purpose:'fixture',policy_version:'fixture',verification_evidence_digest:digest,granted_at:start,expires_at:tomorrow});
 await insert('production.speech_submission',{id:speech,learner_id:learner,consent_id:consent,target_release_id:release,private_object_key:'test-only-private',sha256:digest,duration_ms:8000,state:'uploading',created_at:start,expires_at:tomorrow});
 await rejects(() => client.query('UPDATE production.speech_submission SET learner_id=$1 WHERE id=$2',[otherLearner,speech]),'23503');
 await rejects(() => client.query('UPDATE production.speech_submission SET duration_ms=8001 WHERE id=$1',[speech]),'23514');
 await rejects(() => client.query("UPDATE production.speech_submission SET expires_at=created_at+interval '25 hours' WHERE id=$1",[speech]),'23514');
 const evaluation={id:randomUUID(),submission_id:speech,source:'none',engine_version:'fixture',outcome:'not_assessed',reason_code:'unsupported',confidence:null,feedback_version_ids:[],evaluated_at:start};
 await insert('production.evaluation',evaluation);
 await rejects(() => client.query('UPDATE production.evaluation SET confidence=0.9 WHERE id=$1',[evaluation.id]),'23514');
 await rejects(() => client.query("UPDATE production.evaluation SET source='qualified_human' WHERE id=$1",[evaluation.id]),'23514');
 await rejects(() => client.query("UPDATE production.evaluation SET source='validated_model',outcome='correct',rubric_version_id=$1 WHERE id=$2",[version,evaluation.id]),'23514');
 await rejects(() => client.query("UPDATE production.evaluation SET source='validated_model',outcome='correct',rubric_version_id=$1,calibration_digest=$2 WHERE id=$3",[version,digest,evaluation.id]),'23514');
 await insert('production.device',{id:device,learner_id:learner,public_key:{fixture:true},enrolled_at:start});
 const event={event_id:randomUUID(),learner_id:learner,device_id:device,stream_id:randomUUID(),sequence:1,payload_digest:digest,event_type:'exposure',canonical_event:{fixture:true},received_at:start,receipt_state:'provisional',receipt:{fixture:true}};
 await insert('production.sync_event',event);
 await rejects(() => insert('production.sync_event',event),'23505');
 await rejects(() => insert('production.sync_event',{...event,event_id:randomUUID(),sequence:2,learner_id:otherLearner}),'23503');
 await rejects(() => insert('production.outbox',{id:randomUUID(),business_key:'fixture',kind:'fixture',envelope:{},state:'leased',attempts:0,available_at:start,lease_until:null,created_at:start}),'23514');
 console.log(`PASS: PostgreSQL 16 actual base migrations, 25 proposed tables and ${checks} storage checks; no runtime authorization or native approval claimed.`);
} finally {
 if(client) await client.end();
 await postgres.stop();
 // Only this script's unique disposable directory is removed.
 await rm(directory,{recursive:true,force:true});
}
