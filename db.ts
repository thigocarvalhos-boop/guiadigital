
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve) => {
    const request = indexedDB.open('GUIA_PROTOCOLO_DB', 2);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('operador')) {
        db.createObjectStore('operador', { keyPath: 'username' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveOperador = async (data: any) => {
  const db = await initDB();
  const tx = db.transaction('operador', 'readwrite');
  tx.objectStore('operador').put(data);
};

export const getOperador = async (username: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('operador', 'readonly');
    const request = tx.objectStore('operador').get(username);
    request.onsuccess = () => resolve(request.result || null);
  });
};
