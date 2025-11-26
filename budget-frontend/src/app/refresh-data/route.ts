import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST() {
  try {
    console.log("🚀 [API] Rozpoczynam pobieranie danych z tabelą łączącą...");

    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();
    
    const sqlQuery = `
      SELECT 
        b."Id",
        b."Name" AS "Nazwa Budzetu",
        b."IsArchived" AS "Zarchiwizowany",
        ub."Role" AS "Rola Uzytkownika",
        u."UserName" AS "Uzytkownik",
        u."Email" AS "Email"
      FROM "Budgets" b
      JOIN "UserBudgets" ub ON b."Id" = ub."BudgetId"
      JOIN "AspNetUsers" u ON ub."UserId" = u."Id"
    `;

    const res = await client.query(sqlQuery);
    const rows = res.rows;
    
    client.release();
    await pool.end();

    console.log(`✅ [DB] Pobrano ${rows.length} wierszy.`);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    if (!clientEmail || !privateKey || !spreadsheetId) throw new Error("Brak configu Google");

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const headerRow = rows.length > 0 ? Object.keys(rows[0]) : 
        ['Id', 'Nazwa Budzetu', 'Zarchiwizowany', 'Rola Uzytkownika', 'Uzytkownik', 'Email'];
    
    const values = rows.map((row: any) => Object.values(row).map((val: any) => {
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString().slice(0, 19).replace('T', ' '); 
        if (typeof val === 'boolean') return val ? "TAK" : "NIE";
        return String(val);
    }));

    await sheet.clear();
    await sheet.setHeaderRow(headerRow);
    
    if (values.length > 0) {
        await sheet.addRows(values);
    } else {
        await sheet.addRow(['Brak danych w bazie']);
    }

    return NextResponse.json({ success: true, count: rows.length });

  } catch (error: any) {
    console.error("❌ Błąd SQL:", error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}