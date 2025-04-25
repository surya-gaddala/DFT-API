// Data management utilities for tests and environments

import { getCollections, saveCollection, deleteCollection as deleteCollectionFromStorage } from './collectionManager';

// Mock data for development
const MOCK_DATA = {
  collections: [
    {
      id: '1',
      name: 'Sample Collection 1',
      description: 'A collection of API endpoints for testing',
      requests: [
        {
          id: '1',
          name: 'Get Users',
          method: 'GET',
          url: 'https://api.example.com/users',
          headers: { 'Content-Type': 'application/json' },
          body: ''
        },
        {
          id: '2',
          name: 'Create User',
          method: 'POST',
          url: 'https://api.example.com/users',
          headers: { 'Content-Type': 'application/json' },
          body: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
        }
      ]
    }
  ],
  tests: [
    {
      id: '1',
      name: 'User API Tests',
      status: 'passed',
      lastRun: '2024-03-15T10:00:00Z',
      steps: [
        { id: '1', name: 'Get Users Test', status: 'passed' },
        { id: '2', name: 'Create User Test', status: 'passed' }
      ]
    }
  ],
  environments: [
    {
      id: '1',
      name: 'Development',
      variables: {
        'API_URL': 'https://dev-api.example.com',
        'API_KEY': 'dev-key-123'
      }
    },
    {
      id: '2',
      name: 'Production',
      variables: {
        'API_URL': 'https://api.example.com',
        'API_KEY': 'prod-key-456'
      }
    }
  ],
  flows: [
    {
      id: '1',
      name: 'User Registration Flow',
      steps: [
        { id: '1', name: 'Create User', requestId: '2' },
        { id: '2', name: 'Verify User', requestId: '1' }
      ]
    }
  ],
  groups: [
    {
      id: '1',
      name: 'User Management',
      items: [
        { id: '1', type: 'collection', name: 'User APIs' },
        { id: '1', type: 'flow', name: 'User Registration Flow' }
      ]
    }
  ],
  history: [
    {
      id: '1',
      timestamp: '2024-03-15T10:00:00Z',
      method: 'GET',
      url: 'https://api.example.com/users',
      status: 200,
      duration: 123
    },
    {
      id: '2',
      timestamp: '2024-03-15T10:01:00Z',
      method: 'POST',
      url: 'https://api.example.com/users',
      status: 201,
      duration: 156
    }
  ]
};

// Helper function to simulate API delay
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 200));

// Helper function to safely parse JSON
const safeResponseJson = async (response) => {
  if (!response.ok) {
    // If response is not ok, try to get text, otherwise throw standard error
    const errorText = await response.text().catch(() => `HTTP error! status: ${response.status}`);
     console.error('API Error Response:', errorText); // Log the actual response
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}...`); // Include snippet of error
  }
  // Check content type before parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
  } else {
      const responseText = await response.text();
      console.error("Received non-JSON response:", responseText); // Log non-JSON response
      throw new Error('Received non-JSON response from API');
  }
};

// Test Management
export const fetchTests = async () => {
  try {
    await simulateDelay();
    return MOCK_DATA.tests;
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
};

export const createTest = async (testData) => {
  try {
    await simulateDelay();
    const newTest = {
      id: Date.now().toString(),
      ...testData,
      status: 'pending',
      lastRun: null
    };
    MOCK_DATA.tests.push(newTest);
    return newTest;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
};

export const runTest = async (testId) => {
  try {
    await simulateDelay();
    const test = MOCK_DATA.tests.find(t => t.id === testId);
    if (!test) throw new Error('Test not found');
    
    test.status = Math.random() > 0.2 ? 'passed' : 'failed';
    test.lastRun = new Date().toISOString();
    return test;
  } catch (error) {
    console.error('Error running test:', error);
    throw error;
  }
};

// Environment Management
export const fetchEnvironments = async () => {
  try {
    await simulateDelay();
    return MOCK_DATA.environments;
  } catch (error) {
    console.error('Error fetching environments:', error);
    return [];
  }
};

export const createEnvironment = async (envData) => {
  try {
    const response = await fetch('/api/environments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error creating environment:', error);
    throw error; // Re-throw
  }
};

export const updateEnvironment = async (envId, envData) => {
  try {
    const response = await fetch(`/api/environments/${envId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(envData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error updating environment:', error);
    throw error; // Re-throw
  }
};

export const deleteEnvironment = async (envId) => {
  try {
    const response = await fetch(`/api/environments/${envId}`, { method: 'DELETE' });
     if (!response.ok) { // Check status for non-JSON success responses
        const errorText = await response.text().catch(() => `HTTP error! status: ${response.status}`);
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}...`);
     }
    return true; // Assume success if no error
  } catch (error) {
    console.error('Error deleting environment:', error);
    throw error; // Re-throw
  }
};

// Flow Management
export const fetchFlows = async () => {
  try {
    await simulateDelay();
    return MOCK_DATA.flows;
  } catch (error) {
    console.error('Error fetching flows:', error);
    return [];
  }
};

export const createFlow = async (flowData) => {
  try {
    const response = await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error creating flow:', error);
    throw error; // Re-throw
  }
};

export const updateFlow = async (flowId, flowData) => {
  try {
    const response = await fetch(`/api/flows/${flowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error updating flow:', error);
    throw error; // Re-throw
  }
};

export const deleteFlow = async (flowId) => {
  try {
     const response = await fetch(`/api/flows/${flowId}`, { method: 'DELETE' });
     if (!response.ok) {
        const errorText = await response.text().catch(() => `HTTP error! status: ${response.status}`);
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}...`);
     }
    return true; // Assume success
  } catch (error) {
    console.error('Error deleting flow:', error);
    throw error; // Re-throw
  }
};

export const executeFlow = async (flowId) => {
  try {
    const response = await fetch(`/api/flows/${flowId}/execute`, { method: 'POST' });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error executing flow:', error);
    throw error; // Re-throw
  }
};

// Group Management
export const fetchGroups = async () => {
  try {
    await simulateDelay();
    return MOCK_DATA.groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error creating group:', error);
    throw error; // Re-throw
  }
};

export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await fetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error updating group:', error);
    throw error; // Re-throw
  }
};

export const deleteGroup = async (groupId) => {
  try {
     const response = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' });
     if (!response.ok) {
        const errorText = await response.text().catch(() => `HTTP error! status: ${response.status}`);
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}...`);
     }
    return true; // Assume success
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error; // Re-throw
  }
};

