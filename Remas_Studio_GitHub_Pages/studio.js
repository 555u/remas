import {paintings, comparisons, paints, questions, colorNames, mixingNotes} from './content.js';
import {paintingResults, quizResults, setupReason} from './scoring.js';

const main = document.querySelector('#main');
const nav = document.querySelector('#nav');
const key = 'remas-studio-v1';
const icons = {
  studio:'<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/>',
  gallery:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  quiz:'<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  chat:'<path d="M20 11a7.5 7.5 0 0 1-7.8 7.5H5l1.5-3A7.1 7.1 0 0 1 4 11a8 8 0 0 1 16 0Z"/><path d="M8 11h.01m4 0h.01m4 0h.01"/>',
  book:'<path d="M6 4h12a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 12h13M8 8h7m-7 3h5"/>',
  next:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back:'<path d="M20 12H5m6-6-6 6 6 6"/>',
  heart:'<path d="M12 20s-8-4.4-8-10a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.6-8 10-8 10Z"/>',
  star:'<path d="M12 3c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9Z"/>',
  palette:'<path d="M12 4a8 8 0 1 0 0 16h1a1.5 1.5 0 0 0 1-2.6c-.7-.7-.2-1.8.8-1.8h2A3 3 0 0 0 20 12a8 8 0 0 0-8-8Z"/><path d="M7.5 12h.01m2-4h.01m4 0h.01m3.3 3h.01"/>',
  brush:'<path d="m10 14 7-9c1.4-1.7 3.7.2 2.1 2l-7 9m-2-2c-3.5-.4-4.2 2.2-4.4 3.6-.2 1.1-1.4 1.8-1.4 1.8 5 .9 8.5-.4 7.8-3.4Z"/>',
  date:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  check:'<path d="m5 12 4 4 10-10"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ''}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artUrl = id => `./art/${id}.webp`;
const artById = id => paintings.find(art => art.id === id) ?? paintings[0];
const joined = list => new Intl.ListFormat('en', {style:'long', type:'conjunction'}).format(list);
const initial = {
  reactions:{}, choices:[], galleryAt:0, comparisonAt:0, galleryDone:false,
  answers:[], quizAt:0, quizDone:false, wash:45, favorites:[], palettes:[], notes:[],
  pearMedium:'', pearPick:null, plan:null
};
let state = initial;
try { state = {...initial, ...JSON.parse(localStorage.getItem(key))}; } catch {}
let storageOkay = true;
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); }
  catch { storageOkay = false; }
}
let page;
let paletteArt = paintings[0].id;
let paletteColors = [];
let touchStart = null;

