const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const users = ['Anna', 'Ben', 'Clara', 'David', 'Emilia', 'Felix', 'Greta', 'Jonas', 'Lena', 'Max'];
const dialogues = [
  ['Hast du morgen Zeit für einen Kaffee?', 'Gerne! Passt dir der Nachmittag?'],
  ['Wie war dein Wochenende?', 'Sehr schön, ich war mit Freunden am See.'],
  ['Hast du die Nachricht von heute Morgen gesehen?', 'Ja, ich kümmere mich gleich darum.'],
  ['Wollen wir heute Abend zusammen kochen?', 'Gute Idee. Ich bringe frisches Gemüse mit.'],
  ['Der Zug kommt heute zehn Minuten spaeter.', 'Danke fuer die Info, ich warte am Eingang.'],
  ['Ich habe ein tolles Buch entdeckt.', 'Schick mir den Titel, ich suche es nachher.'],
  ['Gehen wir am Samstag auf den Markt?', 'Ja, am Vormittag passt es mir gut.'],
  ['Das Wetter soll morgen richtig schoen werden.', 'Dann machen wir einen langen Spaziergang.'],
  ['Kannst du mir die Adresse noch einmal schicken?', 'Klar, ich sende sie dir sofort.'],
  ['Das Essen gestern war wirklich lecker.', 'Fand ich auch. Wir sollten bald wieder hingehen.'],
];

async function seedDemoData() {
  const pool = new Pool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS demo_seed_runs (
        seed_name TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const priorRun = await client.query('SELECT 1 FROM demo_seed_runs WHERE seed_name = $1', ['german-demo-v1']);
    if (priorRun.rowCount > 0) {
      await client.query('COMMIT');
      console.log('Demo seed already present; skipping.');
      return;
    }

    const passwordHash = await bcrypt.hash('Demo123!', 10);
    const userIds = [];
    for (const username of users) {
      const result = await client.query(
        `INSERT INTO users (username, password_hash) VALUES ($1, $2)
         ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
         RETURNING id`,
        [username, passwordHash]
      );
      userIds.push(result.rows[0].id);
    }

    let conversationIndex = 0;
    for (let first = 0; first < userIds.length; first += 1) {
      for (let second = first + 1; second < userIds.length; second += 1) {
        const firstId = userIds[first];
        const secondId = userIds[second];
        await client.query(
          `INSERT INTO contacts (requester_id, addressee_id, status)
           VALUES ($1, $2, 'accepted')
           ON CONFLICT (requester_id, addressee_id)
           DO UPDATE SET status = 'accepted', updated_at = NOW()`,
          [firstId, secondId]
        );

        const [firstMessage, reply] = dialogues[conversationIndex % dialogues.length];
        const minutesAgo = conversationIndex * 4;
        await client.query(
          `INSERT INTO messages (sender_id, recipient_id, content, created_at)
           VALUES ($1, $2, $3, NOW() - ($4 * INTERVAL '1 minute')),
                  ($2, $1, $5, NOW() - (($4 - 1) * INTERVAL '1 minute'))`,
          [firstId, secondId, firstMessage, minutesAgo + 2, reply]
        );
        conversationIndex += 1;
      }
    }

    await client.query('INSERT INTO demo_seed_runs (seed_name) VALUES ($1)', ['german-demo-v1']);
    await client.query('COMMIT');
    console.log(`Seeded ${users.length} demo users and ${conversationIndex} German conversations.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDemoData().catch((error) => {
  console.error('Demo database seed failed:', error);
  process.exitCode = 1;
});