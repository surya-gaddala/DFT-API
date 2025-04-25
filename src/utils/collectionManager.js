// src/utils/collectionManager.js
export const STORAGE_KEY = 'apiCollections';

// Get all collections
export function getCollections() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { collections: [] };
}

// Create a new collection
export function createCollection(collectionName) {
  const data = getCollections();
  const existingCollection = data.collections.find(c => c.name === collectionName);
  
  if (existingCollection) {
    throw new Error(`Collection "${collectionName}" already exists`);
  }

  const newCollection = {
    name: collectionName,
    id: crypto.randomUUID(),
    type: 'collection',
    requests: [],
    folders: []
  };

  data.collections.push(newCollection);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Save a request to collection
export function saveCollection(collectionName, request) {
  const data = getCollections();
  const collection = data.collections.find(c => c.name === collectionName);
  
  if (!collection) {
    throw new Error(`Collection ${collectionName} not found`);
  }

  if (!collection.requests) {
    collection.requests = [];
  }

  // Check if request already exists
  const existingRequestIndex = collection.requests.findIndex(r => r.name === request.name);
  if (existingRequestIndex !== -1) {
    // Update existing request
    collection.requests[existingRequestIndex] = {
      ...request,
      collectionName // Ensure collection name is preserved
    };
  } else {
    // Add new request
    collection.requests.push({
      ...request,
      collectionName // Ensure collection name is preserved
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return collection;
}

// Get a request from a collection
export function getRequest(collectionName, requestName) {
  const data = getCollections();
  const collection = data.collections.find(c => c.name === collectionName);
  
  if (!collection) {
    throw new Error(`Collection ${collectionName} not found`);
  }

  const request = collection.requests?.find(r => r.name === requestName);
  if (!request) {
    throw new Error(`Request ${requestName} not found in collection ${collectionName}`);
  }

  return {
    ...request,
    collectionName // Ensure collection name is included
  };
}

// Add a folder to a collection
export function addFolder(collectionName, folderName) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    const folder = {
      id: crypto.randomUUID(),
      name: folderName,
      type: 'folder',
      requests: [],
      createdAt: new Date().toISOString()
    };
    data.collections[collectionIndex].folders.push(folder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

// Add a request to a folder
export function addRequestToFolder(collectionName, folderId, request) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    const requestWithId = {
      ...request,
      id: crypto.randomUUID(),
      type: 'request',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const folderIndex = data.collections[collectionIndex].folders.findIndex(f => f.id === folderId);
    if (folderIndex > -1) {
      data.collections[collectionIndex].folders[folderIndex].requests.push(requestWithId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
  return data;
}

// Delete a collection
export function deleteCollection(collectionName) {
  const data = getCollections();
  data.collections = data.collections.filter(c => c.name !== collectionName);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Delete a folder
export function deleteFolder(collectionName, folderId) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    data.collections[collectionIndex].folders = 
      data.collections[collectionIndex].folders.filter(f => f.id !== folderId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  return data;
}

// Delete a request
export function deleteRequest(collectionName, requestId) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    // First try to find and delete from collection's requests
    data.collections[collectionIndex].requests = 
      data.collections[collectionIndex].requests.filter(req => req.id !== requestId);
    
    // Then try to find and delete from folders
    data.collections[collectionIndex].folders.forEach(folder => {
      folder.requests = folder.requests.filter(req => req.id !== requestId);
    });
    
    if (data.collections[collectionIndex].requests.length === 0 && 
        data.collections[collectionIndex].folders.length === 0) {
      data.collections.splice(collectionIndex, 1);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Update a request
export function updateRequest(collectionName, requestId, updatedRequest) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex > -1) {
    // First try to find and update in collection's requests
    const requestIndex = data.collections[collectionIndex].requests.findIndex(
      req => req.id === requestId
    );

    if (requestIndex > -1) {
      data.collections[collectionIndex].requests[requestIndex] = {
        ...data.collections[collectionIndex].requests[requestIndex],
        ...updatedRequest,
        updatedAt: new Date().toISOString()
      };
    } else {
      // If not found in collection's requests, try to find in folders
      data.collections[collectionIndex].folders.forEach(folder => {
        const folderRequestIndex = folder.requests.findIndex(req => req.id === requestId);
        if (folderRequestIndex > -1) {
          folder.requests[folderRequestIndex] = {
            ...folder.requests[folderRequestIndex],
            ...updatedRequest,
            updatedAt: new Date().toISOString()
          };
        }
      });
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Export collections to JSON file
export function exportCollections() {
  const data = getCollections();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `api-collections-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import collections from JSON file
export function importCollections(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.collections && Array.isArray(data.collections)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          resolve(data);
        } else {
          reject(new Error('Invalid file format: Expected "collections" array'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Move a request to a different folder or collection
export function moveRequest(sourceCollectionName, requestId, targetCollectionName, targetFolderId = null) {
  const data = getCollections();
  const sourceCollectionIndex = data.collections.findIndex(c => c.name === sourceCollectionName);
  const targetCollectionIndex = data.collections.findIndex(c => c.name === targetCollectionName);

  if (sourceCollectionIndex === -1 || targetCollectionIndex === -1) {
    throw new Error('Collection not found');
  }

  // Find and remove request from source
  let request = null;
  // Check in collection requests
  const sourceCollection = data.collections[sourceCollectionIndex];
  const requestIndex = sourceCollection.requests.findIndex(r => r.id === requestId);
  
  if (requestIndex > -1) {
    request = { ...sourceCollection.requests[requestIndex] };
    sourceCollection.requests.splice(requestIndex, 1);
  } else {
    // Check in folders
    for (const folder of sourceCollection.folders) {
      const folderRequestIndex = folder.requests.findIndex(r => r.id === requestId);
      if (folderRequestIndex > -1) {
        request = { ...folder.requests[folderRequestIndex] };
        folder.requests.splice(folderRequestIndex, 1);
        break;
      }
    }
  }

  if (!request) {
    throw new Error('Request not found');
  }

  // Add request to target
  if (targetFolderId) {
    const targetFolder = data.collections[targetCollectionIndex].folders.find(f => f.id === targetFolderId);
    if (!targetFolder) {
      throw new Error('Target folder not found');
    }
    targetFolder.requests.push(request);
  } else {
    data.collections[targetCollectionIndex].requests.push(request);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Rename a folder
export function renameFolder(collectionName, folderId, newName) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex === -1) {
    throw new Error('Collection not found');
  }

  const folderIndex = data.collections[collectionIndex].folders.findIndex(f => f.id === folderId);
  if (folderIndex === -1) {
    throw new Error('Folder not found');
  }

  // Check if new name already exists
  const nameExists = data.collections[collectionIndex].folders.some(
    f => f.id !== folderId && f.name === newName
  );
  if (nameExists) {
    throw new Error('A folder with this name already exists');
  }

  data.collections[collectionIndex].folders[folderIndex].name = newName;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// Reorder items in a collection
export function reorderItems(collectionName, updates) {
  const data = getCollections();
  const collectionIndex = data.collections.findIndex(c => c.name === collectionName);

  if (collectionIndex === -1) {
    throw new Error('Collection not found');
  }

  const collection = data.collections[collectionIndex];

  if (updates.folders) {
    collection.folders = updates.folders;
  }
  if (updates.requests) {
    collection.requests = updates.requests;
  }
  if (updates.folderRequests) {
    const { folderId, requests } = updates.folderRequests;
    const folder = collection.folders.find(f => f.id === folderId);
    if (folder) {
      folder.requests = requests;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}