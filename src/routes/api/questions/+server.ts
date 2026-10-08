import { json } from '@sveltejs/kit';
import { addQuestion } from '$lib/server/sheets';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  let body: { question?: unknown; name?: unknown };

  try {
    body = await request.json();
  } catch {
    return json({ error: 'กรุณาส่งข้อมูลคำถามให้ถูกต้อง' }, { status: 400 });
  }

  if (typeof body.question !== 'string' || typeof body.name !== 'string') {
    return json({ error: 'กรุณากรอกคำถามให้ถูกต้อง' }, { status: 400 });
  }

  const question = body.question.trim();
  const name = body.name.trim();

  if (!question) {
    return json({ error: 'กรุณาพิมพ์คำถามก่อนส่งนะ' }, { status: 400 });
  }

  if (question.length > 500 || name.length > 80) {
    return json({ error: 'คำถามต้องไม่เกิน 500 ตัวอักษร และชื่อต้องไม่เกิน 80 ตัวอักษร' }, { status: 400 });
  }

  try {
    const entry = await addQuestion(question, name);
    return json({ id: entry.id }, { status: 201 });
  } catch (error) {
    console.error('Unable to save a question to Google Sheets:', error);
    return json({ error: 'บันทึกคำถามไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
};
