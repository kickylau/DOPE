import { useDispatch, useSelector } from 'react-redux';
import { addComment, deleteComment } from '../../store/comment';
import { useHistory } from 'react-router-dom';
//import {useState} from "react"
import "./CommentPage.css"
import cafeReducer from '../../store/cafes';
import React, {useState} from "react";

const Comment = ({ cafe}) => {
  //const answer = { id,userId,businessId,answer}
  const dispatch = useDispatch();
  const history = useHistory();
  const sessionUser = useSelector((state)=>state.session.user)



  const handleDelete = (id) => {
    if(sessionUser){
      dispatch(deleteComment(id));
    } else {
      history.push('/cafes');
    }
  };



  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      cafeId : cafe.id,
      userId : sessionUser.id
    }

    await dispatch(addComment(payload))
    history.push(`/cafes/${cafe.id}`)
  }

  return (

    <form onSubmit={handleSubmit} className="commentform" >
    <label>
      Comment
      <input
        type="text"
        value={answer}
        required
      />
    </label>
      <div className='button-row'>
        <button onClick={() => handleDelete(id)} className='delete-button'>
          Delete
        </button>
        <button type="submit" className='submit'>Submit</button>
      </div>
      </form>
  );
};
export default Comment;
