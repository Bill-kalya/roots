import React from 'react';
import './Basket.css';

function Basket() {
  return (
    <div className="App">
      <nav className="nav-wrapper">
        <h1>Roots</h1>
      </nav>

      <div className="search-wrapper">
        <div className="container-input">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>

      <div className="card-container">
        <div className="card">
          <h2>Card One</h2>
          <p>Some content here for the first card.</p>
          <a href="#">Read more</a>
        </div>
        <div className="card">
          <h2>Card Two</h2>
          <p>Some content here for the second card.</p>
          <a href="#">Read more</a>
        </div>
        <div className="card">
          <h2>Card Three</h2>
          <p>Some content here for the third card.</p>
          <a href="#">Read more</a>
        </div>
      </div>

      <div className="button-wrapper">
        <button className="btn">Click Me</button>
      </div>
    </div>
  );
}

export default Basket;