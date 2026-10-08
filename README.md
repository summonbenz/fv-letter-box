# ถามได้เลย — Q&A สัมมนา

แอป SvelteKit สำหรับรับคำถามจากผู้เข้าร่วมและสุ่มแสดงคำถามในหน้าผู้ดำเนินรายการ ข้อมูลถูกเก็บใน Google Sheets และ deploy ได้บน Netlify

## เริ่มต้นใช้งาน

```sh
npm install
npm run dev
```

ตั้งค่า environment variables ต่อไปนี้ก่อนใช้งาน API:

| ตัวแปร | รายละเอียด |
| --- | --- |
| `GOOGLE_SHEET_ID` | Spreadsheet ID จาก URL ของ Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | อีเมล service account |
| `GOOGLE_PRIVATE_KEY` | Private key ของ service account; เก็บเป็นความลับ |
| `QANDA_ADMIN_PASSWORD` | รหัสผ่านสำหรับหน้าผู้ดำเนินรายการ |

สร้าง Google Sheet แล้วเพิ่มแท็บชื่อ `Questions` โดยใส่หัวตารางในแถวแรกตามลำดับนี้:

```text
id | question | name | createdAt | status
```

เปิด Google Sheets API ใน Google Cloud project ที่ใช้กับ service account และแชร์ชีตให้ `GOOGLE_SERVICE_ACCOUNT_EMAIL` ที่สิทธิ์ Editor ข้อมูลรับรองทั้งหมดต้องตั้งเป็น environment variables ฝั่ง server เท่านั้น ห้ามใช้ prefix `VITE_` หรือส่ง private key ไปยัง client

## Deploy บน Netlify

1. Push โปรเจกต์ไปยัง GitHub แล้วเพิ่ม repository เป็น site ใน Netlify
2. Netlify ตรวจพบ SvelteKit adapter และใช้ `npm run build` เป็น build command โดยอัตโนมัติ
3. เพิ่ม environment variables ทั้งสี่ตัวด้านบนที่ **Site configuration → Environment variables** (ใช้ private key ที่บรรทัดขึ้นต้นด้วย `-----BEGIN PRIVATE KEY-----`; ระบบจะแปลง `\n` เป็นบรรทัดใหม่ให้อัตโนมัติ)
4. Deploy ใหม่หลังเพิ่มหรือแก้ environment variables
5. แชร์ URL หลักให้ผู้เข้าร่วม และเปิด `/host` สำหรับผู้ดำเนินรายการ

หน้าผู้ดำเนินรายการสุ่มจากคำถามสถานะ `pending`; ปุ่ม “ข้ามไปก่อน” เปลี่ยนคำถามที่แสดงแต่ยังคงสถานะเดิม จึงสุ่มเจออีกได้ ส่วน “ตอบคำถามนี้แล้ว” จะอัปเดตเป็น `answered` ในชีตและเอาออกจากการสุ่มครั้งต่อไป

## ตรวจสอบ

```sh
npm run check
npm run build
```
