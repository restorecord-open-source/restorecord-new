const sqlite = require('sqlite');

async function setup() {
    const db = await sqlite.open('./database.sqlite');

    await db.migrate({force: 'last'});
}

setup();