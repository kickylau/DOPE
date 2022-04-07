import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addComment } from '../../store/comment';
import { useHistory } from 'react-router-dom';

//import under cafedetail

const CreateComment = () => {
    const [answer, setAnswer] = useState('');
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
            userId: sessionUser.id,
            answer,
            businessId:cafe.id
        };

        const createOne = await dispatch(addComment(payload));
        if (createOne) {
            history.push(`/cafes/:id/new`);
        }
    };


    if (sessionUser) {
        return (

            <div className='add-comment'>
                <h3>Add A Comment</h3>
                <form onSubmit={handleSubmit} className='add-comment'>
                    Comment
                    <input
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer}
                        placeholder='Answer'
                        required
                    />
                    <button className='submit-button' type='submit'>
                        Add Comment
                    </button>
                    <button type="button" className='cancel-button' onClick={handleCancelClick}>
                        Cancel
                    </button>
                </form>
            </div>
        )
    } else {
        return (<h2>PLEASE LOG IN FIRST TO COMMENT </h2>)
    }
};
export default CreateComment;
