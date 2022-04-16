import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TwitterIcon } from '../../components/forms/Icon';
import TextInput from '../../components/forms/TextInput';
import Alert from '../../components/Alert';
import Spinner from '../../components/forms/Spinner';
import getBrowserInfo from '../../utils/getBrowserInfo';

const LoginPage = ({ history }) => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [location, setLocation] = useState('Unknown location');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const getLocation = async () => {
      const { data } = await axios.get(
        `https://api.ipdata.co/?api-key=${process.env.REACT_APP_LOCATION_API}`
      );
      setLocation(`${data.city} ${data.region} ${data.country_name}`);
    };
    getLocation();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/auth/login`, {
        account,
        password,
        info: {
          browser: getBrowserInfo(),
          location,
        },
      });
      localStorage.setItem('token', JSON.stringify(data.token));
      localStorage.setItem('theme', '0');
      localStorage.setItem('color', '0');
      dispatch({ type: 'SET_TOKEN', payload: data.token });
      dispatch({ type: 'USER_SUCCESS', payload: data.user });
      dispatch({ type: 'USER_AUTH', payload: true });
      setLoading(false);
      history.push('/home');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg);
    }
  };
  return (
    <div className="login pl-15 pr-5">
      {loading && <Spinner />}
      {error && <Alert message={error} errorTimeout={() => setError('')} />}
      <TwitterIcon className="svg-35 mt-15" />
      <span className="block font-700 font-2xl mt-20">Log in to Twitterf</span>
      <div className="mt-20">
        <TextInput
          placeholder="Phone, email or username"
          handleInput={(value) => setAccount(value)}
          value={account}
        />
      </div>
      <div className="mt-15">
        <TextInput
          type="password"
          placeholder="password"
          handleInput={(value) => setPassword(value)}
          value={password}
        />
      </div>
      <button
        className="fill-button w-90 mt-20 text-white"
        style={{ padding: '1.5rem 1.7rem' }}
        onClick={handleClick}
      >
        Log in
      </button>
      <div className="mt-20">
        <Link to="/start_password_reset">
          <span className="hoverState">Forgot password?</span>
        </Link>
        <span className="text-primary" style={{ padding: ' 0 .5rem' }}>
          ·
        </span>
        <Link to="/signup">
          <span className="hoverState">Sign up for Twitterf</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
