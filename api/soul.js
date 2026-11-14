import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'soul.md');
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send('soul.md ဖိုင်ကို ရှာမတွေ့ပါ။');
  }
}
