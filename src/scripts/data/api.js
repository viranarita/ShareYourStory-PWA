import CONFIG from '../config';

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

async function registerUser({ name, email, password }) {
  const response = await fetch(`${CONFIG.BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

async function loginUser({ email, password }) {
  const response = await fetch(`${CONFIG.BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson.loginResult;
}

async function fetchAllStories() {
  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson.listStory;
}

async function addNewStory(storyData) {
  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: storyData,
  });
  const responseJson = await response.json();
  if (responseJson.error) {
    throw new Error(responseJson.message);
  }
  return responseJson;
}

async function deleteStory(id) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  } catch (error) {
    console.error('Gagal menghapus cerita:', error);
    return { error: true, message: error.message };
  }
}

export {
  registerUser, loginUser, fetchAllStories, addNewStory, deleteStory,
};