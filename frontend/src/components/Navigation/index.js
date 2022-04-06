//Navigation folder holds all the files for the signup form
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);



  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <ProfileButton user={sessionUser} /> //classname=''

    );
  } else {
    sessionLinks = (
      <>
        <ul>
          <li>
            <NavLink to="/login">Log In</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </li></ul> </>
    );
  }

  return (

      <ul>
        <li>
          <NavLink exact to="/cafes">Discover Cafes</NavLink>
          {isLoaded && sessionLinks}
        </li>
        <li>
          <NavLink exact to="/cafes/new">Add A Cafe</NavLink>
          {isLoaded}
        </li>
      </ul>

  );
}

export default Navigation;
