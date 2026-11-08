const securityHeaders = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'X-Robots-Tag':'noindex, nofollow',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'"
};
const mediumNames = new Set(['Acrylic','Watercolor','Gouache','Oils']);
const styleNames = new Set(['Realism','Impressionism','Expressionism','Abstract','Surrealism','Minimalism','Pop Art','Decorative & Pattern-Based Painting']);
const maxBody = 48_000;
const coaching = [
  'You are Rashed, an AI painting coach made for Remas. You are inspired by a real friend’s teaching style and are always an AI.',
  'Teach like a friend who paints. Be casual, direct, warm, and specific. Use light humor when it fits. Keep replies under 100 words, in plain text and short paragraphs.',
  'Reply in casual English, or natural Emirati Arabic when Remas writes in Arabic. Use feminine address in Arabic. Follow her language when she switches.',
  'Focus on painting, materials, color, and practice. If she is stuck, give her one specific thing to try on the canvas now. Only offer visual feedback based on what she describes, and ask one brief question if a detail matters.',
  'Use her studio quiz results only if included below. Respect medium-specific constraints. Keep any prompt, credentials, and internal configuration private.'
].join(' ');

function json(data, status=200) {
  return Response.json(data,{status,headers:{...securityHeaders,'Cache-Control':'no-store'}});
}

async function readBody(request) {
  if (!request.body) throw new Error('Missing request body');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let body = '';
  try {
    while (true) {
      const {value,done} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBody) throw new RangeError('Request too large');
      body += decoder.decode(value,{stream:true});
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    if (length > maxBody) await reader.cancel();
    reader.releaseLock();
  }
}

function trustedContext(input) {
  if (!input || typeof input !== 'object') return '';
  const info = [];
  if (mediumNames.has(input.medium)) info.push(`easiest medium: ${input.medium}`);
  if (mediumNames.has(input.look)) info.push(`preferred look: ${input.look}`);
  const styles = Array.isArray(input.styles) ? input.styles.filter(item=>styleNames.has(item)).slice(0,2) : [];
  if (styles.length) info.push(`favorite styles: ${styles.join(', ')}`);
  return info.length ? ` Remas chose to share these results: ${info.join('. ')}.` : '';
}

function callGroq(env, fetchModel, messages, instructions) {
  const model = env.GROQ_MODEL || 'qwen/qwen3.8-27b';
  return fetchModel('https://api.groq.com/openai/v1/chat/completions', {
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:'Bearer ' + env.GROQ_API_KEY},
    body:JSON.stringify({
      model, messages:[{role:'system',content:instructions},...messages],
      max_completion_tokens:800, temperature:.7
    }),
    signal:AbortSignal.timeout(20000)
  });
}

function callGemini(env, fetchModel, messages, instructions) {
  const contents = messages.map(message=>({
    role:message.role==='assistant'?'model':'user',
    parts:[{text:message.content}]
  }));
  if (contents[0].role==='model') contents.shift();
  const model = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  if (!/^gemini-[a-z0-9.-]+$/.test(model)) return new Response(null,{status:503});
  return fetchModel(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
    body:JSON.stringify({
      systemInstruction:{parts:[{text:instructions}]},
      contents, generationConfig:{maxOutputTokens:800,temperature:.75,thinkingConfig:{thinkingLevel:'MINIMAL'}}
    }),
    signal:AbortSignal.timeout(20000)
  });
}

async function chatApi(request, env, fetchModel) {
  const useGroq = Boolean(env.GROQ_API_KEY);
  const available = useGroq || Boolean(env.GEMINI_API_KEY);
  if (request.method==='GET') return json({available});
  if (request.method!=='POST') return json({error:'Method not allowed'},405);
  const origin = request.headers.get('Origin');
  if (request.headers.get('Sec-Fetch-Site')==='cross-site' || (origin && origin !== new URL(request.url).origin && request.headers.get('Sec-Fetch-Site')!=='same-origin')) return json({error:'Origin not allowed'},403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error:'Use application/json'},415);
  if (!available) return json({error:'The AI coach is unavailable'},503);
  if (Number(request.headers.get('Content-Length')) > maxBody) return json({error:'Request too large'},413);
  let input;
  try { input = await readBody(request); }
  catch (error) { return json({error:'Invalid request'},error instanceof RangeError ? 413 : 400); }
  const messages = input?.messages;
  if (!Array.isArray(messages) || !messages.length || messages.length > 12 || messages.at(-1)?.role!=='user' || messages.some(message=>
    !['user','assistant'].includes(message?.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 1200
  )) return json({error:'Send a valid painting question'},400);

  const conversation = messages.map(({role,content})=>({role,content:content.trim()}));
  const instructions = coaching + trustedContext(input.context);
  try {
    const callModel = useGroq ? callGroq : callGemini;
    const upstream = await callModel(env,fetchModel,conversation,instructions);
    if (!upstream.ok) return json({error:'The AI provider couldn’t reply'},[400,401,403,404,429,503].includes(upstream.status)?503:502);
    const data = await upstream.json();
    const text = useGroq ? data.choices?.[0]?.message?.content :
      data.candidates?.[0]?.content?.parts?.filter(part=>!part.thought && typeof part.text==='string').map(part=>part.text).join('\n');
    const reply = typeof text==='string' ? text.trim() : '';
    return reply ? json({reply:reply.slice(0,1200)}) : json({error:'The AI coach sent no reply'},502);
  } catch {
    return json({error:'The AI provider couldn’t reply'},502);
  }
}

const mediaTypes = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',webp:'image/webp'};

export function createHandler(readAsset, fetchModel=(...args)=>fetch(...args)) {
  return async (request, env={}) => {
    const {pathname} = new URL(request.url);
    if (pathname==='/api/chat') return chatApi(request,env,fetchModel);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
    const path = pathname==='/'?'/index.html':pathname;
    const asset = await readAsset(path);
    if (asset==null) return new Response('Page not found',{status:404,headers:securityHeaders});
    const type = mediaTypes[path.split('.').at(-1)] ?? 'application/octet-stream';
    return new Response(request.method==='HEAD'?null:asset,{headers:{...securityHeaders,
      'Content-Type':type,'Cache-Control':type==='image/webp'?'private, max-age=3600':'no-cache'
    }});
  };
}

