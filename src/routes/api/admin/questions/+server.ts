import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { listQuestions } from '$lib/server/sheets';
import type { RequestHandler } from './$types';

function isAuthorized(request: Request): boolean {
  const password = env.QANDA_ADMIN_PASSWORD;
  return Boolean(password) && request.headers.get('x-admin-password') === password;
}

export const GET: RequestHandler = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  try {
    const questions = await listQuestions();
    return json(
      { questions },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Unable to read questions from Google Sheets:', error);
    return json({ error: 'โหลดคำถามไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ Google Sheets' }, { status: 500 });
  }
};
