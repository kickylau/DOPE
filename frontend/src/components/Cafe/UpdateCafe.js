import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { updateCafe } from "../../store/cafes";


function UpdateCafe({ cafe }) {
    const dispatch = useDispatch();
    const [title, setTitle] = useState(cafe?.title);  //conditional chaining
    const [description, setDescription] = useState(cafe?.description);
    const [address, setAddress] = useState(cafe?.address);
    const [city, setCity] = useState(cafe?.city);
    const [zipCode, setZipCode] = useState(cafe?.zipCode);
    const [img, setImg] = useState(cafe?.img);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        const payload = {
            ...cafe,
            title,
            description,
            address,
            city,
            zipCode,
            img,
        };

        await dispatch(updateCafe(payload));
    };

    const handleCancelClick = (e) => {
        e.preventDefault()
    };

    return (
        // <div className='edit-cafe'>
        // <h3>Edit A Cafe</h3>
        <form onSubmit={handleSubmit} className='edit-cafe'>
            <ul>
                {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
            <div id="cafeForm">
            <label>
                Image
                <input
                    type="text"
                    onChange={(e) => setImg(e.target.value)}
                    value={img}
                    placeholder='Image Url'
                    required
                />
            </label>
            <label>
                Title
                <input
                    type="text"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    placeholder='Cafe Title'
                    required
                />
            </label>
            <label>
                Description
                <input
                    type="text"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    placeholder='Description'
                    required
                /></label>
            <label>
                Address
                <input
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                    value={address}
                    placeholder='Address'
                    required
                />
            </label>
            <label>
                City
                <input
                    type="text"
                    onChange={(e) => setCity(e.target.value)}
                    value={city}
                    placeholder='City'
                    required
                />
            </label>
            <label>
                Zipcode
                <input
                    type="text"
                    onChange={(e) => setZipCode(e.target.value)}
                    value={zipCode}
                    placeholder='ZipCode'
                    required
                /></label>

            <button className='submit-button' type='submit'>
                Add Cafe
            </button>
            <button type="button" onClick={handleCancelClick}>
                Cancel
            </button>
            </div>

        </form>
        // {/* </div> */}
    );
}

export default UpdateCafe;
