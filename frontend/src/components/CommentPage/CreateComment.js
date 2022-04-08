import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addComment } from '../../store/comment';
import { useHistory } from 'react-router-dom';

//import under cafedetail

const CreateComment = ({currentCafe}) => {
    const [answer, setAnswer] = useState('');
    const [errors, setErrors] = useState([])
    const sessionUser = useSelector((state) => state.session.user)

    //const currentCafe = useSelector(state => Object.values(state.cafe))
    //either prop or useSelector
    //console.log(cafe)
    const history = useHistory();
    const dispatch = useDispatch();
    // const handleCancelClick = (e) => {
    //     e.preventDefault()
    //     history.push(`/cafes/${id}`)
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            userId: sessionUser.id,
            answer,
            businessId:currentCafe.id
            //cafe is undefined the cafe property is empty
        };


        const createOne = await dispatch(addComment(payload));
        if (createOne) {
            history.push(`/cafes/${currentCafe?.id}`);
            setAnswer("")
        }
    };


    if (sessionUser) {
        return (
            <div className='add-comment'>
                <form onSubmit={handleSubmit} className='add-a-comment'>
                    <input
                    className="input"
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        placeholder='At least 1 character'
                        required
                    />
                    <button className='submit-button' type='submit'>
                        Add Review
                    </button>
                    {/* <button type="button" className='cancel-button' onClick={handleCancelClick}>
                        Cancel
                    </button> */}
                </form>
            </div>
        )
    } else {
        return (<h2>PLEASE LOG IN FIRST TO COMMENT </h2>)
    }
};
export default CreateComment;
