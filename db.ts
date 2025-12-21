
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GuiaDigital_SO_DB', 2);
    
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('user_state')) {
        db.createObjectStore('user_state', { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addToUserStore = async (username: string, data: any) => {
  const db: any = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('user_state', 'readwrite');
    const store = tx.objectStore('user_state');
    const request = store.put({ username, ...data });
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getUserState = async (username: string) => {
  const db: any = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('user_state', 'readonly');
    const store = tx.objectStore('user_state');
    const request = store.get(username);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

export const addToSyncQueue = async (data: any) => {
  const db: any = await initDB();
  const tx = db.transaction('sync_queue', 'readwrite');
  tx.objectStore('sync_queue').add({ ...data, timestamp: Date.now() });
};
