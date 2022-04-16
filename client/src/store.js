import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { authReducer } from './redux/reducers/authReducer';
import { userReducer } from './redux/reducers/userReducers';
import { exploreReducer } from './redux/reducers/exploreReducers';
import { postsReducer } from './redux/reducers/postReducers';
import { chatReducer } from './redux/reducers/chatReducers';
import { notifyReducer } from './redux/reducers/notifyReducer';
import { socketReducer } from './redux/reducers/socketReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  chatDetails: chatReducer,
  exploreList: exploreReducer,
  postList: postsReducer,
  user: userReducer,
  notificationDetails: notifyReducer,
  socketDetails: socketReducer,
});
const token = JSON.parse(localStorage.getItem('token'));

const initialState = {
  auth: {
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  },
  exploreList: { sports: [], health: [], business: [], science: [] },
  chatDetails: { unreadMessagesCount: 0 },
};

const middleware = [thunk];

export const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);
