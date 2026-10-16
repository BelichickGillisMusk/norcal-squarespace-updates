/**
 * Live script check against xAI. Fake visitors only. Prints a transcript.
 * Usage: node scripts/vin-transcript.mjs
 */
import { createMemoryChatDb, handleChat } from '../worker/vin-diesel.js';

const SCENARIOS = [
  {
    id: 'booking',
    first: 'Yeah, I need my truck tested.',
    answer(q) {
      if (/company|business/.test(q)) return 'Chen Hauling';
      if (/name/.test(q)) return 'Mike Chen';
      if (/phone|number|call|text/.test(q)) return '916-555-0148';
      if (/how many|vehicle|truck|year|type/.test(q)) return 'One 2018 Freightliner box truck';
      if (/where|city|zip|location|yard|address/.test(q)) return 'West Sacramento 95691';
      if (/when|date|time|day|tuesday|schedule/.test(q)) return 'Next Tuesday at 9am';
      if (/reason|kind of test|obd|ovi|why/.test(q)) return 'Annual clean truck check';
      return "That's everything. Thanks.";
    },
  },
  {
    id: 'fleet-8',
    first: 'I have 8 trucks in Stockton that need testing before Friday.',
    answer(q) {
      if (/company|business/.test(q)) return 'Ruiz Freight';
      if (/name/.test(q)) return 'Dana Ruiz';
      if (/phone|number|call|text/.test(q)) return '916-555-0199';
      if (/how many|vehicle|truck|year|type|what are/.test(q)) return '8 trucks, 2016 to 2022 Freightliner and Kenworth';
      if (/where|city|zip|location|yard|address/.test(q)) return 'Stockton yard 95206';
      if (/when|date|time|day|schedule|deadline/.test(q)) return 'Thursday morning. Deadline is Friday.';
      return 'Please send pricing to the team.';
    },
  },
  {
    id: 'ask-bryan',
    first: 'Can I talk to Bryan?',
    answer(q) {
      if (/company|business/.test(q)) return 'Ortiz Trucking';
      if (/name/.test(q)) return 'Alex Ortiz';
      if (/phone|number|call|text/.test(q)) return '916-555-0177';
      if (/plate|vin|prior|last test|before/.test(q)) return 'Tested in Sacramento in March. Plate 8ABC123.';
      if (/where|city|location|yard/.test(q)) return 'Sacramento';
      if (/when|date|time|day/.test(q)) return 'Tomorrow at 2pm';
      if (/what.*about|reason|help/.test(q)) return 'Question about the last test.';
      return 'Tomorrow at 2pm works.';
    },
  },
  {
    id: 'spanish',
    first: 'Hola, necesito hacerle la prueba a mi camión en Sacramento.',
    answer(q) {
      if (/empresa|compañ|negocio/.test(q)) return 'Mora Transportes';
      if (/nombre/.test(q)) return 'Luis Mora';
      if (/tel|número|numero|llamar/.test(q)) return '916-555-0133';
      if (/camión|camion|vehículo|vehiculo|año|ano|cuántos|cuantos/.test(q)) return 'Un camión Freightliner 2015';
      if (/dónde|donde|ciudad|ubicación|ubicacion|código|codigo|zip/.test(q)) return 'Sacramento 95834';
      if (/cuándo|cuando|fecha|hora|día|dia/.test(q)) return 'El viernes a las 10';
      if (/motivo|razón|razon|prueba/.test(q)) return 'Clean Truck Check anual';
      return 'Eso es todo, gracias.';
    },
  },
];

function check(id, text, leads) {
  const notes = [];
  const shop = text.includes('(916) 890-4427') || !/209-818-1371|678-1090|628-999-3912|415-900-8563/.test(text);
  if (!shop) notes.push('BAD PHONE');
  if (/\bBryan\b|\bMichael\b/.test(text)) notes.push('SAID A STAFF NAME');
  if (/\bbooked\b|\bconfirmed\b/i.test(text)) notes.push('SAID BOOKED/CONFIRMED');
  if (id === 'fleet-8') {
    if (!/\$50|\$60|50 to 60|50 a 60/.test(text)) notes.push('MISSED FLEET RANGE');
    if (/\$75|\$199/.test(text)) notes.push('QUOTED SINGLE-TRUCK PRICE FOR FLEET');
    if (!leads.some((row) => row.urgent)) notes.push('NOT MARKED URGENT');
  }
  if (id === 'ask-bryan') {
    if (!/team|guys|muchachos/i.test(text)) notes.push('DID NOT HAND TO THE TEAM');
    if (/works here|he is the|owner is/i.test(text)) notes.push('CONFIRMED A PERSON');
  }
  if (id === 'spanish') {
    if (!/[áéíóúñ¿¡]|\busted\b|\bsu\b|\bnecesita\b|\bcamión\b/i.test(text)) notes.push('NOT SPANISH');
  }
  if (id === 'booking') {
    if (!/requested|solicit/i.test(text)) notes.push('DID NOT SAY REQUESTED');
    if (!leads.some((row) => row.kind === 'appointment' || row.kind === 'summary')) notes.push('NOT SAVED');
  }
  return notes;
}

async function runScenario(scenario) {
  const db = createMemoryChatDb();
  const env = {
    XAI_API_KEY: process.env.XAI_API_KEY,
    XAI_MODEL: process.env.XAI_MODEL || 'grok-4.3',
    CHAT_DB: db,
    CHAT_RATE_LIMIT: 40,
    EMAIL: { async send() { return { messageId: 'transcript' }; } },
  };
  const messages = [];
  const log = [`### ${scenario.id}`, '', `Visitor: ${scenario.first}`];
  let next = scenario.first;
  for (let turn = 0; turn < 8; turn += 1) {
    messages.push({ role: 'user', content: next });
    const res = await handleChat(new Request('https://norcalcarbmobile.com/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://norcalcarbmobile.com' },
      body: JSON.stringify({
        messages,
        conversation_id: `transcript-${scenario.id}`,
        page: '/contact',
      }),
    }), env);
    const data = await res.json();
    const reply = data.reply || data.error || '(no reply)';
    log.push(`Vin: ${reply}`);
    if (data.ok) messages.push({ role: 'assistant', content: reply });
    else {
      log.push(`(status ${res.status})`);
      break;
    }
    if (/thanks for reaching|text us at|get back to you asap|gracias por comunicarse|le confirmen/i.test(reply)) break;
    next = scenario.answer(reply.toLowerCase());
    log.push(`Visitor: ${next}`);
  }
  const leads = (await db.prepare('SELECT id, created_at FROM chat_leads').bind().all()).results;
  const flags = check(scenario.id, log.join('\n'), leads);
  log.push('', `Saved rows: ${leads.map((row) => `${row.kind || ''} #${row.id} urgent=${row.urgent} email=${row.email_status}`).join('; ') || 'none'}`);
  log.push(flags.length ? `Flags: ${flags.join(', ')}` : 'Flags: none');
  log.push('');
  return log.join('\n');
}

if (!process.env.XAI_API_KEY) {
  console.error('XAI_API_KEY missing');
  process.exit(1);
}
const chunks = [];
for (const scenario of SCENARIOS) {
  process.stderr.write(`running ${scenario.id}\n`);
  chunks.push(await runScenario(scenario));
}
console.log(chunks.join('\n'));
