import axios from 'axios';
import { POST_LIST_SUCCESS, POST_LIST_FAIL } from '../constants/postConstants';

export const listPosts = () => async (dispatch) => {
  try {
    const token = JSON.parse(localStorage.getItem('token'));

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.get(`/api/post`, config);

    dispatch({
      type: POST_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: POST_LIST_FAIL,
      payload:
        error.response && error.response.data.msg
          ? error.response.data.msg
          : error.message,
    });
  }
};
