<div id="top"></div>


<br />
<div align="center">
   <a href="https://dope-kk.herokuapp.com/"> 
    <img src="http://dogemuchwow.com/wp-content/uploads/2016/05/cropped-the-doge-favicon-blue.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Dope</h3>

  <p align="center">
    Your No.1 NYC Local Dog Cafe Guide
    <br />
    <a href="https://dope-kk.herokuapp.com"><strong>Explore the website »</strong></a>
    <br />
  </p>
</div>





<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
<img width="1413" alt="Screen Shot 2022-06-16 at 3 47 41 PM" src="https://user-images.githubusercontent.com/94200416/174152368-cf36d674-5791-42a0-b0e4-67ce20192782.png">





<p align="right">(<a href="#top">back to top</a>)</p>



### Built With
<img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"  height=40/><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height=40/><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" height=40/><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain-wordmark.svg" height=40/><img src="https://icongr.am/devicon/express-original.svg?size=128&color=ffffff" height=50/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"  height=40/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-original.svg"  height=40/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg"  height=40/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg"  height=40/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"  height=40/><img  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"  height=40/>

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kickylau/DOPE
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a PSQL user with CREATEDB PASSWORD
   ```js
   CREATE USER <name> WITH CREATEDB PASSWORD <'password'>;
   ```
   
4. Create a .env file to access the backend based on the .env.example within the respective directory
      - input desired information into .env


5. Create Database, Migrate, and Seed models.
   ```sh
   npx dotenv sequelize db:create
   npx dotenv sequelize db:migrate
   npx dotenv sequelize db:seed:all
   ```
   
6. Start the backend in the backend directory
   ```sh
   npm start
   ```
   
8. Start the frontend in the frontend directory, this should open the project in your default browser. If not, navigate to http://localhost:3000
   ```sh
   npm start
   ```
   
9. From here you can create and sign in as a user and begin using TBD NAME


<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Project Link: [https://github.com/kickylau/DOPE](https://github.com/kickylau/DOPE)
