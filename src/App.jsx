import React, { useState, useEffect } from "react"
import Fuse from "fuse.js";

const MemoisedCard = React.memo(function CardComponent({ card, chipColour }) {
  return (
    <div className={"bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between bg-white hover:bg-gray-100 transition-colors duration-200"}>
      <div className={"flex flex-row justify-between items-center mb-2"}>
        <h3 className={"text-xl font-bold mr-2"}>{card.item}</h3>
        <div className={"flex flex-row flex-wrap gap-2"}>
          {card.bins.map((bin, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs font-semibold border ${chipColour(bin.Value)}`}
            >
              {bin.Value}
            </span>
          ))}
        </div>
      </div>
      <div className={"mb-2"}>
        {card.categories.map((category, index) => (
          <div className={"text-gray-500 text-sm"} key={index}>
            {category.Value}
          </div>
        ))}
      </div>
      <hr className={"my-2"} />
      <div className={"text-gray-700 text-base"}>
        {card.description}
      </div>
    </div>
  );
});

function App(bin) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://prod-08.westeurope.logic.azure.com/workflows/ca70293f1f794cbbb7a01b83afb5ce35/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=t_1WSC4ALUlj86fVS5lBvbarJ3n3t9tabLWgL0H8Mng");
        const data = await response.json();
        data.sort((a, b) => a.item.localeCompare(b.item));
        if(bin.length > 0) {
          const filteredData = data.filter(item => {
            return item.bins.some(binItem => binItem.Value.toLowerCase() === bin.bin.toLowerCase());
          });
          setCards(filteredData);
          setSearchResults(filteredData);
        } else {
          setCards(data);
          setSearchResults(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const fuse = new Fuse(cards, {
    includeScore: true,
    includeMatches: true,
    threshold: 0.2,
    keys: ["item", "synonyms.Value"],
  })

  const handleSearch = (event) => {
    const { value } = event.target;

    if (value.length === 0) {
      setSearchResults(cards);
      return;
    }

    const results = fuse.search(value);
    const items = results.map((result) => result.item);
    setSearchResults(items);

  };

  const groupAndSort = (items) => {
    const grouped = {};
    items.forEach(item => {
      const firstLetter = item.item.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    });
    return grouped;
  };

  const chipColour = (colour) => {
    switch (colour.toLowerCase()) {
      case "blue bin":
        return "border-blue-500 text-blue-700 bg-blue-100"
      case "brown bin":
        return "border-yellow-600 text-yellow-800 bg-yellow-100"
      case "greencaddy":
        return "border-green-600 text-green-800 bg-green-100"
      default:
        return "border-gray-400 text-gray-600 bg-gray-100"
    }
  }

  const groupedResults = groupAndSort(searchResults);

  return (
    <>
      {loading ? (
        <div className={"flex justify-center items-center h-72"}>
          <span className={"w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin inline-block"}></span>
        </div>
      ) : (
        <div className={"flex flex-col w-full px-5 bg-gray-50"}>
          <div className={"sticky top-0 z-10 px-5 py-2 backdrop-blur-lg bg-white bg-opacity-80 border-b border-gray-200"}>
            <input
              type="text"
              placeholder="Filter items..."
              className={"w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"}
              onChange={handleSearch}
            />
            <div className={"flex flex-row flex-wrap gap-2 overflow-x-auto pb-2"}>
              {Object.keys(groupedResults).sort().map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className={"px-3 py-1 border border-blue-400 rounded text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold text-base"}
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
          <ul className={"w-full mt-5"}>
            {Object.keys(groupedResults).sort().map(letter => (
              <li key={letter} className={"w-full border border-gray-200 rounded p-4 mb-4"}>
                <div className={"w-full"} id={letter}>
                  <h2 className={"text-2xl font-bold my-4"}>{letter}</h2>
                  <div className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
                    {groupedResults[letter].map((card, index) => (
                      <MemoisedCard card={card} chipColour={chipColour} index={index} key={index} />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default App