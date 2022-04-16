import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import Cropper from 'react-easy-crop';
import { Slider, useMediaQuery, LinearProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  CloseIcon,
  MinimizeIcon,
  MaximizeIcon,
} from '../../components/forms/Icon';
import getCroppedImg from '../../components/utils/cropImage';
import BigModal from '../../components/modals/BigModal';
import { USER_SUCCESS } from '../../redux/constants/userConstants';

const useStyles = makeStyles((theme) => ({
  cropContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    background: 'var(--rootBgColor)',
    [theme.breakpoints.up('sm')]: {
      height: 450,
    },
  },
  controls: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  sliderContainer: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
    width: '200px',
  },
  slider: {
    padding: '22px 0px',
    width: '250px',
    color: 'var(--primaryColor)',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
}));

const ProfilePhoto = ({ handleClose, profilePhoto, username }) => {
  const classes = useStyles();
  const fiveToSix = useMediaQuery('(min-width:501px) and (max-width:600px) ');
  const fourToFive = useMediaQuery('(min-width:401px) and (max-width:500px) ');
  const ThreeToFour = useMediaQuery('(min-width:301px) and (max-width:400px) ');
  const TwoToThree = useMediaQuery('(min-width:201px) and (max-width:300px) ');

  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropX, setCropX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [widthHeight, setWidthHeight] = useState({ width: 600, height: 420 });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (fiveToSix) setWidthHeight({ width: 500, height: 350 });

    if (fourToFive) setWidthHeight({ width: 400, height: 300 });

    if (ThreeToFour) setWidthHeight({ width: 300, height: 270 });

    if (TwoToThree) setWidthHeight({ width: 250, height: 200 });
  }, [fiveToSix, fourToFive, ThreeToFour, TwoToThree]);

  useEffect(() => {
    let img = new Image();
    img.src = profilePhoto;
    img.onload = function () {
      if (this.width < widthHeight.width) {
        setCropX((widthHeight.width - this.width) / 2);
      } else {
        setCropX(0);
      }
      setImage(profilePhoto);
    };
  }, [profilePhoto, widthHeight.width]);

  // onCropComplete allows us to save a cropped area of an image and specify the pixel
  // or percentage size of the cropped image
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      setLoading(true);
      const formData = new FormData();
      // (method) FormData.append(name: string, value: string | Blob, fileName?: string)
      formData.append('profilePhoto', croppedImage);

      const token = JSON.parse(localStorage.getItem('token'));

      const { data } = await axios.post(
        `/api/user/${username}/profile_photo`,
        formData,
        {
          headers: {
            'content-type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch({ type: USER_SUCCESS, payload: data.user });
      setLoading(false);
      handleClose();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, [croppedAreaPixels, image]);

  return (
    <BigModal onClose={handleClose}>
      {loading && <LinearProgress />}
      <div className="modalCloseButton ">
        <div className="flex-row items-center">
          <div
            className="pointer bgHover border-round p-7"
            onClick={handleClose}
          >
            <CloseIcon />
          </div>
          <span className="font-800 font-xl ml-20 flex-1">Edit Media</span>
          <button className="fill-button text-white" onClick={showCroppedImage}>
            Apply
          </button>
        </div>
      </div>
      <div className={classes.cropContainer}>
        {image && (
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            showGrid={false}
            cropSize={widthHeight}
            transform={`translate(${crop.x + cropX}px, ${
              crop.y
            }px) rotate(0deg) scale(${zoom})`}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              cropAreaStyle: {
                border: '5px solid var(--primaryColor)',
                color: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        )}
      </div>

      <div className="flex-row items-center justify-center">
        <MinimizeIcon className="svg-15 fill-secondary" />
        <div className={classes.controls}>
          <div className={classes.sliderContainer}>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              classes={{ root: classes.slider }}
              onChange={(e, zoom) => setZoom(zoom)}
            />
          </div>
        </div>
        <MaximizeIcon className="svg-15 fill-secondary" />
      </div>
    </BigModal>
  );
};

export default ProfilePhoto;
