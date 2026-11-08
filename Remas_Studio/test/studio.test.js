import assert from 'node:assert/strict';
import test from 'node:test';
import {paintingResults,quizResults} from '../public/scoring.js';
import {paintings,questions} from '../public/content.js';
import {createHandler} from '../server/worker.js';

test('taste scores use the correct end of the scene comparison',()=>{
  const reactions = Object.fromEntries(paintings.map(art=>[art.id,'curious']));
  const match = paintingResults(reactions,[1,1,0])[0];
  assert.equal(match.art.id,'surrealism');
  assert.ok(match.evidence.includes('a dreamlike scene'));
  const grounded = paintingResults(reactions,[1,0,0]);
  assert.equal(grounded[0].art.id,'realism');
  assert.ok(grounded[0].evidence.includes('a believable scene'));
});

test('quiz can distinguish the oil look from the acrylic setup',()=>{
  const result = quizResults([2,0,2,0,1,3]);
  assert.equal(result.look,'oils');
  assert.equal(result.easy,'acrylic');
  assert.equal(result.setupNear,'gouache');
});

test('every combination of completed quiz answers produces finite scores',()=>{
  function walk(answers) {
    if (answers.length===questions.length) {
      const result=quizResults(answers);
      assert.ok(result.scores.every(score=>Number.isFinite(score.look) && Number.isFinite(score.setup)));
      assert.ok(result.look && result.easy);
      return;
    }
    questions[answers.length].options.forEach((_,i)=>walk([...answers,i]));
  }
  walk([]);
});

const url = 'https://studio.test/api/chat';
const question = {role:'user',content:'How do I mix a shadow?'};
function post(input,headers={}) {
  return new Request(url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(input)});
}
test('chat has a clear unavailable response without a server credential',async()=>{
  const handle = createHandler(()=>null);
  assert.deepEqual(await (await handle(new Request(url))).json(),{available:false});
  assert.equal((await handle(post({messages:[question]}))).status,503);
});
test('configured chat sends context and key only to the model backend',async()=>{
  const handle = createHandler(()=>null,async (target,params)=>{
    assert.equal(new URL(target).hostname,'generativelanguage.googleapis.com');
    assert.equal(params.headers['x-goog-api-key'],'test-key');
    const body=JSON.parse(params.body);
    assert.equal(body.contents[0].parts[0].text,question.content);
    assert.match(body.systemInstruction.parts[0].text,/easiest medium: Gouache/);
    assert.match(body.systemInstruction.parts[0].text,/favorite styles: Impressionism/);
    assert.doesNotMatch(body.systemInstruction.parts[0].text,/reject this/);
    return Response.json({candidates:[{content:{parts:[{text:'Hidden.',thought:true},{text:'Start with a dab of your petal color.'}]}}]});
  });
  const result=await handle(post({messages:[question],context:{medium:'Gouache',styles:['Impressionism','reject this']}}),{GEMINI_API_KEY:'test-key'});
  assert.deepEqual(await result.json(),{reply:'Start with a dab of your petal color.'});
});
test('chat blocks cross-origin posts and maps a temporary model failure',async()=>{
  const handle=createHandler(()=>null,async ()=>new Response('',{status:429}));
  const env={GEMINI_API_KEY:'test-key'};
  assert.equal((await handle(post({messages:[question]},{Origin:'https://other.test'}),env)).status,403);
  assert.equal((await handle(post({messages:[question]}),env)).status,503);
});
test('Groq is selected when configured and keeps its key server-side',async()=>{
  const prior = {role:'assistant',content:'Try a small study first.'};
  const handle = createHandler(()=>null,async (target,params)=>{
    assert.equal(target,'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(params.headers.Authorization,'Bearer test-groq-key');
    const body=JSON.parse(params.body);
    assert.equal(body.model,'qwen/qwen3.8-27b');
    assert.match(body.messages[0].content,/easiest medium: Gouache/);
    assert.deepEqual(body.messages.slice(1),[prior,question]);
    return Response.json({choices:[{message:{content:'Mix a little blue into your petal color.',reasoning:'Hidden'}}]});
  });
  const env={GROQ_API_KEY:'test-groq-key',GEMINI_API_KEY:'test-gemini-key'};
  assert.deepEqual(await (await handle(new Request(url),env)).json(),{available:true});
  const response=await handle(post({messages:[prior,question],context:{medium:'Gouache'}}),env);
  assert.deepEqual(await response.json(),{reply:'Mix a little blue into your petal color.'});
});
