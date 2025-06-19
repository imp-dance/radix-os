export const fsWorker = `
let db;

self.onmessage = function(e) {
  switch(e.data.action) {
    case 'open':
      openDatabase("fs");
      break;
    case 'add':
      addData(e.data.data);
      break;
    case 'get':
      getData(e.data.key);
      break;
    case "delete":
      deleteData(e.data.key);
      break;
    case "clear":
      deleteDatabase("fs");
  }
};

function deleteData(key) {
  if (!db) {
    self.postMessage({success: false, action: "delete", data: "Database not opened"});
    return;
  }
  let transaction = db.transaction(['myStore'], 'readwrite');
  let objectStore = transaction.objectStore('myStore');
  let request = objectStore.delete(key);
  request.onerror = function(event) {
    self.postMessage({success: false, action: "delete", data: event.target.error});
  };
  request.onsuccess = function(event) {
    self.postMessage({success: true, action: "delete"});
  }
}
function deleteDatabase(dbName) {
  let request = indexedDB.deleteDatabase(dbName);

  request.onerror = function(event) {
    self.postMessage({success: false, action: "clear"});
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    self.postMessage({success: true, action: "clear"});
  };
}

function openDatabase(dbName) {
  let request = indexedDB.open(dbName, 1);

  request.onerror = function(event) {
    self.postMessage({success: false, action: "open"});
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    self.postMessage({success: true, action: "open"});
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore = db.createObjectStore('myStore', { keyPath: 'id' });
    self.postMessage({success: true, action: "open"});
  };
}

function addData(data) {
  let transaction = db.transaction(['myStore'], 'readwrite');
  let objectStore = transaction.objectStore('myStore');
  let request = objectStore.add(data);

  request.onerror = function(event) {
    if (event.target.error.name === "ConstraintError") {
      // update existing record if it already exists
      let transaction = db.transaction(['myStore'], 'readwrite');
      let objectStore = transaction.objectStore('myStore');
      let updateRequest = objectStore.put(data);
      updateRequest.onerror = function(event) {
        self.postMessage({success: false, action: "add", data: event.target.error});
      };
      updateRequest.onsuccess = function(event) {
        self.postMessage({success: true, action: "add"});
      };
    }else{
      self.postMessage({success: false, action: "add", data: event.target.error});
    }
  };

  request.onsuccess = function(event) {
    self.postMessage({success: true, action: "add"});
  };

}

function getData(key) {
  let transaction = db.transaction(['myStore'], 'readonly');
  let objectStore = transaction.objectStore('myStore');
  let request = objectStore.get(key);

  request.onerror = function(event) {
    self.postMessage({success: false, action: "get", data: event.target.error});
  };

  request.onsuccess = function(event) {
    self.postMessage({success: true, action: "get", data: request.result});
  };
}`;

const fsWorkerBlob = new Blob([fsWorker], {
  type: "application/javascript",
});

const workerUrl =
  typeof window !== "undefined"
    ? window.URL.createObjectURL(fsWorkerBlob)
    : "";

const fsWorkerInstance = new Worker(workerUrl);

async function openFsDb() {
  return new Promise((resolve, reject) => {
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        success?: boolean;
        action: "get" | "add" | "open";
      };
      if (data.action === "open") {
        fsWorkerInstance.removeEventListener(
          "message",
          listener
        );
        if (data.success) {
          resolve(true);
        } else {
          reject(
            new Error("Failed to open file system database")
          );
        }
      }
    };
    fsWorkerInstance.addEventListener("message", listener);
    fsWorkerInstance.postMessage({
      action: "open",
      dbName: "fs",
    });
  });
}

async function getFsData(key: string) {
  return new Promise((resolve, reject) => {
    fsWorkerInstance.postMessage({
      action: "get",
      key,
    });
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        success?: boolean;
        action: "get" | "add" | "open";
        data?: { data: string };
      };
      if (data.action === "get") {
        fsWorkerInstance.removeEventListener(
          "message",
          listener
        );
        if (data.success && data.data) {
          resolve(JSON.parse(data.data.data as string));
        } else {
          reject(new Error("Failed to get file system data"));
        }
      }
    };
    fsWorkerInstance.addEventListener("message", listener);
  });
}

async function setFsData(key: string, value: string) {
  return new Promise((resolve, reject) => {
    fsWorkerInstance.postMessage({
      action: "add",
      data: { id: key, data: value },
    });
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        success?: boolean;
        action: "get" | "add" | "open";
      };
      if (data.action === "add") {
        fsWorkerInstance.removeEventListener(
          "message",
          listener
        );
        if (data.success) {
          resolve(true);
        } else {
          console.log(data);
          reject(new Error("Failed to set file system data"));
        }
      }
    };
    fsWorkerInstance.addEventListener("message", listener);
  });
}

async function removeFsData(key: string) {
  return new Promise((resolve, reject) => {
    fsWorkerInstance.postMessage({
      action: "delete",
      key,
    });
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        success?: boolean;
        action: "get" | "add" | "open" | "delete";
      };
      if (data.action === "delete") {
        fsWorkerInstance.removeEventListener(
          "message",
          listener
        );
        if (data.success) {
          resolve(true);
        } else {
          reject(new Error("Failed to remove file system data"));
        }
      }
    };
    fsWorkerInstance.addEventListener("message", listener);
  });
}

async function clearFsDb() {
  return new Promise((resolve, reject) => {
    const listener = (e: MessageEvent) => {
      const data = e.data as {
        success?: boolean;
        action: "get" | "add" | "open" | "delete" | "clear";
      };
      if (data.action === "clear") {
        fsWorkerInstance.removeEventListener(
          "message",
          listener
        );
        if (data.success) {
          resolve(true);
        } else {
          reject(
            new Error("Failed to clear file system database")
          );
        }
      }
    };
    fsWorkerInstance.addEventListener("message", listener);
    fsWorkerInstance.postMessage({
      action: "clear",
    });
  });
}

export const worker = {
  openFsDb,
  getFsData,
  setFsData,
  removeFsData,
  fsWorkerInstance,
  clearFsDb,
};
