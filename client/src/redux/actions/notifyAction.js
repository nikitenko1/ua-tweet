import axios from 'axios';

export const getUnreadNotification = () => async (dispatch) => {
  const token = JSON.parse(localStorage.getItem('token'));

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const { data } = await axios.get(
      `/api/notification?unreadOnly=true`,
      config
    );

    dispatch({ type: 'UNREAD_NOTIFICATIONS', payload: data });
    dispatch({ type: 'UNREAD_NOTIFICATIONS_COUNT', payload: data.length });
  } catch (err) {
    console.log(err);
  }
};
