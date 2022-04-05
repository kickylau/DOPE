import React, { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './SignupForm.css';

function SignupFormPage() {
    const dispatch = useDispatch();
    const sessionUser = useSelector(state => state.session.user);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState([]);
    //const [credential, setCredential] = useState('');

    //If there is a current session user in the Redux store,
    //then redirect the user to the "/" path if trying to access the SignupFormPage.
    if (sessionUser) return (
        <Redirect to="/cafes" />
    );

    //how would it know if you are already a session user?

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setErrors([]);
            return dispatch(sessionActions.signup({ username, email, password }))
                .catch(async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                });
        }

        //On submit of the form, validate that the confirm password
        //is the same as the password fields, then dispatch the
        //signup thunk action with the form input values.
        return setErrors(['Confirm Password field must be the same as the Password field'])
    }


//      //another demo user entry
//     const demo = () => {
//     setCredential("demo@user.io")
//     setPassword("password")
//     return;
//   }

    //signup welcome page and classname
    return (
        <form className="signupform" onSubmit={handleSubmit}>
            <ul>
                {errors.map((error, idx) => <li key={idx}>{error}</li>)}
            </ul>
            <label>
                Username
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </label>
            <label>
                Email
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </label>
            <label>
                Password
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </label>
            <label>
                Confirm Password
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Log In</button>

        </form>
    );
}

export default SignupFormPage;
