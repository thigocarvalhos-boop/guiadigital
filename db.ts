
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GuiaDigitalDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('user_state')) {
        db.createObjectStore('user_state', { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addToSyncQueue = async (data: any) => {
  const db: any = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  tx.objectStore('sync_queue').add(data);
  return tx.complete;
};

export const getSyncQueue = async () => {
  const db: any = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const request = tx.objectStore('sync_queue').getAll();
    request.onsuccess = () => resolve(request.result);
  });
};

export const clearSyncItem = async (id: number) => {
  const db: any = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  tx.objectStore('sync_queue').delete(id);
};
