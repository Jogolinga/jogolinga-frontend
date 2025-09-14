import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Politique de confidentialité
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Informations que nous collectons
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Lorsque vous utilisez Jogolinga avec l'authentification Google, nous collectons :
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Votre nom et prénom</li>
            <li>Votre adresse email</li>
            <li>Votre photo de profil Google</li>
            <li>Un identifiant unique fourni par Google</li>
          </ul>
        </section>

        {/* Ajoutez le reste du contenu ici */}
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. Nous contacter
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">
              <strong>Email :</strong> ceddoshop@gmail.com<br />
              <strong>Application :</strong> Jogolinga
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
