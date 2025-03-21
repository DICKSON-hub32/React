import React from "react";

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)} // This is an event handler that updates the searchTerm state with the value of the input field.
        />
      </div>
    </div>
  );
};

export default Search;
// This is a simple component that returns a div element with the text "Search".
