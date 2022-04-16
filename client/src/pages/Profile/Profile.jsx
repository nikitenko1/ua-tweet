import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  LocationIcon,
  WebsiteIcon,
} from '../../components/forms/Icon';
import UserTweets from './UserTweets';
import UserRetweets from './UserRetweets';
import UserLikes from './UserLikes';
import EditProfile from './EditProfile';
import UserReplies from './UserReplies';
import FollowAndFollowingButton from '../../components/FollowAndFollowingButton';
import Spinner from '../../components/forms/Spinner';

const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'Novermber',
  'December',
];

const Profile = ({ history, match }) => {
  const [value, setValue] = useState(0);
  const [edit, setEdit] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    if (userDetails && userInfo?.id === userDetails?.id) {
      setUserDetails(userInfo);
    }
  }, [userInfo, userDetails]);

  const { username } = useParams();

  useEffect(() => {
    const getUserDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/user/${username}`, config);
        setUserDetails(data.user);
        setLoading(false);
      } catch (err) {
        console.log(err.response);
        setLoading(false);
      }
    };
    getUserDetails();
    // }
  }, [username, config]);

  const joined = (date) => {
    const d = new Date(date);
    return `${month[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          <div className="main__header">
            <span>{userDetails?.username}</span>
          </div>
          <div className="coverPhoto">
            {/* profilePhoto: { type: Object, default: {
             public_id: '', url: 'https://res.cloudinary.com/dvpy1nsjp/image/upload/v1635570881/sample.jpg',},
             },
            coverPhoto: { type: Object, default: { public_id: '', url: '' } }, */}
            {userDetails?.coverPhoto?.url && (
              <img
                src={userDetails?.coverPhoto.url}
                alt=""
                className="w-100 h-100"
              />
            )}
            <div className="profilePhoto">
              {userDetails?.profilePhoto?.url && (
                <img
                  src={userDetails?.profilePhoto?.url}
                  alt=""
                  className="w-100 h-100 border-round"
                />
              )}
            </div>
          </div>
          <div className="pos-relative h-55">
            {userInfo?.username === userDetails?.username ? (
              <button
                className="outline-button editProfileButton"
                onClick={() => setEdit(true)}
              >
                edit Profile
              </button>
            ) : (
              <>
                <span className="editProfileButton">
                  <FollowAndFollowingButton
                    username={userDetails?.username}
                    id={userDetails?.id}
                  />
                </span>
              </>
            )}
          </div>
          <div className="ml-spacing">
            <span className="block font-800">{userDetails?.name}</span>
            <span className="block text-secondary">
              @{userDetails?.username}
            </span>
            <span className="block mt-5">{userDetails?.bio}</span>
            <div className="flex-row items-center mt-10 flex-wrap">
              {userDetails?.location ? (
                <span className="flex-row items-center">
                  <LocationIcon className="fill-secondary svg-20" />{' '}
                  <span className="text-secondary mr-10">
                    {userDetails?.location}
                  </span>
                </span>
              ) : (
                <span className="block mt-5 mr-20 hoverUnderline">
                  No userDetails location
                </span>
              )}

              {userDetails?.website ? (
                <span className="flex-row items-center">
                  <WebsiteIcon className="fill-secondary svg-20" />{' '}
                  <a
                    href={`//${userDetails?.website}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="text-primary mr-20 hoverUnderline">
                      {userDetails?.website}
                    </span>
                  </a>
                </span>
              ) : (
                <span className="block mt-5 mr-20 hoverUnderline">
                  No userDetails website
                </span>
              )}
              <span className="flex-row items-center">
                <CalendarIcon className="fill-secondary svg-20" />{' '}
                <span className="text-secondary ml-5">
                  Joined {joined(userDetails?.joined)}
                </span>
              </span>
            </div>
            <div className="flex-row items-center mt-10">
              <Link to={`/profile/${userDetails?.username}/following`}>
                <span>
                  <span className="font-700">
                    {userDetails?.following.length}
                  </span>
                  <span className="text-secondary ml-5 hoverUnderline pointer">
                    Following
                  </span>
                </span>
              </Link>
              <Link to={`/profile/${userDetails?.username}/followers`}>
                <span>
                  <span className="font-700 ml-10">
                    {userDetails?.followers.length}
                  </span>
                  <span className="text-secondary ml-5 hoverUnderline pointer">
                    Followers
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <div className="profile__tabs">
            <button
              className={`tab ${value === 0 && 'activeTab'}`}
              onClick={() => setValue(0)}
            >
              Tweets
            </button>
            <button
              className={`tab ${value === 1 && 'activeTab'}`}
              onClick={() => setValue(1)}
            >
              Retweets
            </button>
            <button
              className={`tab ${value === 2 && 'activeTab'}`}
              onClick={() => setValue(2)}
            >
              Replies
            </button>
            <button
              className={`tab ${value === 3 && 'activeTab'}`}
              onClick={() => setValue(3)}
            >
              likes
            </button>
          </div>
          {value === 0 && (
            <UserTweets
              username={userDetails?.username}
              config={config}
              history={history}
            />
          )}
          {value === 1 && (
            <UserRetweets
              username={userDetails?.username}
              config={config}
              history={history}
            />
          )}
          {value === 2 && (
            <UserReplies
              username={userDetails?.username}
              config={config}
              history={history}
            />
          )}
          {value === 3 && (
            <UserLikes
              username={userDetails?.username}
              config={config}
              history={history}
            />
          )}

          <div style={{ marginBottom: '60px' }}></div>
        </div>
      )}
      {edit && <EditProfile handleClose={() => setEdit(false)} />}
    </>
  );
};

export default Profile;
