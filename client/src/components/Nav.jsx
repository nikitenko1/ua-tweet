import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HomeFillIcon,
  HomeIcon,
  ExploreIcon,
  ExploreFillIcon,
  NotificationIcon,
  NotificationFillIcon,
  MessageFillIcon,
  MessageIcon,
  ProfileFillIcon,
  ProfileIcon,
  BookmarkFillIcon,
  BookmarkIcon,
  DisplayIcon,
  TweetIcon,
  TwitterIcon,
  OptionsIcon,
  TickIcon,
  AtIcon,
} from '../components/forms/Icon';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Popover from '@material-ui/core/Popover';
import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core';
import Display from './Display';
import ToolTip from './forms/ToolTip';
import Tweet from './Tweet';

const useStyles = makeStyles({
  list: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.5rem 1rem 1rem',
    width: 'fit-content',
    marginBottom: '0.5rem',
    '&:hover': {
      backgroundColor: 'var(--primaryColorBg)',
      color: 'var(--primaryColor)',
      borderRadius: '100px',
    },
    '&:hover svg': {
      fill: 'var(--primaryColor)',
    },
  },
  listText: {
    fontWeight: '700',
    fontSize: '1.8rem',
    marginLeft: '1.5rem',
  },
  tweetButton: {
    padding: '1rem 1rem 0.8rem 1rem',
  },
  popover: {
    backgroundColor: 'transparent',
  },
  popoverText: {
    width: '250px',
    backgroundColor: 'var(--rootBgColor)',
    border: '1px solid var(--lightColor)',
    borderRadius: '5px',
    boxShadow: '0 0 2px rgba(0, 0, 0, 0.1)',
  },
  badge: {
    backgroundColor: 'var(--primaryColor)',
    fontSize: '10px',
    color: '#fff',
    padding: '0',
  },
});

