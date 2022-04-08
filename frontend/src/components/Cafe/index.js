import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllCafes } from '../../store/cafes';
import CafeDetail from './CafeDetail';
import Answer from '../CommentPage/CommentDetail';
import { Link } from "react-router-dom"


const Cafe = ({ sessionUser }) => {
  const dispatch = useDispatch();
  const cafe = useSelector((state) => Object.values(state.cafe));
  //const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    dispatch(getAllCafes());
  }, [dispatch]);


  // const openMenu = () => {
  //   if (showMenu) return;
  //   setShowMenu(true);
  // }

  // useEffect(() => {
  //   if (!showMenu) return;
  //   const closeMenu = () => {
  //     setShowMenu(false);
  //   }
  //   return () => document.removeEventListener("click", closeMenu);
  // }, [showMenu]);


  return (

    <div className="gallery">
      {/* <div className="column"> */}
      {cafe?.map(({ id, img, title, description, address, city, zipCode }) => {
        return (
          <div className="gallery_info">
            <Link key={id} to={`/cafes/${id}`}>
              <div>
                <figure><img src={img} className="gallery_img" alt=""></img></figure>
              </div>
            </Link>

            <div className="gallery_name">{title}</div>
            <div className="gallery_description">{description}</div>
          </div>
        )
      })}
    </div>
  )
};


{/* //  <CafeDetail
            //     key={id}
            //     id={id}
            //     img={img}
            //     title={title}
            //     // description={description}
            //     // address={address}
            //     // city={city}
            //     // zipCode={zipCode}
            //   /> */}

export default Cafe;
