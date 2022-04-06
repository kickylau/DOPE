import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import LoginFormPage from "./components/LoginFormPage";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Cafe from "./components/Cafe";
import CreateCafe from "./components/Cafe/CreateCafe";
import UpdateCafe from "./components/Cafe/UpdateCafe";
import LandingPage from "./components/LandingPage";


function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          {/* <Route path="/">
            <LandingPage/>
          </Route> */}
          <Route path="/login">
            <LoginFormPage />
          </Route>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
          <Route exact path="/cafes">
            <Cafe />
          </Route>
          <Route exact path="/cafes/new">
            <CreateCafe />
          </Route>
          <Route path="/cafes/:id/edit">
            <UpdateCafe />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;


//use this thunk action inside of App.js after the App component's
//first render.