const completeReactions = () => paintings.every(art => Boolean(state.reactions[art.id]));
const currentQuiz = () => state.quizDone && questions.every((q,i) => Boolean(q.options[state.answers[i]])) ? quizResults(state.answers) : null;
const currentTaste = () => state.galleryDone && completeReactions() && comparisons.every((c,i) => c.options[state.choices[i]]) ? paintingResults(state.reactions, state.choices) : null;
const button = (label, action, cls = '', attr = '') => `<button type="button" class="button ${cls}" data-action="${action}" ${attr}>${label}</button>`;
const link = (label, to, cls='button') => `<a class="${cls}" href="#${to}">${label}</a>`;
const back = (to, label='Back to studio') => link(`${icon('back')} ${label}`, to, 'text-link');
const head = (label, title, sub='') => `<header class="section-head"><p class="kicker">${label}</p><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</header>`;
const meter = (label, position, total) => `<div class="meter"><div class="row progress-label"><span>${label}</span><span>${position} / ${total}</span></div><div class="progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${position}"><span style="width:${position/total*100}%"></span></div></div>`;
const artImage = (art, reveal=true, lazy=false) => `<img src="${artUrl(art.id)}" width="505" height="505" alt="${reveal ? art.name + ' study of moonlit roses by a window' : 'Moonlit roses by a window'}" ${lazy ? 'loading="lazy"' : ''}>`;
function artFrame(art, reveal=true, swipe=false) {
  const saved = state.favorites.includes(art.id);
  return `<div class="art-frame" ${swipe ? 'data-swipe' : ''}>${artImage(art,reveal)}<button type="button" class="icon-button favorite" aria-label="Favorite this painting" aria-pressed="${saved}" data-action="favorite" data-id="${art.id}">${icon('heart')}</button></div>`;
}
const deskLink = (to, glyph, name, description) => `<a class="desk-link" href="#${to}"><span class="desk-glyph">${icon(glyph)}</span><span><strong>${name}</strong><small>${description}</small></span>${icon('next')}</a>`;
function home() {
  return `<section class="hero" aria-labelledby="welcome"><img class="hero-art" src="${artUrl('hero')}" alt="Moonlit roses in a vase beside an arched studio window" fetchpriority="high" width="700" height="1050"><div class="hero-frame" aria-hidden="true"></div>
    <div class="hero-content"><p class="kicker">For Remas</p><h1 id="welcome">Welcome to<br>your studio.</h1><p class="intro">Let’s find the kind of painting that makes you want to pick up a brush.</p>
    <div class="actions">${link(`Find my painting style ${icon('next')}`,'gallery','button primary')}${link(`Help me choose my paints ${icon('quiz')}`,'quiz','button ghost')}</div>
    ${link(`${icon('chat')} Painting tips from Rashed`,'chat','text-link')}</div></section>
    <section class="section home-desk"><header class="section-head"><p class="kicker">At your worktable</p><h2>Make a little something.</h2></header>
    <div class="desk-links">${deskLink('try','brush','Try three ways','One pear, three ways to use your brush.')}${deskLink('palettes','palette','Palette drawer','Keep the colors you want to paint with.')}${deskLink('date','date','Painting date','Make a plan for the time you have.')}${deskLink('notebook','book','Studio notebook','Keep your favorites, results, and notes close.')}</div><p class="signoff">A little studio, just for you.</p></section>`;
}

