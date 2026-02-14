#!/usr/bin/env node
import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const keyTrimmed = key.trim();
      if (keyTrimmed === 'HTTP_PROXY' || keyTrimmed === 'HTTPS_PROXY') continue;
      envVars[keyTrimmed] = valueParts.join('=').trim();
    }
  }
}

const server = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, ...envVars },
});

let messageId = 1;
function sendRequest(method, params = {}) {
  const request = { jsonrpc: '2.0', id: messageId++, method, params };
  server.stdin.write(JSON.stringify(request) + '\n');
  console.log(`→ ${method} (id=${request.id})`);
}

let buffer = '';
server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        if (!response.timestamp) handleResponse(response);
      } catch (e) { }
    }
  }
});

let dbData = null;

function handleResponse(response) {
  if (response.error) {
    console.error('Error:', response.error);
    server.stdin.end();
    process.exit(1);
  }

  const id = response.id;

  if (id === 1) {
    sendRequest('tools/list');
  } else if (id === 2) {
    console.log('\n=== Step 1: Get page blocks ===');
    sendRequest('tools/call', { name: 'notion_retrieve_block_children', arguments: { block_id: '3076168036b9811e9427e34eaebed6df' } });
  } else if (id === 3) {
    const res = JSON.parse(response.result.content[0].text);
    console.log('Blocks:', res.results?.length || 0);
    const paraBlock = res.results?.find(b => b.type === 'paragraph');
    if (paraBlock) {
      console.log('Current text:', paraBlock.paragraph?.rich_text?.[0]?.text?.content || '(empty)');
      console.log('\n=== Step 2: Update to "今は島本" ===');
      sendRequest('tools/call', {
        name: 'notion_update_page',
        arguments: {
          page_id: '3076168036b9811e9427e34eaebed6df',
          properties: {
            title: { title: [{ text: { content: '今は島本' } }] }
          }
        }
      });
    }
  } else if (id === 4) {
    console.log('✓ Updated!');
    console.log('\n=== Step 3: Query DB ===');
    sendRequest('tools/call', {
      name: 'notion_query_database',
      arguments: { database_id: '3076168036b9810aba4fdc341b4dbf8b', save_to_file: true }
    });
  } else if (id === 5) {
    const res = JSON.parse(response.result.content[0].text);
    dbData = res;
    console.log('DB saved to:', res.content_saved_to);
    console.log('Items:', res.results?.length || 0);

    // Find items with empty 時間
    const emptyTimeItems = res.results?.filter(item => {
      const timeProp = item.properties?.['時間'];
      return !timeProp || !timeProp.date;
    }) || [];

    console.log('Empty 時間:', emptyTimeItems.length);

    if (emptyTimeItems.length > 0) {
      console.log('\n=== Step 4: Fill times ===');
      updateNextItem(0, emptyTimeItems);
    } else {
      console.log('\n✓ All done!');
      server.stdin.end();
      process.exit(0);
    }
  } else if (id >= 6) {
    console.log(`✓ Updated item ${id - 5}`);
  }
}

let updateQueue = [];
let updateIndex = 0;

function updateNextItem(index, items) {
  if (index >= items.length) {
    console.log('\n✓ All times filled!');
    server.stdin.end();
    process.exit(0);
    return;
  }

  const item = items[index];
  const name = item.properties?.['名前']?.title?.[0]?.text?.content || 'Item';
  const baseTime = new Date('2026-01-01T09:00:00');
  baseTime.setHours(9 + index);

  console.log(`Updating: ${name}`);

  sendRequest('tools/call', {
    name: 'notion_update_page',
    arguments: {
      page_id: item.id.replace(/-/g, ''),
      properties: {
        '時間': {
          date: {
            start: baseTime.toISOString().split('.')[0] + '+09:00'
          }
        }
      }
    }
  });

  setTimeout(() => updateNextItem(index + 1, items), 500);
}

sendRequest('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'mission', version: '1.0.0' }
});

server.on('close', (code) => process.exit(code || 0));
