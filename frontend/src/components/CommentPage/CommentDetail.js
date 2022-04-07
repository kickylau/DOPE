// import { useDispatch, useSelector } from 'react-redux';
// import { deleteComment } from '../../store/comment';
// import { useHistory } from 'react-router-dom';
// import {useState} from "react"
// import "./CommentPage.css"

// const CommentDetail = ({ id,userId,businessId,answer}) => {
//   //const answer = { id,userId,businessId,answer}
//   const dispatch = useDispatch();
//   const history = useHistory();
//   const sessionUser = useSelector((state)=>state.session.user)



//   const handleDelete = (id) => {
//     if(sessionUser){
//       dispatch(deleteComment(id));
//     } else {
//       history.push('/cafes');
//     }
//   };



//   return (

//     <form className="commentform" >
//     <label>
//       Comment
//       <input
//         type="text"
//         value={answer}
//         required
//       />
//     </label>
//       <div className='button-row'>
//         <button onClick={() => handleDelete(id)} className='delete-button'>
//           Delete
//         </button>
//         <button type="submit" className='submit'>Submit</button>
//       </div>
//       </form>
//   );
// };
// export default CommentDetail;