function gallery() {
  const art = paintings[state.galleryAt] ?? paintings[0];
  const reaction = state.reactions[art.id];
  const canCompare = completeReactions();
  const index = paintings.indexOf(art);
  const reactionButtons = [['love','Love it','heart'],['curious','Curious','star'],['skip','Skip','next']].map(([value,label,glyph]) =>
    button(`${icon(glyph)} ${label}`,'react','',`data-value="${value}" aria-pressed="${reaction===value}"`)).join('');
  return `<section class="section">${head('The moonlit gallery','Find your painting style','Eight takes on the same flowers by the window. Go with what draws your eye.')}
    ${meter('Painting',index+1,paintings.length)}
    <div class="stack">
      ${artFrame(art,Boolean(reaction),true)}
      <div class="reactions" role="group" aria-label="React to this painting">${reactionButtons}</div>
      <div aria-live="polite" ${reaction ? '' : 'hidden'}>${reaction ? `<div class="paper detail"><p class="kicker">The approach</p><h2>${art.name}</h2><p>${art.detail}</p><div class="art-tools">${link(`${icon('palette')} Collect colors`,`palettes/${art.id}`,'text-link')}</div></div>` : ''}</div>
      <div class="row">${button(`${icon('back')} Previous`,'art-prev','',index===0?'disabled':'')}${button(`Next painting ${icon('next')}`,'art-next',reaction?'primary':'',index===paintings.length-1?'disabled':'')}</div>
      ${canCompare ? link('Compare what caught your eye','compare','button primary') : `<p class="gallery-guide">Swipe the painting or tap an arrow. Give all eight a reaction to unlock comparisons.</p>`}
      <div class="row">${link('View the whole gallery','collection','text-link')}${currentTaste() ? link('Saved results','taste-result','text-link') : ''}</div>
    </div></section>`;
}
function compare() {
  if (!completeReactions()) return gallery();
  const index = state.comparisonAt;
  const item = comparisons[index];
  const selected = state.choices[index];
  return `<section class="section">${head('A closer look','What catches your eye?','Look at one detail at a time and pick the one you’d rather keep looking at.')}
    ${meter('Comparison',index+1,comparisons.length)}
    <div class="stack"><h2>${item.question}</h2><div class="two-options" role="group" aria-label="${item.question}">${item.options.map((label,i)=>button(`<span class="comparison-image"><img class="${item.effects[i]}" src="${artUrl(item.examples[i])}" alt="" width="505" height="505"></span><span>${label}</span>`,'compare-pick','choice-card',`data-value="${i}" aria-pressed="${selected===i}"`)).join('')}</div>
    <div class="row">${button(`${icon('back')} Back`,'compare-back')}${button(index===comparisons.length-1?'See my two styles':'Next comparison','compare-next','primary',selected===undefined?'disabled':'')}</div>
    ${currentTaste() ? link('Back to my saved results','taste-result','text-link') : ''}</div></section>`;
}
function tasteEvidence(match) {
  const reaction = {love:'You loved this painting',curious:'You were curious about this painting',skip:'You skipped this painting on first look'}[match.reaction];
  if (!match.evidence.length) return `${reaction}. Try it for ${match.art.reason}.`;
  return `${reaction}, and you chose ${joined(match.evidence)} in the comparisons. Try it for ${match.art.reason}.`;
}
function tasteResult() {
  const matches = currentTaste();
  if (!matches) return compare();
  return `<section class="section">${head('Your gallery notes','Two styles to explore','Start with what drew you in. Try a small study of each and see how it feels to paint.')}
    <div class="stack">${matches.map((match,index)=>`<article class="panel result-card">${artFrame(match.art)}<p class="kicker">${index===0?'Explore first':'Explore next'}</p><h2>${match.art.name}</h2><p>${tasteEvidence(match)}</p><div class="exercise"><p class="kicker">A first painting</p><p>${match.art.exercise}</p></div></article>`).join('')}
    <div class="row">${link('Edit reactions','gallery','button')}${link('Edit comparisons','compare','button')}</div>
    ${link('Revisit all eight paintings','collection','button')}${link('Take this to Ask Rashed','chat','button primary')}<p class="gallery-guide">Your results are saved in the studio notebook.</p></div></section>`;
}
function tiles(list) {
  return `<div class="collection">${list.map(art=>`<a class="art-tile" href="#art/${art.id}">${artImage(art,true,true)}<span>${art.name} ${state.favorites.includes(art.id)?'♥':''}</span></a>`).join('')}</div>`;
}
function collection() {
  return `<section class="section">${head('All eight studies','The whole gallery','Revisit a painting, save it, or take a few colors to the palette drawer.')}${tiles(paintings)}${back('gallery','Back to style discovery')}</section>`;
}
function artPage(id) {
  const art = artById(id);
  return `<section class="section">${head('Moonlit roses',art.name)}<div class="stack">${artFrame(art)}<div class="paper"><p>${art.detail}</p><div class="exercise"><p class="kicker">A first painting</p><p>${art.exercise}</p></div></div>${link('Collect colors from this painting',`palettes/${art.id}`,'button primary')}${back('collection','Back to the whole gallery')}</div></section>`;
}


