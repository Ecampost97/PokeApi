import React, { useState, useEffect } from 'react';
import { 
  getPokemonList, 
  getPokemonTypes, 
  getPokemonGenerations, 
  getPokemonsByType, 
  getPokemonsByGeneration 
} from './services/pokeApi';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  
  const [activeView, setActiveView] = useState('menu');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGen, setSelectedGen] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [featuredPokemons, setFeaturedPokemons] = useState([]);

  // Carga inicial y selección de Pokémon icónicos para el banner
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getPokemonList(151);
      const typesData = await getPokemonTypes();
      const genData = await getPokemonGenerations();

      const validTypes = typesData.filter(
        (t) => t.name !== 'unknown' && t.name !== 'shadow' && t.name !== 'stellar'
      );

      // Cargar Pokémon icónicos (Pikachu, Charizard, Snorlax, Gengar, Lucario, Mew)
      const featuredIds = [25, 6, 143, 94, 448, 150];
      const featuredPromises = featuredIds.map(async (id) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        return await res.json();
      });
      const featuredData = await Promise.all(featuredPromises);

      setPokemons(data);
      setFilteredPokemons(data);
      setTypes(validTypes);
      setGenerations(genData);
      setFeaturedPokemons(featuredData);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectGeneration = async (genName) => {
    if (genName === selectedGen) {
      setSelectedGen('');
      setFilteredPokemons(pokemons);
      return;
    }
    setSelectedGen(genName);
    setSelectedType('');
    setLoadingFilter(true);
    const data = await getPokemonsByGeneration(genName);
    setFilteredPokemons(data);
    setLoadingFilter(false);
  };

  const handleSelectType = async (typeName) => {
    if (typeName === selectedType) {
      setSelectedType('');
      setFilteredPokemons(pokemons);
      return;
    }
    setSelectedType(typeName);
    setSelectedGen('');
    setLoadingFilter(true);
    const data = await getPokemonsByType(typeName);
    setFilteredPokemons(data);
    setLoadingFilter(false);
  };

  // Función de Búsqueda explícita con el botón
  const handleSearch = () => {
    if (searchTerm.trim() === '') return;
    
    const term = searchTerm.toLowerCase().trim();
    const result = pokemons.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.id.toString() === term
    );
    
    setFilteredPokemons(result);
    setActiveView('catalog'); // Cambia a la vista de resultados
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredPokemons(pokemons);
    setActiveView('menu');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>⚡ Inicializando ChronosDB...</h2>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Encabezado */}
      <header className="app-header">
        <div className="header-title" onClick={() => { setActiveView('menu'); handleClearSearch(); }} style={{ cursor: 'pointer' }}>
          <span className="pokeball-icon">🔷</span>
          <h1>ChronosDB</h1>
        </div>
        <p className="header-subtitle">Archivo Central de Entidades y Atributos</p>
      </header>

      {/* Barra de Búsqueda con Botones BUSCAR y LIMPIAR */}
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Consultar entidad por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button className="search-action-btn" onClick={handleSearch}>
            BUSCAR
          </button>
          <button className="clear-action-btn" onClick={handleClearSearch}>
            LIMPIAR
          </button>
        </div>
      </div>

      {/* Menú Principal */}
      {activeView === 'menu' && (
        <main className="menu-container">
          <h2 className="section-title">ÍNDICE DE CONSULTA</h2>
          
          {/* Botones principales a la par */}
          <div className="main-buttons-grid two-columns">
            <button 
              className="pink-btn"
              onClick={() => setActiveView('generations')}
            >
              ⚡ GENERACIONES
            </button>
            <button 
              className="pink-btn"
              onClick={() => setActiveView('types')}
            >
              🔥 TIPOS
            </button>
          </div>

          {/* Banner de Entidades Destacadas (Solo Imágenes Grandes) */}
          <div className="featured-banner-container">
            <div className="banner-pokemons-row">
              {featuredPokemons.map((poke) => (
                <div 
                  key={poke.id} 
                  className="banner-poke-item"
                  onClick={() => setSelectedPokemon(poke)}
                  title={poke.name.toUpperCase()}
                >
                  <img src={poke.sprites.front_default} alt={poke.name} />
                </div>
              ))}
            </div>
          </div>

          {/* Frase Icónica de Pokémon ubicada exactamente en el espacio marcado */}
          <div className="pokemon-quote-container">
            <p className="pokemon-quote">✨ "¡Atraparlos es mi destino, mi misión es triunfar!" ✨</p>
          </div>
        </main>
      )}

      {/* Vista con Cinta de Opciones Fija */}
      {activeView !== 'menu' && (
        <div className="view-container">
          <div className="nav-bar-top">
            <button 
              className="back-btn" 
              onClick={() => {
                setActiveView('menu');
                setSelectedType('');
                setSelectedGen('');
                handleClearSearch();
              }}
            >
              ⬅ Índice Principal
            </button>
          </div>

          {/* Cinta de Generaciones */}
          {activeView === 'generations' && (
            <div className="persistent-ribbon">
              <h3>Selecciona una Generación:</h3>
              <div className="chips-grid">
                {generations.map((g, idx) => (
                  <button 
                    key={g.name} 
                    className={`chip ${selectedGen === g.name ? 'active' : ''}`}
                    onClick={() => handleSelectGeneration(g.name)}
                  >
                    GEN {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cinta de Tipos */}
          {activeView === 'types' && (
            <div className="persistent-ribbon">
              <h3>Selecciona un Tipo:</h3>
              <div className="chips-grid">
                {types.map((t) => (
                  <button 
                    key={t.name} 
                    className={`chip ${selectedType === t.name ? 'active' : ''}`}
                    onClick={() => handleSelectType(t.name)}
                  >
                    {t.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indicador de carga al filtrar */}
          {loadingFilter ? (
            <div className="loading-container">
              <h3>Sincronizando registros... ⚡</h3>
            </div>
          ) : (
            /* Listado de Entidades */
            <div className="catalog-section">
              <div className="pokemon-grid">
                {filteredPokemons.length > 0 ? (
                  filteredPokemons.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="pokemon-card"
                      onClick={() => setSelectedPokemon(pokemon)}
                    >
                      <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
                      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                      <h3>{pokemon.name.toUpperCase()}</h3>
                      <div className="card-types">
                        {pokemon.types.map((t, idx) => (
                          <span key={idx} className={`type-badge ${t.type.name}`}>
                            {t.type.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">No se encontraron entidades con estos parámetros.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Ficha Técnica Detallada */}
      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="pokemon-details-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPokemon(null)}>✖</button>
            
            <div className="card-header-title">
              <span className="tech-number">#{String(selectedPokemon.id).padStart(3, '0')}</span>
              <h2 className="tech-name">{selectedPokemon.name.toUpperCase()}</h2>
            </div>

            <div className="tech-body-grid">
              <div className="tech-left-col">
                <div className="tech-image-container">
                  <img
                    src={selectedPokemon.sprites.other?.['official-artwork']?.front_default || selectedPokemon.sprites.front_default}
                    alt={selectedPokemon.name}
                    className="tech-main-img"
                  />
                </div>
                
                <div className="tech-types-row">
                  {selectedPokemon.types.map((t, idx) => (
                    <span key={idx} className={`type-badge ${t.type.name}`}>
                      {t.type.name}
                    </span>
                  ))}
                </div>

                <div className="tech-measures">
                  <span>⚖️ {selectedPokemon.weight / 10} kg</span>
                  <span>📏 {selectedPokemon.height / 10} m</span>
                </div>
              </div>

              <div className="tech-right-col">
                <div className="tech-section-box">
                  <h3>FICHA TÉCNICA</h3>
                  
                  <div className="tech-info-group">
                    <span className="tech-label">Atributo primario:</span>
                    <p className="tech-value">
                      • {selectedPokemon.abilities[0]?.ability.name || 'Desconocida'}
                    </p>
                  </div>

                  <div className="tech-info-group">
                    <span className="tech-label">Movimientos registrados:</span>
                    <ul className="tech-moves-list">
                      {selectedPokemon.moves.slice(0, 4).map((m, idx) => (
                        <li key={idx}>{m.move.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="tech-stats-footer">
              <div className="stat-item">
                <span className="stat-icon">❤️</span>
                <span className="stat-val">{selectedPokemon.stats[0]?.base_stat || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚔️</span>
                <span className="stat-val">{selectedPokemon.stats[1]?.base_stat || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🛡️</span>
                <span className="stat-val">{selectedPokemon.stat ? selectedPokemon.stats[2]?.base_stat : 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span className="stat-val">{selectedPokemon.stats[5]?.base_stat || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;