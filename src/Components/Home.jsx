import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ClipLoader } from 'react-spinners';
import { FaRegStar, FaStar } from "react-icons/fa";

const imageObj = {
  bug: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/bugIcon.png'),
  dark: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/darkIcon.png'),
  dragon: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/dragonIcon.png'),
  electric: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/electricIcon.png'),
  fairy: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/fairyIcon.png'),
  fighting: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/fightingIcon.png'),
  fire: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/fireIcon.png'),
  flying: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/flyingIcon.png'),
  ghost: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/ghostIcon.png'),
  grass: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/grassIcon.png'),
  ground: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/groundIcon.png'),
  ice: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/iceIcon.png'),
  normal: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/normalIcon.png'),
  poison: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/poisonIcon.png'),
  psychic: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/psychicIcon.png'),
  rock: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/rockIcon.png'),
  steel: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/steelIcon.png'),
  water: ('https://crossur.github.io/Pokemon-Weakness-Finder/assets/images/waterIcon.png'),
};


const fetchTypes = async (pokemon) => {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`).then(data => data.json());
  const result = Object.values(data.types);
  let types = [];
  for (let item of result) types.push(item.type.name);
  return types;
};

const fetchRelations = async (pokemonName, ...types) => {
  let damageRelations = {
    "normal": 1,
    "fire": 1,
    "water": 1,
    "electric": 1,
    "grass": 1,
    "ice": 1,
    "fighting": 1,
    "poison": 1,
    "ground": 1,
    "flying": 1,
    "psychic": 1,
    "bug": 1,
    "rock": 1,
    "ghost": 1,
    "dragon": 1,
    "dark": 1,
    "steel": 1,
    "fairy": 1,
  };

  if (pokemonName === 'shedinja') return {
    "normal": 0,
    "fire": 2,
    "water": 0,
    "electric": 0,
    "grass": 0,
    "ice": 0,
    "fighting": 0,
    "poison": 0,
    "ground": 0,
    "flying": 2,
    "psychic": 0,
    "bug": 0,
    "rock": 2,
    "ghost": 2,
    "dragon": 0,
    "dark": 2,
    "steel": 0,
    "fairy": 0
  }

  for (const type of types) {
    const data = await fetch(`https://pokeapi.co/api/v2/type/${type}`).then(data => data.json());
    const doubleDamage = Object.values(data.damage_relations.double_damage_from);
    const halfDamage = Object.values(data.damage_relations.half_damage_from);
    const noDamage = Object.values(data.damage_relations.no_damage_from);

    for (const item of noDamage) damageRelations[item.name] *= 0;
    for (const item of halfDamage) damageRelations[item.name] *= 0.5;
    for (const item of doubleDamage) damageRelations[item.name] *= 2;
  }

  return damageRelations;
}

