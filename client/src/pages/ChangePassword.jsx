import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextInput from '../components/forms/TextInput';
import Alert from '../components/Alert';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [disable, setDisable] = useState(true);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const auth = useSelector((state) => state.auth);
  const { config } = auth;

  useEffect(() => {
    if (
      currentPassword.trim() &&
      newPassword.trim() &&
      confirmPassword.trim() &&
      newPassword === confirmPassword
    ) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleSubmit = async () => {
    try {
      const { data } = await axios.put(
        `/api/auth/change-password`,
        {
          id: userInfo.id,
          currentPassword,
          newPassword,
        },
        config // router.put('/change-password', auth --> config, changePassword);
      );
      localStorage.setItem('token', JSON.stringify(data.token));
      dispatch({ type: 'SET_TOKEN', payload: data.token });
      dispatch({ type: 'USER_SUCCESS', payload: data.user });
      dispatch({ type: 'USER_AUTH', payload: true });
      setCurrentPassword('');
      setConfirmPassword('');
      setNewPassword('');
      setAlertMessage('Your password was changed sucessfully');
      setAlert(true);
    } catch (err) {
      setAlert(true);
      setAlertMessage(err.response?.data?.msg);
      setCurrentPassword('');
      setConfirmPassword('');
      setNewPassword('');
    }
  };
  return (
    <>
      <div className="main__header">
        <span>Change Password</span>
      </div>
      <div>
        <div className="mt-15 pl-20 pb-20">
          <TextInput
            type="password"
            placeholder="current password"
            handleInput={(value) => setCurrentPassword(value)}
            value={currentPassword}
          />
        </div>
        <div style={{ borderTop: '10px solid var(--lightColor)' }}></div>
        <div className="mt-15 pl-20">
          <TextInput
            type="password"
            placeholder="new password"
            handleInput={(value) => setNewPassword(value)}
            value={newPassword}
          />
        </div>
        <div className="mt-15 pl-20 pb-20">
          <TextInput
            type="password"
            placeholder="confirm password"
            handleInput={(value) => setConfirmPassword(value)}
            value={confirmPassword}
          />
        </div>
        <div style={{ borderTop: '10px solid var(--lightColor)' }}></div>
        <button
          className={`fill-button text-white mt-20 ml-20 ${
            disable && 'opac-5'
          }`}
          disabled={disable}
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
      {alert && (
        <Alert
          message={alertMessage}
          errorTimeout={() => {
            setAlert(false);
            setAlertMessage('');
          }}
        />
      )}
    </>
  );
};

export default ChangePassword;
