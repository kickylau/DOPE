import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addCafe } from '../../store/cafes';
import { useHistory, Link, NavLink } from 'react-router-dom';


const CreateCafe = () => {
  //console.log("ENTER CREATE CAFE")
  //routing issue
  const [img, setImg] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [errors, setErrors] = useState([])
  const sessionUser = useSelector((state) => state.session.user)

  const cafe = useSelector(state => Object.values(state.cafe))
  //console.log(cafe)
  const history = useHistory();
  const dispatch = useDispatch();

  const handleCancelClick = (e) => {
    e.preventDefault()
    history.push("/cafes")
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ownerId: sessionUser.id,
      img,
      title,
      description,
      address,
      city,
      zipCode,
    };

    const createOne = await dispatch(addCafe(payload));
    //console.log(payload)
    if (createOne) {
      history.push(`/cafes/`);
    }

    //reset();
  };


  const reset = () => {
    setTitle("");
    setImg("")
    setDescription("");
    setAddress("");
    setCity("");
    setZipCode("")
  };

  // const validateCafe = [
  //   check('img')
  //     .notEmpty()
  //     .isURL({ require_protocol: false, require_host: false }),
  //   check('title')
  //     .not().isEmpty()
  //     .isLength({ min: 4 })
  //     .withMessage('Please provide a title with at least 4 characters.'),
  //   check('description')
  //     .not().isEmpty()
  //     .isLength({ min: 5 })
  //     .withMessage('Please provide a description with at least 5 characters.'),
  //   check('address')
  //     .not().isEmpty()
  //     .isLength({ min: 5 })
  //     .withMessage('Please provide an address with at least 5 characters.'),
  //   check('city').not()
  //     .not().isEmpty()
  //     .isLength({ min: 4 })
  //     .withMessage('Please provide a city name with at least 4 characters.'),
  //   check('zipCode')
  //     .not().isEmpty()
  //     .isNumeric({ min: 5 })
  //     .withMessage('Please provide a valid zipcode.'),
  //   handleValidationErrors
  // ];



  if (sessionUser) {
    return (

      <div className='add-cafe'>
        {/* <h3>Add A Cafe</h3> */}
        <form onSubmit={handleSubmit} className='add-cafe'>
          Image Url
          <input
            type="url"
            onChange={(e) => setImg(e.target.value)}
            value={img}
            placeholder='A valid Image Url'
          //required
          />
          Cafe Title
          <input
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder='At least 1 character'
            required
          />
          Description
          <input
            type="text"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            placeholder='At least 1 character'
            required
          />
          Address
          <input
            type="text"
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            placeholder='At least 1 character'
            required
          />
          City<input
            type="text"
            onChange={(e) => setCity(e.target.value)}
            value={city}
            placeholder='At least 1 character'
            required
          />
          Zipcode<input
            pattern="[0-9]{5}"
            type="text"
            onChange={(e) => setZipCode(e.target.value)}
            value={zipCode}
            placeholder='A valid ZipCode'
          //required
          />
          <button className='submit-button' type='submit'>
            Add Cafe
          </button>
          <button type="button" className='cancel-button' onClick={handleCancelClick}>
            Cancel
          </button>
        </form>
      </div>
    )
  } else {
    return (<span className="login-first">
       <p>&#128151; PLEASE LOG IN FIRST TO CREATE A CAFE &#128151;</p></span>)
  }
};
export default CreateCafe;
