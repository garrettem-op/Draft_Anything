'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {evaluate}=require('../tools/v2-research-gate.cjs');
const SHA='a'.repeat(40),OLD='b'.repeat(40);
function base(){
 return {
  pr:{state:'open',draft:false,changed_files:1,base:{ref:'develop/v2-option-c',repo:{full_name:'o/r'}},head:{sha:SHA,repo:{full_name:'o/r'}},user:{login:'github-actions[bot]'},labels:[{name:'v2-research-approved'}]},
  files:[{filename:'research/option-c/batches/dc-batch-02.json',status:'added'}],
  reviews:[{id:1,user:{login:'garrettem-op'},state:'APPROVED',commit_id:SHA,submitted_at:'2026-11-12T10:00:00Z'}],
  checkRuns:[{name:'validate-research',status:'completed',conclusion:'success'},{name:'research-merge-gate',status:'in_progress',conclusion:null}],
  combinedStatus:{state:'pending',total_count:0}
 };
}
test('eligible research-only PR with current-head independent approval',()=>{const r=evaluate(base());assert.equal(r.eligible,true,r.reasons.join());});
test('stale approval on an older commit is rejected',()=>{const s=base();s.reviews[0].commit_id=OLD;assert.match(evaluate(s).reasons.join(),/current head/);});
test('later COMMENTED review does not erase approval',()=>{const s=base();s.reviews.push({id:2,user:{login:'garrettem-op'},state:'COMMENTED',commit_id:SHA,submitted_at:'2026-11-12T11:00:00Z'});assert.equal(evaluate(s).eligible,true);});
test('CHANGES_REQUESTED from anyone blocks',()=>{const s=base();s.reviews.push({id:3,user:{login:'someone'},state:'CHANGES_REQUESTED',commit_id:SHA,submitted_at:'2026-11-12T11:00:00Z'});assert.match(evaluate(s).reasons.join(),/changes requested/);});
test('author and bot approvals do not count',()=>{const s=base();s.pr.user.login='garrettem-op';assert.match(evaluate(s).reasons.join(),/no independent/);const t=base();t.reviews[0].user.login='github-actions[bot]';assert.match(evaluate(t).reasons.join(),/no independent/);});
test('non-research files, deletions, drafts, forks and missing label are rejected',()=>{
 let s=base();s.files.push({filename:'.github/workflows/x.yml',status:'modified'});s.pr.changed_files=2;assert.match(evaluate(s).reasons.join(),/outside research/);
 s=base();s.files[0].status='removed';assert.match(evaluate(s).reasons.join(),/outside research/);
 s=base();s.pr.draft=true;assert.equal(evaluate(s).eligible,false);
 s=base();s.pr.head.repo.full_name='x/r';assert.match(evaluate(s).reasons.join(),/fork/);
 s=base();s.pr.labels=[];assert.match(evaluate(s).reasons.join(),/label/);
 s=base();s.pr.changed_files=2;assert.match(evaluate(s).reasons.join(),/incomplete/);
});
test('running checks are waitable, failing checks are not',()=>{
 let s=base();s.checkRuns.push({name:'box-scores',status:'in_progress',conclusion:null});let r=evaluate(s);assert.equal(r.eligible,false);assert.equal(r.pending,true);
 s=base();s.checkRuns.push({name:'box-scores',status:'completed',conclusion:'failure'});r=evaluate(s);assert.equal(r.pending,false);assert.match(r.reasons.join(),/not green/);
 s=base();s.checkRuns=[{name:'research-merge-gate',status:'in_progress'}];assert.match(evaluate(s).reasons.join(),/has not run/);
 s=base();s.pr.labels=[];s.checkRuns.push({name:'box-scores',status:'queued'});assert.equal(evaluate(s).pending,false);
});