export const addToGroup = async (groupId, itemId, itemType) => {
  try {
    const response = await fetch(`/api/groups/${groupId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, itemType })
    });
    return await safeResponseJson(response);
  } catch (error) {
    console.error('Error adding item to group:', error);
    throw error; // Re-throw
  }
};

export const removeFromGroup = async (groupId, itemId) => {
  try {
     const response = await fetch(`/api/groups/${groupId}/items/${itemId}`, { method: 'DELETE' });
     if (!response.ok) {
        const errorText = await response.text().catch(() => `HTTP error! status: ${response.status}`);
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 100)}...`);
     }
    return true; // Assume success
  } catch (error) {
    console.error('Error removing item from group:', error);
    throw error; // Re-throw
  }
};

// Collection Management
export const fetchCollections = async () => {
  try {
    const { collections } = getCollections();
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

export const createCollection = async (collectionData) => {
  try {
    const { collections } = saveCollection(collectionData.name, {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      name: collectionData.name,
      description: collectionData.description || ''
    });
    return collections[collections.length - 1];
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

export const updateCollection = async (collectionId, collectionData) => {
  try {
    const { collections } = getCollections();
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) throw new Error('Collection not found');
    
    collections[index] = {
      ...collections[index],
      ...collectionData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('apiCollections', JSON.stringify({ collections }));
    return collections[index];
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

export const deleteCollection = async (collectionId) => {
  try {
    const { collections } = getCollections();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    deleteCollectionFromStorage(collection.name);
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

// Request Management
export const createRequest = async (collectionId, requestData) => {
  try {
    await simulateDelay();
    const collection = MOCK_DATA.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');

    const newRequest = {
      id: Date.now().toString(),
      ...requestData
    };
    collection.requests.push(newRequest);
    return newRequest;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const updateRequest = async (collectionId, requestId, requestData) => {
  try {
    await simulateDelay();
    const collection = MOCK_DATA.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    const requestIndex = collection.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    
    collection.requests[requestIndex] = {
      ...collection.requests[requestIndex],
      ...requestData
    };
    return collection.requests[requestIndex];
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

export const deleteRequest = async (collectionId, requestId) => {
  try {
    await simulateDelay();
    const collection = MOCK_DATA.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    const requestIndex = collection.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    
    collection.requests.splice(requestIndex, 1);
    return true;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

export const duplicateRequest = async (collectionId, requestId) => {
  try {
    await simulateDelay();
    const collection = MOCK_DATA.collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    const request = collection.requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    
    const newRequest = {
      ...request,
      id: Date.now().toString(),
      name: `${request.name} (Copy)`
    };
    collection.requests.push(newRequest);
    return newRequest;
  } catch (error) {
    console.error('Error duplicating request:', error);
    throw error;
  }
};

export const moveRequest = async (requestId, sourceCollectionId, targetCollectionId) => {
  try {
    await simulateDelay();
    const sourceCollection = MOCK_DATA.collections.find(c => c.id === sourceCollectionId);
    if (!sourceCollection) throw new Error('Source collection not found');
    
    const targetCollection = MOCK_DATA.collections.find(c => c.id === targetCollectionId);
    if (!targetCollection) throw new Error('Target collection not found');
    
    const requestIndex = sourceCollection.requests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error('Request not found');
    
    const request = sourceCollection.requests[requestIndex];
    sourceCollection.requests.splice(requestIndex, 1);
    targetCollection.requests.push(request);
    return request;
  } catch (error) {
    console.error('Error moving request:', error);
    throw error;
  }
};

// Import/Export functions
export const importCollection = async (collectionData) => {
  try {
    const { collections } = saveCollection(collectionData.name, {
      method: 'GET',
      url: '',
      headers: {},
      body: '',
      name: collectionData.name,
      description: collectionData.description || '',
      requests: collectionData.requests || []
    });
    return collections[collections.length - 1];
  } catch (error) {
    console.error('Error importing collection:', error);
    throw error;
  }
};

export const exportCollection = async (collectionId) => {
  try {
    const { collections } = getCollections();
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    return collection;
  } catch (error) {
    console.error('Error exporting collection:', error);
    throw error;
  }
};

// History Management
export const fetchHistory = async () => {
  try {
    await simulateDelay();
    return MOCK_DATA.history;
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await simulateDelay();
    MOCK_DATA.history = [];
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
}; 