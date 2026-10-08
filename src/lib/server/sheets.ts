import { env } from '$env/dynamic/private';
import { createPrivateKey } from 'node:crypto';
import { google } from 'googleapis';

export type QuestionStatus = 'pending' | 'answered';

export interface Question {
  id: string;
  question: string;
  name: string;
  createdAt: string;
  status: QuestionStatus;
}

const sheetTab = 'Questions';

function normalizePrivateKey(value: string): string {
  let key = value.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  key = key
    .replace(/\\+r\\+n/g, '\n')
    .replace(/\\+n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  try {
    createPrivateKey(key);
  } catch (error) {
    throw new Error(
      'GOOGLE_PRIVATE_KEY must be a valid PEM private key. Copy the private_key value from the service account JSON, including its BEGIN/END lines.',
      { cause: error }
    );
  }

  return key;
}

function getSheets() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawPrivateKey = env.GOOGLE_PRIVATE_KEY;
  const spreadsheetId = env.GOOGLE_SHEET_ID;

  if (!email || !rawPrivateKey || !spreadsheetId) {
    throw new Error('Google Sheets is not configured. Set the required environment variables.');
  }

  const privateKey = normalizePrivateKey(rawPrivateKey);
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  return {
    api: google.sheets({ version: 'v4', auth }),
    spreadsheetId
  };
}

export async function listQuestions(): Promise<Question[]> {
  const { api, spreadsheetId } = getSheets();
  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTab}!A2:E`,
    valueRenderOption: 'UNFORMATTED_VALUE'
  });

  return (response.data.values ?? [])
    .filter((row) => row.length >= 5)
    .map((row) => ({
      id: String(row[0]),
      question: String(row[1]),
      name: String(row[2] || 'นิรนาม'),
      createdAt: String(row[3]),
      status: row[4] === 'answered' ? 'answered' : 'pending'
    }));
}

export async function addQuestion(question: string, name: string): Promise<Question> {
  const { api, spreadsheetId } = getSheets();
  const entry: Question = {
    id: crypto.randomUUID(),
    question,
    name: name || 'นิรนาม',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  await api.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetTab}!A:E`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[entry.id, entry.question, entry.name, entry.createdAt, entry.status]]
    }
  });

  return entry;
}

export async function setQuestionStatus(id: string, status: QuestionStatus): Promise<boolean> {
  const { api, spreadsheetId } = getSheets();
  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetTab}!A2:E`,
    valueRenderOption: 'UNFORMATTED_VALUE'
  });
  const rowIndex = (response.data.values ?? []).findIndex((row) => String(row[0]) === id);

  if (rowIndex === -1) return false;

  await api.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTab}!E${rowIndex + 2}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] }
  });

  return true;
}
