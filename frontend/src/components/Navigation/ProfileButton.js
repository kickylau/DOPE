
import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);

    //dropdownmenu
    const openMenu = () => {
        if (showMenu) return;
        setShowMenu(true);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = () => {
            setShowMenu(false);
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener("click", closeMenu);
    }, [showMenu]);

    //When clicked, the profile button should trigger a component state change
    //and cause a dropdown menu to be rendered.
    //When there is a click outside of the dropdown menu list or on the profile button again,
    //then the dropdown menu should disappear.

    const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
    };

    return (
        <>
            <button onClick={openMenu}>
                <i className="fas fa-user-circle" />
            </button>
            {showMenu && (
                <ul className="profile-dropdown">
                    <li>{user.username}</li>
                    <li>{user.email}</li>
                    <li>
                        <button className="logout" onClick={logout}>Log Out</button>
                    </li>
                </ul>
            )}
        </>
    );
}

export default ProfileButton;

//To change the size or color of the icon, wrap the <i> element in a parent element like a div.
//Manipulating the font-size of the parent element changes the size of the icon.
//The color of the parent element will be the color of the icon.
//For example, to render a big orange const Carrot = () => (); ```
//Choose an icon that will represent the user profile button and render it in the ProfileButton component.
