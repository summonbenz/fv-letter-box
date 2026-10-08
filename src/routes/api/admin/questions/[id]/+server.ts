import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { setQuestionStatus } from '$lib/server/sheets';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const password = env.QANDA_ADMIN_PASSWORD;
  if (!password || request.headers.get('x-admin-password') !== password) {
    return json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'ข้อมูลสถานะไม่ถูกต้อง' }, { status: 400 });
  }

  if (body.status !== 'answered') {
    return json({ error: 'สถานะที่ส่งมาไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const updated = await setQuestionStatus(params.id, body.status);
    if (!updated) {
      return json({ error: 'ไม่พบคำถามนี้ในระบบ' }, { status: 404 });
    }
    return json({ success: true });
  } catch (error) {
    console.error('Unable to update question status in Google Sheets:', error);
    return json({ error: 'อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
};
