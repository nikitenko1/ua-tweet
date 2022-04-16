import axios from 'axios';

export const getChatList = () => async (dispatch) => {
  const token = JSON.parse(localStorage.getItem('token'));

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axios.get(`/api/chat`, config);

    dispatch({ type: 'CHAT_LIST', payload: data });
  } catch (err) {
    console.log(err);
  }
};

export const getUnreadChatsCount = () => async (dispatch) => {
  const token = JSON.parse(localStorage.getItem('token'));

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axios.get(`/api/chat?unreadOnly=true`, config);

    dispatch({ type: 'UNREAD_MESSAGES_COUNT', payload: data.length });
  } catch (err) {
    console.log(err);
  }
};
