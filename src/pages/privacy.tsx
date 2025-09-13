// src/pages/privacy.tsx
import Head from 'next/head'
import { NextPage } from 'next'

const Privacy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Politique de confidentialité - Jogolinga</title>
        <meta name="description" content="Politique de confidentialité de Jogolinga" />
      </Head>
      
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

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              2. Comment nous utilisons vos informations
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Nous utilisons les informations collectées pour :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Vous identifier et vous permettre d'accéder à votre compte</li>
              <li>Personnaliser votre expérience sur Jogolinga</li>
              <li>Améliorer nos services et fonctionnalités d'apprentissage</li>
              <li>Sauvegarder vos progrès et préférences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              3. Partage de vos informations
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
              Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Avec votre consentement explicite</li>
              <li>Pour répondre à des obligations légales</li>
              <li>Pour protéger nos droits, notre propriété ou notre sécurité</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              4. Sécurité des données
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations 
              personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction. 
              Vos données sont stockées de manière sécurisée et nous utilisons des protocoles de 
              chiffrement standards de l'industrie.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              5. Conservation des données
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Nous conservons vos informations personnelles aussi longtemps que nécessaire pour 
              fournir nos services d'apprentissage ou jusqu'à ce que vous demandiez la suppression 
              de votre compte. Vous pouvez demander la suppression de vos données à tout moment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              6. Vos droits
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification de vos données</li>
              <li>Droit à l'effacement de vos données</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement de vos données</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              7. Cookies et technologies similaires
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Jogolinga utilise des cookies essentiels pour maintenir votre session 
              d'authentification et sauvegarder vos progrès d'apprentissage. Ces cookies ne 
              collectent pas d'informations personnelles identifiables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              8. Services tiers
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Jogolinga utilise l'API Google Sign-In pour l'authentification. 
              L'utilisation de ce service est soumise à la{" "}
              <a 
                href="https://policies.google.com/privacy" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                politique de confidentialité de Google
              </a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              9. Modifications de cette politique
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
              Nous vous informerons de tout changement en publiant la nouvelle politique sur cette page 
              et en mettant à jour la date de "dernière mise à jour".
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              10. Nous contacter
            </h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Si vous avez des questions concernant cette politique de confidentialité ou 
              vos données personnelles, vous pouvez nous contacter à :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email :</strong> fatouybadjl@gmail.com<br />
                <strong>Application :</strong> Jogolinga - Plateforme d'apprentissage de langues africaines
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default Privacy