function quiz() {
  const index = state.quizAt;
  const item = questions[index];
  const answer = state.answers[index];
  const picked = item.options[answer];
  return `<section class="section">${head('The paint cabinet','What should I paint with first?','Six small choices about the way you want to paint. Each one comes with a tip.')}
    ${meter('Question',index+1,questions.length)}
    <h2 class="question">${item.title}</h2><div class="stack"><div class="stack" role="group" aria-label="${item.title}">${item.options.map((option,i)=>`<button type="button" class="answer" data-action="answer" data-value="${i}" aria-pressed="${answer===i}"><span class="radio" aria-hidden="true"></span><span>${option.label}</span>${option.swatch ? `<span class="swatch ${option.swatch}" aria-hidden="true"></span>` : ''}</button>`).join('')}</div>
    ${picked ? `<div class="paper detail" role="status"><p class="kicker">From the worktable</p><p>${picked.tip}</p></div>` : ''}
    <div class="row">${button(`${icon('back')} Back`,'quiz-back','',index===0?'disabled':'')}${button(index===questions.length-1?'See my paints':'Next question','quiz-next','primary',picked?'':'disabled')}</div>
    ${index===0 ? link('Try the watercolor wash lesson','wash','text-link') : ''}${currentQuiz() ? link('Open my saved results','quiz-result','text-link') : ''}</div></section>`;
}
function quizResult() {
  const result = currentQuiz();
  if (!result) return quiz();
  const {look,easy,lookNear,setupNear} = result;
  const first = questions[0].options[state.answers[0]].label.toLowerCase();
  const practice = questions[5].options[state.answers[5]].label.toLowerCase();
  const pair = lookNear ? [look,lookNear] : setupNear ? [easy,setupNear] : [];
  const distinct = pair.length && setupNear && lookNear && !(pair.includes(easy) && pair.includes(setupNear));
  return `<section class="section">${head('Your paint notes','The paints to try first','One result for the way you want the painting to look, and one for how you’ll work.')}
    <div class="stack">
    <article class="panel result-card"><p class="kicker">Best fit for the look you love</p><h2>${paints[look].name}</h2><p>You wanted your colors to ${first}, and chose to practice ${practice}. Your look score combines those picks with how you like to blend and fix a mark.</p>${lookNear?`<p>${paints[lookNear].name} also scored closely for the look.</p>`:''}</article>
    <article class="paper result-card"><p class="kicker">Easiest first medium for your setup</p><h2>${paints[easy].name}</h2><p>${setupReason(easy,state.answers)}</p>${setupNear?`<p>${paints[setupNear].name} also scored closely for your setup.</p>`:''}${look==='oils' && easy==='acrylic' ? '<p>Try heavy-body acrylic for a textured stroke you can make in a short session. Rinse the brush with water while the paint is wet.</p>' : ''}</article>
    ${pair.length ? `<article class="panel stack"><h3>Try them on the same flower</h3><p>Paint one petal in ${paints[pair[0]].name.toLowerCase()} and one in ${paints[pair[1]].name.toLowerCase()}. Use the same color and brush size. Compare how the edge forms and how easy it is to change.</p>${distinct?`<p>To check the setup scores, repeat the same test with ${paints[easy].name.toLowerCase()} and ${paints[setupNear].name.toLowerCase()}.</p>`:''}</article>` : ''}
    <article class="panel stack"><p class="kicker">Start with ${paints[easy].name}</p><h3>Set out a few things</h3><p>${paints[easy].supplies}</p><h3>A 15-minute painting</h3><p>${paints[easy].exercise}</p></article>
    <div class="row">${link('Edit my answers','quiz','button')}${link('Try three ways','try','button primary')}</div>
    ${link('Open the watercolor wash lesson','wash','text-link')}<p class="gallery-guide">Your results are saved in the studio notebook.</p></div></section>`;
}

function washLesson() {
  return `<section class="section">${head('A tiny studio lesson','Water changes the wash.','Imagine keeping the pigment the same and adding water. The paper starts to show through as the mix gets more diluted.')}
  <div class="panel"><svg class="wash-art" viewBox="0 0 330 140" role="img" aria-label="An illustration of a rose watercolor wash on ivory paper">
  <defs><filter id="wash-grain" x="-18%" y="-20%" width="136%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="3" seed="11" result="papergrain"/><feDisplacementMap in="SourceGraphic" in2="papergrain" scale="12" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur id="wash-blur" stdDeviation="1"/></filter><linearGradient id="pigment"><stop stop-color="#813056"/><stop offset=".43" stop-color="#b84e74"/><stop offset="1" stop-color="#c97c95" stop-opacity=".38"/></linearGradient></defs>
  <g id="wash-pigment" fill="url(#pigment)" filter="url(#wash-grain)"><path d="M38 86c-11-16-2-32 31-37 49-8 79-8 122-11 36-2 77-14 96 0 14 11 17 38 1 50-18 14-72 9-96 14-39 9-86 11-123 3-16-4-26-5-31-19Z"/><path d="M54 64c48-12 139-7 216-24l13 13c-35 17-127 21-217 28Z" opacity=".45"/><circle cx="308" cy="48" r="4" opacity=".45"/><circle cx="294" cy="98" r="3" opacity=".45"/></g></svg>
  <div class="wash-controls"><label for="wash">Water in the mix <output id="wash-value" for="wash"></output></label><input id="wash" type="range" min="0" max="100" value="${state.wash}" step="1"><div class="row">${button('− Less water','water-down')}${button('+ More water','water-up')}</div><p id="wash-tip" role="status"></p></div></div>
  ${back('quiz','Back to my quiz')}</section>`;
}
function syncWash() {
  const input = document.querySelector('#wash');
  if (!input) return;
  const amount = state.wash;
  input.value = amount;
  document.querySelector('#wash-value').textContent = ` · ${amount}%`;
  document.querySelector('#wash-pigment').setAttribute('opacity', String(0.97 - amount * 0.0075));
  document.querySelector('#wash-blur').setAttribute('stdDeviation', String(.45 + amount * .035));
  document.querySelector('#wash-tip').textContent = amount < 30 ? 'Strong pigment, with more defined edges.' : amount < 68 ? 'The color lightens and the edges soften.' : 'A pale tint. The ivory paper shows through.';
  main.querySelector('[data-action="water-down"]').disabled = amount===0;
  main.querySelector('[data-action="water-up"]').disabled = amount===100;
}

