import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

// Initialize Firebase Admin SDK
try {
  initializeApp();
} catch (e) {
  console.log('Admin SDK already initialized.');
}
const db = getFirestore();

export const apiShifts = onRequest({ region: 'us-central1' }, async (req, res) => {
  const col = db.collection('shifts');

  if (req.path === '/' || req.path === '') {
    if (req.method === 'GET') {
      const snap = await col.get();
      res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      return;
    }
    if (req.method === 'POST') {
      const doc = await col.add(req.body);
      res.json({ id: doc.id });
      return;
    }
  } else {
    const id = req.path.replace(/^\//, '');
    const ref = col.doc(id);
    switch (req.method) {
      case 'GET': {
        const snap = await ref.get();
        if (snap.exists) {
          res.json({ id, ...snap.data() });
        } else {
          res.status(404).json({ error: 'Not Found' });
        }
        return;
      }
      case 'PUT':
        await ref.set(req.body, { merge: true });
        res.json({ ok: true });
        return;
      case 'DELETE':
        await ref.delete();
        res.json({ ok: true });
        return;
    }
  }
  res.status(405).send('Method Not Allowed');
});
