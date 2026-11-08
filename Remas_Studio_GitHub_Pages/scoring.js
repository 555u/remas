import {paintings, comparisons, paints, questions} from './content.js';

export function paintingResults(reactions, choices) {
  const weights = {love:5, curious:2, skip:-3};
  return paintings.map((art, index) => {
    const hits = art.traits.map((trait, i) => choices[i] === trait);
    const evidence = hits.flatMap((hit, i) => hit ? [comparisons[i].options[choices[i]].toLowerCase()] : []);
    const score = (weights[reactions[art.id]] ?? 0) + evidence.length;
    return {art, score, index, evidence, reaction:reactions[art.id]};
  }).sort((a,b) => b.score - a.score || a.index - b.index).slice(0, 2);
}

export function quizResults(answers) {
  const keys = Object.keys(paints);
  const scores = keys.map((id, i) => ({id, i, look:0, setup:0}));
  answers.forEach((answer, q) => {
    const option = questions[q]?.options[answer];
    if (!option) return;
    scores.forEach((score, i) => {
      score.look += option.look[i] ?? 0;
      score.setup += option.setup[i] ?? 0;
    });
  });
  const ranked = key => [...scores].sort((a,b) => b[key] - a[key] || a.i - b.i);
  const look = ranked('look');
  const setup = ranked('setup');
  return {
    look:look[0].id, easy:setup[0].id,
    lookNear:look[0].look - look[1].look <= 2 ? look[1].id : null,
    setupNear:setup[0].setup - setup[1].setup <= 2 ? setup[1].id : null,
    scores
  };
}

export function setupReason(id, answers) {
  const workspace = ['small desk', 'shared table', 'dedicated painting space'][answers[4]];
  const session = ['short sessions', 'sessions you can pack away after', 'time to revisit a painting'][answers[3]];
  const method = {
    acrylic:'quick-drying layers and water cleanup while the paint is wet',
    watercolor:'a compact setup with paper, one brush, and a water jar',
    gouache:'opaque layers with a compact, water-based setup',
    oils:'more time to blend, with a place to leave the board while it dries'
  }[id];
  return `You chose ${session} and a ${workspace}. ${paints[id].name} offers ${method}.`;
}