function palette(id) {
  const art = artById(id || paletteArt);
  const points = {
    realism:[[91,47],[23,44],[84,11]], impressionism:[[91,49],[25,43],[84,12]],
    expressionism:[[11,47],[30,49],[81,13]], abstract:[[11,49],[37,47],[82,17]],
    surrealism:[[91,47],[52,60],[81,24]], minimalism:[[83,54],[38,42],[88,11]],
    pop:[[81,46],[45,33],[81,15]], decorative:[[91,45],[42,55],[80,13]]
  }[art.id];
  return `<section class="section">${head('Colors worth keeping','Palette drawer','Pick the colors that make you want to mix something. Save them together in your notebook.')}
    <div class="stack"><div class="field"><label for="palette-art">Choose a painting</label><select id="palette-art">${paintings.map(item=>`<option value="${item.id}" ${item.id===art.id?'selected':''}>${item.name}</option>`).join('')}</select></div>
    <div class="art-frame">${artImage(art)}${points.map(([x,y],i)=>`<button type="button" class="palette-point" style="left:${x}%;top:${y}%;--sample:${art.colors[i]}" aria-label="Pick ${colorNames[i]}" aria-pressed="${paletteColors.includes(i)}" data-action="color" data-value="${i}"><span>${paletteColors.includes(i)?icon('check'):''}</span></button>`).join('')}</div>
    <div class="stack" role="group" aria-label="Colors in this painting">${art.colors.map((color,i)=>`<button type="button" class="color-pick" aria-pressed="${paletteColors.includes(i)}" data-action="color" data-value="${i}"><span class="swatch" style="background:${color}" aria-hidden="true"></span><span>${colorNames[i]} <small>${mixingNotes[i]}</small></span>${paletteColors.includes(i)?icon('check'):''}</button>`).join('')}</div>
    ${button('Save this palette','save-palette','primary',paletteColors.length?'':'disabled')}<p class="status" id="palette-status" role="status"></p>
    <div class="row">${back(`art/${art.id}`,'View the painting')}${link('My saved palettes','notebook','text-link')}</div></div></section>`;
}

