const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const sims = await mongoose.connection.collection('simulations').find({}).toArray();
  console.log('Simulations count:', sims.length);
  for (const s of sims) {
    console.log('ID:', s._id.toString());
    console.log('Title:', s.title);
    console.log('Category:', s.category);
    console.log('Goal:', s.goal);
    if (s.nodes && s.nodes.length > 0) {
      console.log('Start node desc:', s.nodes[0].description);
    }
    console.log('---');
  }
  process.exit(0);
}
check().catch(console.error);
