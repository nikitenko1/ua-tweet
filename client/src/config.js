const token = JSON.parse(localStorage.getItem('token'));

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
