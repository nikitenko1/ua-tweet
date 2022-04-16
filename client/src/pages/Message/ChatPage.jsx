import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from '../../components/emoji/EmojiPicker';
import {
  BackIcon,
  EmojiIcon,
  InfoIcon,
  SendIcon,
} from '../../components/forms/Icon';
import { getDate, getTime } from '../../components/utils/timeAndDate';
import TypingDots from '../../components/forms/TypingDots';
import { getUnreadChatsCount } from '../../redux/actions/chatActions';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

let lastTypingTime;
let lastMessageId;

const ChatPage = ({ match, history }) => {
  const smallScreen = useMediaQuery('(max-width:500px)');
  //
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [iamTyping, setIamTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);

  const chatContainer = React.useRef();

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const socketDetails = useSelector((state) => state.socketDetails);
  const { socket } = socketDetails;

  const chatDetails = useSelector((state) => state.chatDetails);
  const { newMessage } = chatDetails;

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    // basic emit
    socket?.emit('join-room', match.params.chatId);
  });

  useEffect(() => {
    // eventEmitter.on() method is used to register listeners
    socket?.on('typing', () => setOthersTyping(true));
    socket?.on('stop typing', () => setOthersTyping(false));
  });

  useEffect(() => {
    if (newMessage && newMessage._id !== lastMessageId) {
      lastMessageId = newMessage._id;
      setChatMessages([...chatMessages, newMessage]);
      chatContainer.current.scrollBy({
        top: chatContainer.current.scrollHeight,
      });
    }
  }, [chatMessages, newMessage]);

  useEffect(() => {
    const getChatMessages = async () => {
      try {
        const { data } = await axios.get(
          `/chat/${match.params.chatId}/messages`,
          config
        );
        setChatMessages(data.results);
        setIsGroupChat(data.isGroupChat);
        dispatch(getUnreadChatsCount());

        chatContainer.current.scrollBy({
          top: chatContainer.current.scrollHeight,
        });
      } catch (err) {
        console.log(err);
      }
    };
    getChatMessages();

    return () => {
      axios.put(
        `/api/chat/${match.params.chatId}/messages/markasread`,
        {},
        config
      );
    };
  });

  const handleMessage = (e) => {
    updateTyping();
    if (e.which === 13 && !e.shiftKey) {
      submitMessage();
    }
  };

  const updateTyping = () => {
    if (!socket?.connected) return;

    if (!iamTyping) {
      setIamTyping(true);
      socket?.emit('typing', match.params.chatId);
    }

    lastTypingTime = new Date().getTime();
    let timerLength = 2000;

    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength) {
        socket?.emit('stop typing', match.params.chatId);
        setIamTyping(false);
      }
    }, timerLength);
  };

  const submitMessage = async () => {
    socket?.emit('stop typing', match.params.chatId);
    setIamTyping(false);
    try {
      const { data } = await axios.post(
        `/api/message`,
        {
          content: message,
          chatId: match.params.chatId,
        },
        config
      );
      socket?.emit('new message', data);
      setChatMessages([...chatMessages, data]);
      setMessage('');
      chatContainer.current.scrollBy({
        top: chatContainer.current.scrollHeight,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {smallScreen && (
        <div className="searchBack" onClick={() => history.push('/message')}>
          <BackIcon />
        </div>
      )}
      <div className="flex-col h-100">
        <div className="main__header">
          <span>Chat</span>
          <div
            className="inline-block pointer p-7 border-round bgHover"
            onClick={() =>
              history.push(`/messages/${match.params.chatId}/info`)
            }
          >
            <InfoIcon />
          </div>
        </div>
        <div ref={chatContainer} className="chatMessages">
          <ul>
            {chatMessages.map((message, index) => (
              <li key={message._id}>
                <div
                  className={
                    message.sender?._id === userInfo.id
                      ? 'myMessage'
                      : 'othersMessage'
                  }
                >
                  <span>{message.content}</span>

                  {isGroupChat &&
                    !(message.sender._id === userInfo.id) &&
                    chatMessages[index + 1]?.sender._id !==
                      message.sender._id && (
                      <div className="text-secondary ml-5 mt-5 mb-15 flex-row items-center">
                        <img
                          src={message?.sender?.profilePhoto.url}
                          alt="pp"
                          width="30"
                          height="30"
                          className="border-round"
                        />
                        <p className="inline-block ml-5">
                          {message.sender?.name} ·{' '}
                          {getDate(new Date(message?.createdAt))}{' '}
                          {getTime(new Date(message?.createdAt))}
                        </p>
                      </div>
                    )}
                </div>
              </li>
            ))}
          </ul>
          <span>... </span>
          {othersTyping && <TypingDots />}
        </div>
        <div className="z-10 flex-row pt-10" style={{ height: '6rem' }}>
          <div
            className="pointer p-7 "
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <EmojiIcon />
          </div>

          <div className="flex-1">
            <TextareaAutosize
              rowsMin={1}
              rowsMax={1}
              placeholder="Enter message"
              spellCheck="false"
              className="chatTextarea p-10 "
              autoFocus={true}
              value={message}
              onKeyDown={handleMessage}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className=" pointer p-7 " onClick={submitMessage}>
            <SendIcon />
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Loading ...</div>}>
        <EmojiPicker
          handleEmoji={(emoji) => setMessage(message + emoji)}
          targetElement={anchorEl}
          handleClose={() => setAnchorEl(null)}
        />
      </Suspense>
    </>
  );
};

export default ChatPage;