const mediumOptions = active => Object.entries(paints).map(([id,item])=>`<option value="${id}" ${id===active?'selected':''}>${item.name}</option>`).join('');
function tryThree() {
  const selected = state.pearMedium || currentQuiz()?.easy || 'gouache';
  const result = paints[selected];
  return `<section class="section">${head('A brush experiment','Try three ways','Draw three little pears. Give each one the same few minutes and notice which felt most natural.')}
    <div class="stack"><div class="field"><label for="pear-medium">My medium</label><select id="pear-medium">${mediumOptions(selected)}</select></div>
    <div class="stack" role="group" aria-label="Pick the technique that felt most natural">${result.pear.map((tip,i)=>`<article class="panel stack"><p class="kicker">Pear ${i+1}</p><p>${tip}</p>${button('This felt most natural','pear-pick','',`data-value="${i}" aria-pressed="${state.pearPick===i}"`)}</article>`).join('')}</div>
    <p class="status" role="status">${state.pearPick!==null?'Saved your pick. Give that technique another few minutes next time.':''}</p>${link('Write a note about it','notebook','button primary')}${back('studio')}</div></section>`;
}
const moods = {
  calm:{subject:'one cloud', instruction:'Keep one edge lost in the background. Leave a little room around it.'},
  bold:{subject:'one flower', instruction:'Put your strongest color next to the darkest shadow. Let three strokes do most of the work.'},
  curious:{subject:'one pear', instruction:'Divide the pear into three values. Try making the smallest shape an unexpected color.'}
};
const dateTechnique = {
  acrylic:'Work in small shapes and let the first layer set before you add a sharper edge.',
  watercolor:'Start with your palest wash and leave a patch of paper showing.',
  gouache:'Mix the colors you need first, then set down each shape with one loaded stroke.',
  oils:'Work thinly and soften one transition while the paint stays wet.'
};
function paintDate() {
  const plan = state.plan;
  return `<section class="section">${head('A little time to paint','Painting date','Tell the studio what you have on hand and how you feel. Leave with one small plan.')}
    <form class="stack" id="date-form">
    <div class="field"><label for="date-time">Time I have</label><select name="minutes" id="date-time">${[10,15,20,30,45].map(n=>`<option value="${n}" ${n===(plan?.minutes??20)?'selected':''}>${n} minutes</option>`).join('')}</select></div>
    <div class="field"><label for="date-mood">What I’m in the mood for</label><select name="mood" id="date-mood">${Object.keys(moods).map(mood=>`<option value="${mood}" ${mood===(plan?.mood??'bold')?'selected':''}>${mood[0].toUpperCase()+mood.slice(1)}</option>`).join('')}</select></div>
    <div class="field"><label for="date-medium">Paint I have</label><select name="medium" id="date-medium">${mediumOptions(plan?.medium ?? currentQuiz()?.easy ?? 'gouache')}</select></div>
    <div class="field"><label for="date-colors">Colors I have</label><select name="colors" id="date-colors">${[1,2,3].map(n=>`<option value="${n}" ${n===(plan?.colors??3)?'selected':''}>${n} ${n===1?'color':'colors'}</option>`).join('')}</select></div>
    <button class="button primary" type="submit">Make my painting date</button></form>
    ${plan ? `<article class="paper feedback stack" role="status"><p class="kicker">Your painting date</p><h3>${plan.minutes} minutes · ${paints[plan.medium].name} · ${plan.colors} ${plan.colors===1?'color':'colors'} · ${moods[plan.mood].subject}</h3><p>${plan.colors===1?'Use the bare surface as your lightest value and vary how much paint you put down. ':''}${plan.colors===1&&plan.mood==='curious'?'Divide the pear into a light shape, a middle shape, and a shadow.':moods[plan.mood].instruction}</p><p>${dateTechnique[plan.medium]}</p><p>Set up for 3 minutes, paint for ${plan.minutes-5}, and take 2 minutes to notice what you’d do again.</p></article>` : ''}${back('studio')}</section>`;
}
function notebook() {
  const favoriteArt = paintings.filter(art=>state.favorites.includes(art.id));
  const taste = currentTaste();
  const result = currentQuiz();
  return `<section class="section">${head('Your work, kept close','Studio notebook','A place to keep what you loved and what you tried. Your notebook stays on this device.')}
    <div class="stack"><article class="panel stack"><h3>My results</h3>${taste ? link(taste.map(x=>x.art.name).join(' + '),'taste-result','button') : link('Find my painting style','gallery','button')}${result ? link(`Paint quiz · ${paints[result.easy].name} to start`,'quiz-result','button') : link('Find my first medium','quiz','button')}</article>
    <article class="panel stack"><h3>Favorite paintings</h3>${favoriteArt.length ? tiles(favoriteArt) : '<p class="empty">Tap a heart in the gallery to keep a painting here.</p>'}</article>
    <article class="panel stack"><h3>Saved palettes</h3>${state.palettes.length ? state.palettes.map(entry=>{ const art=artById(entry.id);return `<div class="panel"><p>${art.name}</p><div class="saved-palette">${entry.colors.map(i=>`<span class="swatch" style="background:${art.colors[i]}" role="img" aria-label="${colorNames[i]}"></span>`).join('')}</div>${link('Open mixing notes',`palettes/${art.id}`,'text-link')}</div>`;}).join('') : '<p class="empty">Your colors will appear here when you save a palette.</p>'}</article>
    <article class="panel stack"><h3>After a painting</h3><form id="note-form" class="stack"><div class="field"><label for="studio-note">What did you enjoy enough to do again?</label><textarea id="studio-note" name="note" maxlength="600" required placeholder="One little thing you noticed…"></textarea></div><button class="button primary" type="submit">Save this note</button></form>
    ${state.notes.map(entry=>`<div class="paper"><p class="kicker">${esc(new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric'}).format(entry.date))}</p><p class="note">${esc(entry.text)}</p></div>`).join('')}</article>
    ${storageOkay?'':'<p class="status" role="status">This browser couldn’t save studio data. Keep this tab open to keep your current work.</p>'}
    ${back('studio')}</div></section>`;
}

const offlineTips = [
  ['What should I paint first?','Paint one flower from the side. Use a light, a middle value, and a shadow. Make the whole thing the size of your thumb.'],
  ['Why do my colors look muddy?','Clean your brush, pick just two colors, and mix a fresh puddle beside the muddy one. Compare them before you add anything else.'],
  ['Help me mix a shadow','Start with your petal color. Mix a little blue into a separate dab and test that beside your lit color. Adjust a tiny bit at a time.'],
  ['I hate how my painting looks right now','Put the painting down, take three steps back, and squint. Pick one shape that’s hard to read. Fix that shape and see what changes.']
];
function chatPage() {
  return `<section class="section">${head('From the studio','Ask Rashed','Open a question for a quick painting tip. Live AI chat needs the separately hosted backend.')}
    <div class="panel stack painting-tips">${offlineTips.map(([question,tip])=>`<details><summary>${question}</summary><p>${tip}</p></details>`).join('')}</div>
    ${back('studio')}</section>`;
}

const routes = {
  studio:home, gallery, compare, 'taste-result':tasteResult, collection, art:artPage,
  quiz, 'quiz-result':quizResult, wash:washLesson, palettes:palette, try:tryThree,
  date:paintDate, notebook, chat:chatPage
};
const galleryPages = ['gallery','compare','taste-result','collection','art','palettes'];
const quizPages = ['quiz','quiz-result','wash'];
function activeTab() {
  if (galleryPages.includes(page)) return 'gallery';
  if (quizPages.includes(page)) return 'quiz';
  return page === 'chat' ? 'chat' : 'studio';
}
function render({reset=false, focus, id}={}) {
  const routeId = id ?? location.hash.slice(1).split('/')[1];
  main.innerHTML = routes[page](routeId);
  nav.innerHTML = [['studio','Studio'],['gallery','Gallery'],['quiz','Quiz'],['chat','Ask Rashed']].map(([route,label])=>`<a href="#${route}" ${activeTab()===route?'aria-current="page"':''}>${icon(route)}<span>${label}</span></a>`).join('');
  syncWash();
  if (reset) window.scrollTo(0,0);
  if (focus) {
    const target = main.querySelector(focus) ?? main;
    if (/^H[1-6]$/.test(target.tagName)) target.tabIndex = -1;
    target.focus({preventScroll:true});
    if (!reset && /^H[1-6]$/.test(target.tagName)) target.scrollIntoView({block:'nearest'});
  }
}
function onRoute() {
  const [name,id] = location.hash.slice(1).split('/');
  if (name==='main') {main.focus();return;}
  const oldPage = page;
  page = Object.hasOwn(routes,name) ? name : 'studio';
  if (page==='palettes') {
    const next = artById(id || paletteArt).id;
    if (oldPage!==page || next!==paletteArt) paletteColors = state.palettes.find(item=>item.id===next)?.colors.slice() ?? [];
    paletteArt = next;
  }
  render({reset:true,focus:oldPage ? 'h1' : undefined,id});
}
function changeAndRender(selector) {
  save();
  render({focus:selector});
}
function advanceArtwork(delta) {
  const next = Math.max(0,Math.min(paintings.length-1,state.galleryAt+delta));
  if (next===state.galleryAt) return;
  state.galleryAt = next;
  changeAndRender('.art-frame .favorite');
}
function stepQuiz(delta) {
  state.quizAt = Math.max(0,Math.min(questions.length-1,state.quizAt+delta));
  changeAndRender('.question');
}
function goTo(name) {
  location.hash = name;
}
main.addEventListener('click', event=>{
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  const {action,value,id} = control.dataset;
  const i = Number(value);
  switch (action) {
    case 'favorite': {
      const wasSaved = state.favorites.includes(id);
      state.favorites = wasSaved ? state.favorites.filter(art=>art!==id) : [...state.favorites,id];
      save();
      control.setAttribute('aria-pressed',String(!wasSaved));
      break;
    }
    case 'react':
      state.reactions[paintings[state.galleryAt].id] = value;
      changeAndRender(`[data-action="react"][data-value="${value}"]`);
      break;
    case 'art-next': advanceArtwork(1); break;
    case 'art-prev': advanceArtwork(-1); break;
    case 'compare-pick':
      state.choices[state.comparisonAt] = i;
      changeAndRender(`[data-action="compare-pick"][data-value="${i}"]`);
      break;
    case 'compare-back':
      if (state.comparisonAt===0) goTo('gallery');
      else {state.comparisonAt--;changeAndRender('h2');}
      break;
    case 'compare-next':
      if (state.comparisonAt===comparisons.length-1) {
        state.galleryDone = true; save(); goTo('taste-result');
      } else {state.comparisonAt++;changeAndRender('h2');}
      break;
    case 'answer':
      state.answers[state.quizAt] = i;
      changeAndRender(`[data-action="answer"][data-value="${i}"]`);
      break;
    case 'quiz-back': stepQuiz(-1); break;
    case 'quiz-next':
      if (state.quizAt===questions.length-1) {
        state.quizDone = true; save(); goTo('quiz-result');
      } else stepQuiz(1);
      break;
    case 'water-down':
    case 'water-up':
      state.wash = Math.min(100,Math.max(0,state.wash+(action==='water-up'?10:-10)));
      save(); syncWash();
      break;
    case 'color':
      paletteColors = paletteColors.includes(i) ? paletteColors.filter(color=>color!==i) : [...paletteColors,i];
      render({focus:`${control.classList.contains('palette-point')?'.palette-point':'.color-pick'}[data-value="${i}"]`});
      break;
    case 'save-palette':
      state.palettes = [...state.palettes.filter(entry=>entry.id!==paletteArt),{id:paletteArt,colors:[...paletteColors]}];
      save();
      document.querySelector('#palette-status').textContent = storageOkay?'Palette saved in your notebook.':'This browser couldn’t save the palette.';
      break;
    case 'pear-pick':
      state.pearMedium = document.querySelector('#pear-medium').value;
      state.pearPick = i;
      changeAndRender(`[data-action="pear-pick"][data-value="${i}"]`);
      break;
  }
});
main.addEventListener('change',event=>{
  const input = event.target;
  if (input.id==='palette-art') goTo(`palettes/${input.value}`);
  if (input.id==='pear-medium') {
    state.pearMedium = input.value;
    state.pearPick = null;
    changeAndRender('#pear-medium');
  }
});
main.addEventListener('input',event=>{
  const input = event.target;
  if (input.id==='wash') {state.wash=Number(input.value);save();syncWash();}
});
main.addEventListener('submit',event=>{
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (form.id==='note-form') {
    const text = String(data.get('note') ?? '').trim();
    if (!text) return;
    state.notes = [{text,date:Date.now()},...state.notes];
    changeAndRender('#studio-note');
  }
  if (form.id==='date-form') {
    state.plan = {minutes:Number(data.get('minutes')),mood:data.get('mood'),medium:data.get('medium'),colors:Number(data.get('colors'))};
    changeAndRender('#date-form button');
    main.querySelector('.feedback')?.scrollIntoView({block:'nearest'});
  }
});
main.addEventListener('touchstart',event=>{
  if (!event.target.closest('[data-swipe]') || event.target.closest('button')) return;
  const t = event.changedTouches[0];
  touchStart = {x:t.clientX,y:t.clientY};
},{passive:true});
main.addEventListener('touchend',event=>{
  if (!touchStart) return;
  const t = event.changedTouches[0];
  const dx = t.clientX-touchStart.x;
  const dy = t.clientY-touchStart.y;
  touchStart = null;
  if (page==='gallery' && Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.45) advanceArtwork(dx<0?1:-1);
},{passive:true});
main.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
window.addEventListener('hashchange',onRoute);
document.querySelector('#notebook-link').innerHTML = `${icon('book')} Notebook`;
onRoute();
