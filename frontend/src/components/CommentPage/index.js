import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllComments } from '../../store/comment';
import CommentDetail from './CommentDetail';


const Answer = () => {
    const dispatch = useDispatch();
    const answer = useSelector((state) => Object.values(state.answer));
    useEffect(() => {
      dispatch(getAllComments());
    }, [dispatch]);

    return (

          <div className='answers'>
            {answer?.map(( { id,answer}) => (
              <CommentDetail
                key={id}
                id={id}
                answe={answer}
              />
            ))}
          </div>

      );
    };
  export default Answer;
