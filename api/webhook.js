import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot is running');
  }

  const message = req.body?.message;
  if (!message || !message.text) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const userText = message.text.toLowerCase().trim();

  if (userText === '/start') {
    await sendTelegram(chatId, 'မင်္ဂလာပါ! Shwe Shop မှ ကြိုဆိုပါတယ်။ သိလိုသည်များကို မေးမြန်းနိုင်ပါတယ်။');
    return res.status(200).send('OK');
  }

  try {
    // Read soul.md from the root directory
    const filePath = path.join(process.cwd(), 'soul.md');
    const soulContent = fs.readFileSync(filePath, 'utf8');

    const blocks = soulContent.split(/^##\s+/m).slice(1);
    let replyText = 'ကျေးဇူးပြု၍ ဆိုင်နှင့်ပတ်သက်သည်များကို မေးမြန်းပေးပါ။';
    let bestScore = 0;

    for (const block of blocks) {
      const lines = block.split('\n');
      const question = lines[0].toLowerCase().trim();
      const answer = lines.slice(1).join('\n').trim();

      if (!answer) continue;

      if (userText.includes(question) || question.includes(userText)) {
        replyText = answer;
        break;
      }

      let score = 0;
      const userWords = userText.split(/\s+/);
      for (const word of userWords) {
        if (word.length > 1 && question.includes(word)) {
          score++;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        replyText = answer;
      }
    }

    await sendTelegram(chatId, replyText);
  } catch (err) {
    await sendTelegram(chatId, 'Error reading soul.md: ' + err.message);
  }

  return res.status(200).send('OK');
}

async function sendTelegram(chatId, text) {
  const token = process.env.BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
