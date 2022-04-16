import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../components/utils/cropImage';
import BigModal from '../../components/modals/BigModal';
import {
  CloseIcon,
  MinimizeIcon,
  MaximizeIcon,
} from '../../components/forms/Icon';
import { USER_SUCCESS } from '../../redux/constants/userConstants';
import { LinearProgress, useMediaQuery, Slider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 16,
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  sliderContainer: {
    width: '200px',
    display: 'flex',
    flex: '1',
    alignItems: 'center',
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

const CoverPhoto = ({ handleClose, coverPhoto, username }) => {
  const fiveToSix = useMediaQuery('(min-width:501px) and (max-width:600px) ');
  const fourToFive = useMediaQuery('(min-width:401px) and (max-width:500px) ');
  const ThreeToFour = useMediaQuery('(min-width:301px) and (max-width:400px) ');
  const TwoToThree = useMediaQuery('(min-width:201px) and (max-width:300px) ');

  const [image, setImage] = useState(null);
  const classes = useStyles();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropX, setCropX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [widthHeight, setWidthHeight] = useState({ width: 600, height: 200 });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (fiveToSix) setWidthHeight({ width: 500, height: 180 });

    if (fourToFive) setWidthHeight({ width: 400, height: 160 });

    if (ThreeToFour) setWidthHeight({ width: 300, height: 140 });

    if (TwoToThree) setWidthHeight({ width: 250, height: 120 });
  }, [fiveToSix, fourToFive, ThreeToFour, TwoToThree]);

  useEffect(() => {
    let img = new Image();
    img.src = coverPhoto;
    img.onload = function () {
      if (this.width < widthHeight.width) {
        setCropX((widthHeight.width - this.width) / 2);
      } else {
        setCropX(0);
      }
      setImage(coverPhoto);
    };
  }, [coverPhoto, widthHeight.width]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      setLoading(true);
      const formData = new FormData();
      // (method) FormData.append(name: string, value: string | Blob, fileName?: string)
      formData.append('coverPhoto', croppedImage);

      const token = JSON.parse(localStorage.getItem('token'));

      const { data } = await axios.post(
        `/api/user/${username}/cover_photo`,
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
  }, [croppedAreaPixels]);

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
      <div>
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
      </div>
    </BigModal>
  );
};

export default CoverPhoto;
