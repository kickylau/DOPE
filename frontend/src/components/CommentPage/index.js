// import { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { getAllComments } from '../../store/comment';
// import CommentDetail from './CommentDetail';


// const Comments = ({answer}) => {
//   //what should i key in?
//     const dispatch = useDispatch();
//     const answers = useSelector((state) => Object.values(state.answer));
//     const cafe = useSelector(state => Object.values(state.cafe))
//     useEffect(() => {
//       dispatch(getAllComments(cafe.id));
//       //what should i key in?
//     }, [dispatch]);

//     return (

//           <div className='answers'>
//             {answer?.map(( { id,answer}) => (
//               <CommentDetail
//                 key={id}
//                 id={id}
//                 answer={answer}
//               />
//             ))}
//           </div>

//       );
//     };
//   export default Comments;
