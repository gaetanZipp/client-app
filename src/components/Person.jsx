import React, { useEffect, useRef, useState } from 'react';
import { URL_BACKEND } from '../utils/url_back';
import Loading from './Loading'; // Assurez-vous que ce composant existe

const Person = () => {
  const treeRef = useRef(null);
  const [familyData, setFamilyData] = useState([]);
  const [familyTree, setFamilyTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour charger les données depuis l'API
  const fetchFamilyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const familyTreeId = localStorage.getItem('familyTreeId');
      const token = localStorage.getItem('token');

      if (!familyTreeId) {
        throw new Error('Selectionne un arbre genealogique valide!');
      }

      const response = await fetch(`${URL_BACKEND}/api/Persons/familytree/${familyTreeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      //console.log("Donnees brutes: ",data);
      const transformedData = data.map((person) => ({
        id: person.id.toString(),
        name: person.name || '',
        gender: person.gender || '',
        birthDate: person.birthDate || '',
        deathDate: person.deathDate || '',
        fid: person.fid?.toString() || null,
        mid: person.mid?.toString() || null,
        pids: person.pids?.map(pid => pid.toString()) || [],
      }));

      //console.log("Donnees transformees",transformedData);

      setFamilyData(transformedData);
    } catch (err) {
      setError(err.message);
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchFamilyData();
  }, []);

  // Initialiser FamilyTree.js
  useEffect(() => {
    let scriptLoaded = false;

    const existingScript = document.querySelector('script[src="https://balkan.app/js/FamilyTree.js"]');
    if (existingScript) {
      scriptLoaded = true;
      initializeFamilyTree();
    } else {
      const script = document.createElement('script');
      script.src = 'https://balkan.app/js/FamilyTree.js';
      script.async = true;
      script.onload = () => {
        scriptLoaded = true;
        initializeFamilyTree();
        console.log('FamilyTree.js chargé avec succès');
      };
      script.onerror = (error) => {
        setError('Erreur lors du chargement de FamilyTree.js');
        console.error('Erreur lors du chargement du script FamilyTree:', error);
      };
      document.body.appendChild(script);
    }

    function initializeFamilyTree() {
      if (window.FamilyTree && treeRef.current && familyData.length > 0) {
        try {
          if (familyTree) {
            familyTree.destroy();
          }

          const family = new window.FamilyTree(treeRef.current, {
            mode: 'dark',
            mouseScroll: window.FamilyTree.action.ctrlZoom,
            nodeTreeMenu: true,
            nodeBinding: {
              field_0: 'name',
              field_1: 'birthDate',
            },
            menu: {
              pdf: { text: 'Exporter PDF' },
              png: { text: 'Exporter PNG' },
              svg: { text: 'Exporter SVG' },
              xml: { text: 'Exporter XML' },
              json: { text: 'Exporter JSON' },
            },
            nodes: familyData,
          });

          setFamilyTree(family);

          // Événement pour mettre à jour ou ajouter des nœuds
          family.onUpdateNode(async (args) => {
            try {
              const token = localStorage.getItem('token');
              const familyTreeId = localStorage.getItem('familyTreeId');

              if (!token) {
                throw new Error('Aucun token d\'authentification trouvé');
              }

              const payload = {
                familyTreeId,
                addNodesData: args.addNodesData || [],
                updateNodesData: args.updateNodesData || [],
              };

              const response = await fetch(`${URL_BACKEND}/api/Persons/Update`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                throw new Error(`Erreur lors de la mise à jour: ${response.status}`);
              }

              const oldId_newId = await response.json();
              if (Object.keys(oldId_newId).length > 0) {
                family.replaceIds(oldId_newId);
              }

              await fetchFamilyData(); // Recharger les données
            } catch (error) {
              setError('Erreur lors de la mise à jour de l\'arbre');
              console.error('Erreur lors de la mise à jour:', error);
            }

            return false; // Empêcher la mise à jour par défaut
          });

        } catch (error) {
          // setError('Erreur lors de l\'initialisation de l\'arbre');
          console.error('Erreur lors de l\'initialisation de FamilyTree:', error);
        }
      }
    }

    return () => {
      if (familyTree) {
        try {
          familyTree.destroy();
        } catch (error) {
          console.error('Erreur lors de la destruction de FamilyTree:', error);
        }
      }
    };
  }, [familyData]);

  return (
    <div className="w-full h-[90vh] bg-primary">
      {loading && <Loading />}
      {error && (
        <p className="text-[#f64949fe] p-4" role="alert">
          {error}
        </p>
      )}
      <div
        ref={treeRef}
        className='w-full h-full text-ascent-2'
        aria-label="Arbre généalogique"
      ></div>
    </div>
  );
};

export default Person;