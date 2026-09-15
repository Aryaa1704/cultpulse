// Google Workspace APIs Service (Drive, Sheets, Calendar, Contacts/People, Gmail)

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface ContactPerson {
  resourceName: string;
  displayName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
}

// -------------------------------------------------------------
// 1. Google Drive API
// -------------------------------------------------------------
export async function listDriveFiles(token: string): Promise<DriveFile[]> {
  const params = new URLSearchParams({
    pageSize: '20',
    fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)',
    orderBy: 'modifiedTime desc',
  });

  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Drive files');
  }

  const data = await res.json();
  return data.files || [];
}

export async function uploadFileToDrive(
  token: string,
  filename: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFile> {
  const metadata = {
    name: filename,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload file to Drive');
  }

  return await res.json();
}

export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to delete Drive file');
  }
}

// -------------------------------------------------------------
// 2. Google Sheets API
// -------------------------------------------------------------
export async function createFitnessSpreadsheet(
  token: string,
  title: string,
  initialRows: (string | number)[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: {
            title: 'CultPulse Logs',
            gridProperties: { rowCount: 100, columnCount: 10 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Sheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Populate rows
  if (initialRows && initialRows.length > 0) {
    await appendSheetRows(token, spreadsheetId, 'CultPulse Logs!A1', initialRows);
  }

  return {
    spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl,
  };
}

export async function appendSheetRows(
  token: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
): Promise<any> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to append rows to Sheet');
  }

  return await res.json();
}

export async function getSpreadsheetValues(
  token: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to read Sheet values');
  }

  const data = await res.json();
  return data.values || [];
}

// -------------------------------------------------------------
// 3. Google Calendar API
// -------------------------------------------------------------
export async function listCalendarEvents(token: string): Promise<CalendarEvent[]> {
  const timeMin = new Date().toISOString();
  const params = new URLSearchParams({
    timeMin,
    maxResults: '15',
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Calendar events');
  }

  const data = await res.json();
  return data.items || [];
}

export async function createCalendarWorkoutEvent(
  token: string,
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string
): Promise<CalendarEvent> {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
            { method: 'popup', minutes: 10 },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to schedule Calendar event');
  }

  return await res.json();
}

export async function deleteCalendarEvent(token: string, eventId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to delete Calendar event');
  }
}

// -------------------------------------------------------------
// 4. Google People (Contacts) API
// -------------------------------------------------------------
export async function listGoogleContacts(token: string): Promise<ContactPerson[]> {
  const params = new URLSearchParams({
    personFields: 'names,emailAddresses,phoneNumbers,photos',
    pageSize: '25',
  });

  const res = await fetch(
    `https://people.googleapis.com/v1/people/me/connections?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Contacts');
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections.map((c: any) => ({
    resourceName: c.resourceName,
    displayName:
      c.names?.[0]?.displayName ||
      c.emailAddresses?.[0]?.value ||
      'Unnamed Contact',
    email: c.emailAddresses?.[0]?.value,
    phone: c.phoneNumbers?.[0]?.value,
    photoUrl: c.photos?.[0]?.url,
  }));
}

// -------------------------------------------------------------
// 5. Gmail API
// -------------------------------------------------------------
export async function sendGmailMessage(
  token: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string }> {
  // Compose RFC 2822 email message
  const rawEmail = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ].join('\r\n');

  const base64Encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64Encoded }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to send Gmail message');
  }

  return await res.json();
}

export async function listRecentGmailMessages(token: string): Promise<GmailMessageItem[]> {
  const params = new URLSearchParams({
    maxResults: '8',
    q: 'CultPulse OR Workout OR Fitness OR Nutrition',
  });

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    // If query returned no matching filter, fallback to all recent
    const fallbackRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!fallbackRes.ok) return [];
    const fallbackData = await fallbackRes.json();
    return fallbackData.messages || [];
  }

  const data = await res.json();
  return data.messages || [];
}