const Nav = ({ location }) => {
  const classes = useStyles();
  //
  const [value, setValue] = useState(0);
  const [tweet, setTweet] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [display, setDisplay] = useState(false);
  //
  const lg = useMediaQuery('(min-width:1236px)');
  const md = useMediaQuery('(min-width:501px) and (max-width: 1235px)');
  const sm = useMediaQuery('(max-width:500px)');

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const chatDetails = useSelector((state) => state.chatDetails);
  const { unreadMessagesCount } = chatDetails;

  const notificationDetails = useSelector((state) => state.notificationDetails);
  const { unreadNotificationsCount } = notificationDetails;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const route = useMemo(
    () => [
      {
        link: '/home',
        text: 'Home',
        SvgFill: HomeFillIcon,
        SvgOutline: HomeIcon,
      },
      {
        link: '/explore',
        text: 'Explore',
        SvgFill: ExploreFillIcon,
        SvgOutline: ExploreIcon,
      },
      {
        link: '/notifications',
        text: 'Notification',
        SvgFill: NotificationFillIcon,
        SvgOutline: NotificationIcon,
      },
      {
        link: '/message',
        text: 'Message',
        SvgFill: MessageFillIcon,
        SvgOutline: MessageIcon,
      },
      {
        link: '/bookmarks',
        text: 'Bookmarks',
        SvgFill: BookmarkFillIcon,
        SvgOutline: BookmarkIcon,
      },
      {
        link: '/connect',
        text: 'Connect',
        SvgFill: AtIcon,
        SvgOutline: AtIcon,
      },
      {
        link: `/profile/${userInfo.username}`,
        text: 'Profile',
        SvgFill: ProfileFillIcon,
        SvgOutline: ProfileIcon,
      },
    ],
    [userInfo.username]
  );

  useEffect(() => {
    route.forEach((el, i) => {
      el.link === window.location.pathname && setValue(i);
    });
  }, [location, route]);

  const getBadge = (text) => {
    if (text === 'Notification') return notificationsCount;
    else if (text === 'Message') return messagesCount;
    else return 0;
  };

  useEffect(() => {
    setMessagesCount(unreadMessagesCount);
  }, [unreadMessagesCount]);

  useEffect(() => {
    setNotificationsCount(unreadNotificationsCount);
  }, [unreadNotificationsCount]);

  return (
    <>
      <ul className="font-800 w-90 flex-col">
        {(lg || md) && (
          <>
            <li className={classes.list}>
              <Link to="/home">
                <TwitterIcon
                  className={`svg-35 ${
                    localStorage.getItem('theme') === '0' ? '' : 'fill-rootText'
                  }`}
                />
              </Link>
            </li>
          </>
        )}
        {lg && (
          <>
            {route.map((item, i) => (
              <Link
                to={item.link}
                key={`${item.link}${i}`}
                onClick={() => setValue(i)}
              >
                <li className={classes.list}>
                  {value === i ? (
                    <Badge
                      badgeContent={getBadge(item.text)}
                      classes={{ badge: classes.badge }}
                    >
                      <item.SvgFill />
                    </Badge>
                  ) : (
                    <Badge
                      badgeContent={getBadge(item.text)}
                      classes={{ badge: classes.badge }}
                    >
                      <item.SvgOutline className="fill-rootText" />
                    </Badge>
                  )}
                  {value === i ? (
                    <span className={`text-primary ${classes.listText}`}>
                      {item.text}
                    </span>
                  ) : (
                    <span className={classes.listText}>{item.text}</span>
                  )}
                </li>
              </Link>
            ))}
            <li
              className={`pointer ${classes.list}`}
              onClick={() => setDisplay(true)}
            >
              <DisplayIcon className="fill-rootText" />
              <span className={classes.listText}>Display</span>
            </li>
            <button
              className="fill-button w-100 mt-15 text-white"
              onClick={() => setTweet(true)}
            >
              Tweet
            </button>
            <div
              className="bgHover flex-row items-center pointer border-semi-round pl-10 pr-20 mt-auto mb-15"
              onClick={handleClick}
            >
              <img
                src={userInfo.profilePhoto.url}
                alt=""
                width="35"
                height="35"
                className="border-round"
              />
              <div className=" flex-1 ml-10">
                <span className="block font-700 mt-10 ">{userInfo.name}</span>
                <span className="block font-450 text-secondary font-xs mb-10">
                  @{userInfo.username}
                </span>
              </div>
              <OptionsIcon className="fill-rootText" />
            </div>
          </>
        )}
        {md && (
          <>
            {route.map((item, i) => (
              <Link
                to={item.link}
                key={`${item.link}${i}`}
                onClick={() => setValue(i)}
              >
                <ToolTip title={item.text}>
                  <li className={classes.list}>
                    {value === i ? (
                      <Badge
                        badgeContent={getBadge(item.text)}
                        classes={{ badge: classes.badge }}
                      >
                        <item.SvgFill />
                      </Badge>
                    ) : (
                      <Badge
                        badgeContent={getBadge(item.text)}
                        classes={{ badge: classes.badge }}
                      >
                        <item.SvgOutline className="fill-rootText" />
                      </Badge>
                    )}
                  </li>
                </ToolTip>
              </Link>
            ))}

            <ToolTip title="Display">
              <li
                className={`pointer ${classes.list}`}
                onClick={() => setDisplay(true)}
              >
                <DisplayIcon className="fill-rootText" />
              </li>
            </ToolTip>

            <button
              className={`fill-button border-round mt-15 ${classes.tweetButton} `}
              style={{ width: '50px' }}
              onClick={() => setTweet(true)}
            >
              <TweetIcon className="fill-white" />
            </button>

            <div
              className="bgHover pointer border-round p-10 mt-auto mb-15"
              onClick={handleClick}
            >
              <img
                src={userInfo.profilePhoto.url}
                alt=""
                width="35"
                height="35"
                className="border-round"
              />
            </div>
          </>
        )}
        {sm && (
          <>
            {route.map((item, i) => {
              if (i <= 3) {
                return (
                  <Link
                    to={item.link}
                    key={`${item.link}${i}`}
                    onClick={() => setValue(i)}
                  >
                    <li>
                      {value === i ? (
                        <Badge
                          badgeContent={getBadge(item.text)}
                          classes={{ badge: classes.badge }}
                        >
                          <item.SvgFill />
                        </Badge>
                      ) : (
                        <Badge
                          badgeContent={getBadge(item.text)}
                          classes={{ badge: classes.badge }}
                        >
                          <item.SvgOutline className="fill-rootText" />
                        </Badge>
                      )}
                    </li>
                  </Link>
                );
              } else {
                return null;
              }
            })}
          </>
        )}
      </ul>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        classes={{ paper: classes.popover }}
      >
        <div className={classes.popoverText}>
          <div className=" flex-row items-center border-semi-round pt-10 pb-10 pl-10 pr-20 ">
            <img
              src={userInfo.profilePhoto.url}
              alt=""
              width="45"
              height="45"
              className="border-round"
            />
            <div className="flex-1 ml-10">
              <span className="block font-700 text-root ">{userInfo.name}</span>
              <span className="block font-450 text-secondary font-xs mb-10">
                @{userInfo.username}
              </span>
            </div>
            <TickIcon />
          </div>
          <Link
            to="/change-password"
            className="block font-450 p-20 bgLightHover text-secondary"
          >
            Change password
          </Link>
          <Link
            to="/logout"
            className="block font-450 p-20 bgLightHover text-secondary"
          >
            Log out @{userInfo.username}
          </Link>
        </div>
      </Popover>
      {display && <Display handleClose={() => setDisplay(false)} />}
      {tweet && <Tweet handleClose={() => setTweet(false)} />}
    </>
  );
};

export default Nav;
