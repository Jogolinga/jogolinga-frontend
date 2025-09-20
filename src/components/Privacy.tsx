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
            1. Informations collectées
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Photo de profil Google</li>
            <li>Identifiant unique Google</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. Utilisation des données
          </h2>
          <p className="text-gray-700">
            Nous utilisons vos informations pour :
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Créer et gérer votre compte</li>
            <li>Améliorer l’expérience utilisateur</li>
            <li>Personnaliser votre apprentissage</li>
            <li>Assurer la sécurité du service</li>
            <li>Communiquer avec vous concernant le service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. Partage des données
          </h2>
          <p className="text-gray-700">
            Vos données ne sont jamais vendues. 
            Elles peuvent être partagées uniquement avec :
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Nos prestataires techniques (hébergement, sécurité)</li>
            <li>Les autorités légales si requis par la loi</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Conservation des données
          </h2>
          <p className="text-gray-700">
            Vos données sont conservées tant que votre compte est actif. 
            Vous pouvez demander leur suppression à tout moment (voir section « Vos droits »).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. Sécurité
          </h2>
          <p className="text-gray-700">
            Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables 
            pour protéger vos données personnelles contre l’accès non autorisé, la perte ou l’altération.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. Vos droits (RGPD)
          </h2>
          <p className="text-gray-700">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Droit d’accès à vos données</li>
            <li>Droit de rectification ou suppression</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d’opposition et limitation du traitement</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            7. Cookies
          </h2>
          <p className="text-gray-700">
            Jogolinga peut utiliser des cookies techniques pour assurer le bon fonctionnement du site 
            et améliorer l’expérience utilisateur. Vous pouvez configurer votre navigateur pour bloquer 
            les cookies, mais certaines fonctionnalités pourraient être limitées.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            8. Services tiers
          </h2>
          <p className="text-gray-700">
            Jogolinga peut intégrer des services tiers (ex. Google). 
            L’utilisation de ces services est soumise à leurs propres politiques de confidentialité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            9. Modifications
          </h2>
          <p className="text-gray-700">
            Nous pouvons mettre à jour cette politique. 
            Les modifications entreront en vigueur dès leur publication sur cette page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. Contact
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
