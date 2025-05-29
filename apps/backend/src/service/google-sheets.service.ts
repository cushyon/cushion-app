import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = "1cWD-KXEeP3yGbBizfYPVb233svFoG5c_S4munSsJc-U";
const SHEET_NAME = "Feuille 2";

export type LogEntry = {
  column: string;
  value: any;
};

async function getSheetId() {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === SHEET_NAME
    );

    if (!sheet?.properties?.sheetId) {
      console.error(
        `Sheet "${SHEET_NAME}" not found in spreadsheet ${spreadsheetId}`
      );
      return;
    }

    return sheet.properties.sheetId;
  } catch (error) {
    console.error("Error getting sheet ID:", error);
    throw error;
  }
}

export async function appendLogs(logs: LogEntry[]) {
  try {
    const sheetId = await getSheetId();

    const logsByColumn = logs.reduce(
      (acc, log) => {
        if (!acc[log.column]) {
          acc[log.column] = [];
        }
        acc[log.column].push(log.value);
        return acc;
      },
      {} as Record<string, any[]>
    );

    const promises = Object.entries(logsByColumn).map(
      async ([column, values]) => {
        const formattedValues = values.map((value) => [
          new Date().toISOString(),
          JSON.stringify(value),
        ]);

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: spreadsheetId,
          range: `${SHEET_NAME}!${column}:${column}`,
          valueInputOption: "RAW",
          requestBody: {
            values: formattedValues,
          },
        });

        return response.data;
      }
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error("Error appending logs to Google Sheets:", error);
    throw error;
  }
}

export async function writeLog(log: LogEntry) {
  return appendLogs([log]);
}

export async function updateLastRow(logs: LogEntry[]) {
  try {
    const sheetId = await getSheetId();

    const logsByColumn = logs.reduce(
      (acc, log) => {
        if (!acc[log.column]) {
          acc[log.column] = [];
        }
        acc[log.column].push(log.value);
        return acc;
      },
      {} as Record<string, any[]>
    );

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${SHEET_NAME}!A:Z`,
    });

    const lastRow = response.data.values?.length || 1;
    const range = `${SHEET_NAME}!A${lastRow}:Z${lastRow}`;

    const rowValues = new Array(26).fill(null);
    Object.entries(logsByColumn).forEach(([column, values]) => {
      const columnIndex = column.charCodeAt(0) - 65;
      if (values.length > 0) {
        const value =
          typeof values[0] === "object"
            ? JSON.stringify(values[0])
            : String(values[0]);
        rowValues[columnIndex] = value;
      }
    });

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowValues],
      },
    });

    return updateResponse.data;
  } catch (error) {
    console.error("Error updating last row in Google Sheets:", error);
    throw error;
  }
}
