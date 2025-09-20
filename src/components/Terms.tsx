import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Conditions générales d’utilisation
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-6">
          <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            1. Acceptation des conditions
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            En accédant et en utilisant Jogolinga, vous acceptez d’être lié par les présentes conditions générales d’utilisation. 
            Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser notre service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            2. Description du service
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Jogolinga est une plateforme interactive dédiée à l’apprentissage des langues africaines. 
            Le service inclut des cours, des exercices et divers outils pédagogiques. 
            L’accès est possible uniquement via une authentification Google sécurisée.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            3. Compte utilisateur
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Être âgé d’au moins 13 ans (ou l’âge minimum légal dans votre pays)</li>
            <li>Disposer d’un compte Google valide</li>
            <li>Fournir des informations exactes et à jour</li>
            <li>Assurer la confidentialité de vos identifiants</li>
            <li>Utiliser le service uniquement à des fins éducatives légitimes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            4. Utilisation interdite
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Vous vous engagez à ne pas :
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700">
            <li>Utiliser le service à des fins illégales ou frauduleuses</li>
            <li>Diffuser du contenu inapproprié, offensant ou discriminatoire</li>
            <li>Violer des droits d’auteur ou marques déposées</li>
            <li>Télécharger des virus ou interférer avec la sécurité</li>
            <li>Harceler ou menacer d’autres utilisateurs</li>
            <li>Redistribuer ou commercialiser les contenus sans autorisation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            5. Propriété intellectuelle
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Tous les contenus, outils et fonctionnalités de Jogolinga sont protégés par les lois applicables 
            en matière de droits d’auteur et de propriété intellectuelle, et restent la propriété exclusive 
            de Jogolinga et de ses concédants.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            6. Contenu utilisateur
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Vous conservez vos droits sur tout contenu que vous créez sur Jogolinga (notes, exercices, etc.). 
            Toutefois, vous accordez à Jogolinga une licence limitée, non exclusive et gratuite 
            pour héberger, afficher et distribuer vos contenus uniquement dans le cadre du service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            7. Disponibilité du service
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Nous faisons de notre mieux pour assurer la disponibilité continue du service, 
            mais nous ne pouvons pas garantir une accessibilité sans interruption. 
            Des maintenances ou incidents techniques peuvent limiter temporairement l’accès.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            8. Limitation de responsabilité
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Dans les limites autorisées par la loi, Jogolinga ne peut être tenu responsable des dommages 
            indirects ou consécutifs liés à l’utilisation du service. Notre responsabilité ne pourra excéder 
            le montant payé pour le service durant les 12 mois précédents.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            9. Résiliation
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Vous pouvez supprimer votre compte à tout moment. 
            Nous nous réservons le droit de suspendre ou de résilier un compte en cas de non-respect des présentes conditions. 
            Vos données seront traitées conformément à notre politique de confidentialité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            10. Modifications
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Nous pouvons modifier ces conditions à tout moment. 
            Les nouvelles conditions seront applicables dès leur publication sur cette page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            11. Droit applicable
          </h2>
          <p className="mb-4 text-gray-700 leading-relaxed">
            Les présentes conditions sont régies par le droit français. 
            Tout litige sera soumis à la compétence exclusive des tribunaux français.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            12. Contact
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

export default Terms;
