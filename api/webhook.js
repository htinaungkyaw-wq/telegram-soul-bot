import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram Webhook is active.');
  }

  const message = req.body?.message;
  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const userText = message.text.toLowerCase().trim();

  // /start နှိပ်လျှင် ကြိုဆိုရန်
  if (userText === '/start') {
    await sendTelegramMessage(chatId, 'မင်္ဂလာပါ! သိလိုသော မေးခွန်းများကို မေးမြန်းနိုင်ပါတယ်။');
    return res.status(200).send('OK');
  }

  // soul.md ဖိုင်ကို ဖတ်ခြင်း
  const filePath = path.join(process.cwd(), 'soul.md');
  const soulContent = fs.readFileSync(filePath, 'utf8');

  // "## " ဖြင့် ပိုင်းခြားထားသော မေးခွန်းနှင့် အဖြေများကို စစ်ထုတ်ခြင်း
  const blocks = soulContent.split(/^##\s+/m).slice(1);
  let replyText = 'Please ask a relevant question.'; // မကိုက်ညီပါက ပြန်ဖြေမည့်စာ

  // စကားလုံး အနည်းဆုံး တစ်လုံး သို့မဟုတ် စာသားတူညီမှု ရှိ/မရှိ စစ်ဆေးခြင်း
  const userWords = userText.split(/\s+/).filter(w => w.length > 1);
  let bestScore = 0;

  for (const block of blocks) {
    const lines = block.split('\n');
    const question = lines[0].toLowerCase().trim();
    const answer = lines.slice(1).join('\n').trim();

    if (!answer) continue;

    // တိုက်ရိုက်တူညီမှု စစ်ဆေးခြင်း
    if (userText.includes(question) || question.includes(userText)) {
      replyText = answer;
      break;
    }

    // စကားလုံး (Keywords) တူညီမှု အရေအတွက် တွက်ချက်ခြင်း
    let score = 0;
    for (const word of userWords) {
      if (question.includes(word)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      replyText = answer;
    }
  }

  await sendTelegramMessage(chatId, replyText);
  return res.status(200).send('OK');
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}
