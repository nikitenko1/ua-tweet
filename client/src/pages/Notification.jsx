import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LikeIcon, RetweetIcon, TwitterIcon } from '../components/forms/Icon';
import Spinner from '../components/forms/Spinner';
import LoginAlert from '../components/AlertLogin';
import { getUnreadNotification } from '../redux/actions/notifyAction';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loginAlert, setLoginAlert] = useState(false);
  const [loginInfo, setLoginInfo] = useState({});
  const [loginTime, setLoginTime] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    const getNotification = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/notification`, config);
        setLoading(false);
        setNotifications(data);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    };
    getNotification();
  }, [config]);

  function getNotificationUrl(notification) {
    var url = '#';

    if (
      notification.notificationType === 'retweet' ||
      notification.notificationType === 'postLike' ||
      notification.notificationType === 'reply'
    ) {
      url = `/post/${notification.entityId}`;
    }

    if (notification.notificationType === 'follow') {
      url = `/profile/${notification.userTo.username}`;
    }

    return url;
  }

  const markAsOpened = async (id) => {
    await axios.put(`/notification/${id}/markasopened`, {}, config);
    dispatch(getUnreadNotification());
  };

  return (
    <>
      <div>
        <div className="main__header">
          <span>Notifications</span>
        </div>

        <div>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {notifications.length === 0 ? (
                <div className="text-center mt-15">
                  <span className="block font-700 font-md text-align">
                    You don't have notifications yet
                  </span>
                  <span className="block text-secondary">
                    When you have , it will show up here
                  </span>
                </div>
              ) : (
                <>
                  {notifications.map((notification) =>
                    notification?.notificationType === 'new login' ? (
                      <div
                        key={notification._id}
                        className={`p-10 postHover border-bottom flex-row items-center pointer ${
                          !notification.opened && 'bg-primaryBg'
                        }`}
                        onClick={() => {
                          markAsOpened(notification._id);
                          setLoginAlert(true);
                          setLoginInfo(notification?.loginInfo);
                          setLoginTime(notification?.createdAt);
                        }}
                      >
                        <TwitterIcon />
                        <div className="ml-15">
                          There was a login to your account from a new device
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={getNotificationUrl(notification)}
                        key={notification._id}
                        onClick={() => markAsOpened(notification._id)}
                      >
                        <div
                          className={`p-10 postHover border-bottom flex-row items-center ${
                            !notification.opened && 'bg-primaryBg'
                          }`}
                        >
                          {notification.notificationType === 'retweet' && (
                            <div className="flex-row">
                              <span className="pr-15">
                                <RetweetIcon className="fill-green" />
                              </span>
                              <div className="flex-1 flex-col">
                                <img
                                  src={notification.userFrom.profilePhoto.url}
                                  alt="pp"
                                  className="border-round mr-10"
                                  width="20"
                                  height="20"
                                />
                                <span className="mt-10">{`${notification.userFrom.name} retweeted your tweet`}</span>
                              </div>
                            </div>
                          )}
                          {notification.notificationType === 'postLike' && (
                            <div className="flex-row">
                              <span className="pr-15">
                                <LikeIcon className="fill-pink" />
                              </span>
                              <div className="flex-1 flex-col">
                                <img
                                  src={notification.userFrom.profilePhoto.url}
                                  alt="pp"
                                  className="border-round mr-10"
                                  width="20"
                                  height="20"
                                />
                                <span className="mt-10">{`${notification.userFrom.name} liked your tweet`}</span>
                              </div>
                            </div>
                          )}
                          {notification.notificationType === 'reply' && (
                            <>
                              <img
                                src={notification.userFrom.profilePhoto.url}
                                alt="pp"
                                className="border-round mr-10"
                                width="30"
                                height="30"
                              />
                              <span>{`${notification.userFrom.name} replied to one of your tweet`}</span>
                            </>
                          )}
                          {notification.notificationType === 'follow' && (
                            <>
                              <img
                                src={notification.userFrom?.profilePhoto.url}
                                alt="pp"
                                className="border-round mr-10"
                                width="30"
                                height="30"
                              />
                              <span>{`${notification.userFrom?.name} followed you`}</span>
                            </>
                          )}
                        </div>
                      </Link>
                    )
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      {loginAlert && (
        <LoginAlert
          handleClose={() => setLoginAlert(false)}
          loginInfo={loginInfo}
          loginTime={loginTime}
        />
      )}
    </>
  );
};

export default Notification;
