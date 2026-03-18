import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

function getCurrentMonthPrefix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}

function parseSequenceFromId(txnId: string): number {
  const parts = txnId.split('-');
  if (parts.length === 2) {
    return parseInt(parts[1], 10);
  }
  return 0;
}

function getMonthPrefixFromId(txnId: string): string {
  const parts = txnId.split('-');
  return parts[0] || '';
}

export async function generateTxnId(): Promise<string> {
  const currentMonthPrefix = getCurrentMonthPrefix();

  try {
    const q = query(collection(db, 'loans'), orderBy('__name__', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return `${currentMonthPrefix}-001`;
    }

    const lastDoc = snapshot.docs[0];
    const lastTxnId = lastDoc.id;
    const lastMonthPrefix = getMonthPrefixFromId(lastTxnId);
    const lastSequence = parseSequenceFromId(lastTxnId);

    let newSequenceNumber = 1;
    if (lastMonthPrefix === currentMonthPrefix) {
      newSequenceNumber = lastSequence + 1;
    }

    const newSequence = String(newSequenceNumber).padStart(3, '0');
    return `${currentMonthPrefix}-${newSequence}`;
  } catch (error) {
    console.error('Error generating TXN_ID:', error);
    return `${currentMonthPrefix}-${String(Date.now() % 1000).padStart(3, '0')}`;
  }
}
