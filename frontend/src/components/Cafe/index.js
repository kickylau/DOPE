import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllCafes } from '../../store/cafes';
import CafeDetail from './CafeDetail';


const Cafe = () => {
    const dispatch = useDispatch();
    const cafe = useSelector((state) => Object.values(state.cafe));
    useEffect(() => {
      dispatch(getAllCafes());
    }, [dispatch]);

    return (
        <a>
          <div className='cafes'>
            {cafe?.map(( { id,img,title,description,address,city,zipCode}) => (
              <CafeDetail
                key={id}
                id={id}
                img={img}
                title={title}
                description={description}
                address={address}
                city={city}
                zipCode={zipCode}
              />
            ))}
          </div>
        </a>
      );
    };
  export default Cafe;