const fetchPokemon = async () => {
  let allPokemon = [];
  let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=200';

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();

    const pokemonBatch = await Promise.all(data.results.map(async (pokemon) => {
      const types = await fetchTypes(pokemon.name); 
      const damageRelations = await fetchRelations(pokemon.name, ...types);
      return {
        value: pokemon.name,
        label: pokemon.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split("/")[6]}.png`,
        types: types,
        damageRelations: damageRelations
      };
    }));

    allPokemon = [...allPokemon, ...pokemonBatch];
    nextUrl = data.next;
  }

  localStorage.setItem('pokemonArray', JSON.stringify(allPokemon));
  return allPokemon;
};

const PokemonAutoComplete = () => {
  const [options, setOptions] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true); 
  const [history,setHistory] = useState([]);
  const [favorites,setFavorites] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites)); 
    }
  }, []);
      
  useEffect(() => {

    if(history.length > 7) {
      setHistory((prev) => prev.slice(1,8));
    }

    if(favorites.length > 7) {
      setFavorites((prev) => prev.slice(1,8));
    }
      
    localStorage.setItem('history', JSON.stringify(history));
        
    localStorage.setItem('favorites', JSON.stringify(favorites));

    console.log('favorites:',favorites);

    const loadPokemon = async () => {
      const storedData = localStorage.getItem('pokemonArray');
      if (storedData) {
        setOptions(JSON.parse(storedData)); 
        setLoading(false); 
      } else {
        const data = await fetchPokemon();
        setOptions(data);
        setLoading(false); 
      }
    };

    loadPokemon();
  }, [history,favorites]);

  const renderHistory = () => {
    return (
      <div className="mt-6 text-left flex flex-wrap border-4 rounded-lg opacity-0 md:opacity-100 min-h-[120px]">
        {history.map((pokemon) => {
          const isFavorite = favorites.some(fav => fav.label === pokemon.label);
          
          return (
            <div key={pokemon.label} className="relative flex items-center mr-6 mb-4 cursor-pointer w-full shadow-xl" onClick={() => {
              setSelectedPokemon(pokemon);
            }}>
              <img
                src={pokemon.image}
                alt={pokemon.label}
                className="w-24 mr-4"
              />
              <h2 className="opacity-0 lg:opacity-100 text-md text-white" style={{ fontFamily: 'pokemon' }}>{pokemon.label}</h2>
              
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-600" 
                onClick={(e) => {
                  e.stopPropagation(); 
                  if (isFavorite) {
                    setFavorites(favorites.filter(fav => fav.label !== pokemon.label));
                  } else {
                    setFavorites([...favorites, pokemon]);
                  }
                }}
              >
                {isFavorite ? <FaStar /> : <FaRegStar />}
              </button>
            </div>
          );
        })}
      </div>
    );
  };
  

  const renderFavorites = () => {

    return (
      <div className="mt-6 text-left flex flex-wrap border-4 rounded-lg opacity-0 md:opacity-100 min-h-[120px]">

        {favorites.map((pokemon) => (
          
          <div key={pokemon.label} className="relative flex items-center mr-6 mb-4 cursor-pointer w-full shadow-xl" onClick={() => {
            console.log(pokemon);
            setSelectedPokemon(pokemon);
          }}>
            <img src={pokemon.image} alt={pokemon.label} className="w-24 mr-4" />

            <h2 className="text-md text-white" style={{ fontFamily: 'pokemon' }}>{pokemon.label}</h2>
            
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-400 hover:text-yellow-600"
              onClick={(e) => {
                e.stopPropagation();
                setFavorites(favorites.filter(fav => fav.label !== pokemon.label));
              }}
            >
              <FaStar/>
            </button>
          </div>
        ))}
      </div>
    );
  };
  
      
  const customSingleValue = ({ data }) => (
    <div className="flex items-center p-0 m-0 space-x-2">
      <img src={data.image} alt={data.label} className="w-8 h-8 rounded-full" />
      <span className="text-sm font-semibold text-gray-800"style={{fontFamily:'pokemon'}}>{data.label}</span>
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;

    return (
      <div ref={innerRef} {...innerProps} className="flex items-center p-3 hover:bg-red-500 cursor-pointer rounded-lg transition-all duration-200 ease-in-out">
        <img src={data.image} alt={data.label} className="w-8 h-8 rounded-full mr-4" />
        <span className="text-sm font-medium text-black"style={{fontFamily:'pokemon'}}>{data.label}</span>
      </div>
    );
  };

  const handleInputChange = (newValue) => {
    setInputValue(newValue);
  };

  const filteredOptions = options.filter((pokemon) => {
    return pokemon.label.toLowerCase().includes(inputValue.toLowerCase());
  }).slice(0, 50);

  const renderDamageRelations = (pokemon) => {
    const { damageRelations } = pokemon;
  
    const weaknesses = [];
    const resistances = [];
    const normal = [];
    const quadWeakness = [];
    const quadResistance = [];
    const noDamage = [];
  
    for (const [type, damage] of Object.entries(damageRelations)) {
      if (damage === 4) {
        quadWeakness.push(type);  
        weaknesses.push(type);   
      } else if (damage === 2) {
        weaknesses.push(type);   
      } else if (damage === 1) {
        normal.push(type);       
      } else if (damage === 0.5) {
        resistances.push(type); 
      } else if (damage === 0.25) {
        quadResistance.push(type); 
        resistances.push(type);    
      } else if (damage === 0) {
        noDamage.push(type);
      }
    }
  
    return (
      <div>

       {weaknesses.length>1 && <div className="mt-4">
          <h3 className="text-md text-white" style={{fontFamily:'pokemon'}}>{pokemon.label}'s Weaknesses:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {weaknesses.map((type, index) => (
              <div className="flex items-center justify-center group relative" key={type}>
                <img
                  src={imageObj[type]}
                  className={`${quadWeakness.includes(type) ? 'animate-bounce' : ''}`}
                  alt={type}
                />
                {quadWeakness.includes(type) && (
                  <span className="absolute text-[.5rem] md:text-xs bg-black text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-90 transition-opacity duration-300" style={{fontFamily:'pokemon'}}>
                    {pokemon.label} has a quadruple weakness to {type}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>}
    
        {normal.length>1 && <div className="mt-4">
          <h3 className="text-md text-white"style={{fontFamily:'pokemon'}}>{pokemon.label} takes normal damage from:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {normal.map((type) => (
              <div className="flex items-center justify-center" key={type}>
                <img src={imageObj[type]} alt={type} />
              </div>
            ))}
          </div>
        </div>}
    
       {resistances.length>1 && <div className="mt-4">
          <h3 className="text-md text-white"style={{fontFamily:'pokemon'}}>{pokemon.label}'s Resistances:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {resistances.map((type, index) => (
              <div className="flex items-center justify-center group relative" key={type}>
                <img
                  src={imageObj[type]}
                  className={`${quadResistance.includes(type) ? 'animate-bounce' : ''}`}
                  alt={type}
                />
                {quadResistance.includes(type) && (
                  <span className="absolute text-[0.5rem] md:text-xs bg-black text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-90 transition-opacity duration-300"style={{fontFamily:'pokemon'}}>
                    {pokemon.label} has a quadruple resistance to {type}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>}

        {noDamage.length>1 && <div className="mt-4">
          <h3 className="text-xl font-semibold text-white">{pokemon.label} takes no damage from:</h3>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {noDamage.map((type) => (
              <div className="flex items-center justify-center" key={type}>
                <img src={imageObj[type]} alt={type} />
              </div>
            ))}
          </div>
        </div>}
      </div>
    );    
  };
  
  
  
  

  return (
    <div className={`w-full h-screen flex justify-center items-start lg:pt-[2rem] translate-x-[40px]`}>
      {
        <div className="w-1/4 h-full flex flex-col justify-start lg:-translate-x-[7rem] -translate-y-[24px]">
          <h2 className="text-2xl text-center translate-y-[1rem] font-bold text-white opacity-0 md:opacity-100 mb-4" style={{ fontFamily: 'pokemon' }}>
            History
          </h2>
          {renderHistory()}
        </div>
      }
  
      <div className="w-full max-w-md flex flex-col justify-center items-center p-6 -translate-x-[47px]">
        <h1 className="text-2xl font-bold text-center text-white mb-6" style={{ fontFamily: 'pokemon' }}>Select a Pokémon</h1>
  
        {loading && (
          <div className="flex flex-col justify-center items-center mb-6">
            <div className='mb-2' style={{ fontFamily: 'pokemon' }}>Filling Pokedex</div>
            <ClipLoader color="#4A90E2" loading={loading} size={50} />
          </div>
        )}
  
        <div className="flex justify-center w-full">
          <Select
            options={filteredOptions}
            formatOptionLabel={(e) => (
              <div className="flex items-center space-x-3">
                <img src={e.image} alt={e.label} className="w-8 h-8 rounded-full" />
                <span className="text-lg font-medium text-gray-700">{e.label}</span>
              </div>
            )}
            components={{ SingleValue: customSingleValue, Option: customOption }}
            onChange={(selected) => {
              if (!history.some(pokemon => pokemon.label === selected.label)){
                setHistory([...history, selected]);
                localStorage.setItem('history',[selected]);
              }
              setSelectedPokemon(selected);
            }}
            onInputChange={handleInputChange}
            menuPortalTarget={document.body}
            menuPlacement="auto"
            className="z-50"
            isDisabled={loading} 
            value={selectedPokemon}
            styles={{
              control: (provided) => ({
                ...provided,
                minWidth: '200px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }),
            }}
          />
        </div>
  
        {selectedPokemon && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'pokemon' }}>{selectedPokemon.label}</h2>
            <button 
              onClick={() => {
                if (favorites.some(pokemon => pokemon.label === selectedPokemon.label)) {
                  setFavorites(favorites.filter(pokemon => pokemon.label !== selectedPokemon.label));
                } else {
                  setFavorites([...favorites, selectedPokemon]);
                }
              }} 
              className={`hidden md:inline-block mt-2 transform hover:scale-110 transition-transform duration-200 font-bold py-2 px-4 rounded text-white ${favorites.some(pokemon => pokemon.label === selectedPokemon.label) ? 'bg-red-800 hover:bg-black' : 'bg-black hover:bg-red-800'}`}
            >
              {favorites.some(pokemon => pokemon.label === selectedPokemon.label) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            <img src={selectedPokemon.image} alt={selectedPokemon.label} className="w-24 h-24 mx-auto mt-4" />
            {renderDamageRelations(selectedPokemon)}
          </div>
        )}
      </div>
  
        <div className="w-1/4 h-full justify-start -translate-y-[24px]">
          <h2 className="text-2xl text-center translate-y-[1rem] font-bold text-white opacity-0 md:opacity-100 mb-4" style={{ fontFamily: 'pokemon' }}>
            Favorites
          </h2>
          {renderFavorites()}
        </div>
    </div>
  );
};

export default PokemonAutoComplete;
