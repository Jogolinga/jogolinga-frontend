// src/data/languages/lingala/categories/index.ts
import { CategoryDictionary } from '../../../../types/types';

import salutations from './salutations';
import {nombres} from './nombres';
import {temps} from './temps';
import {animaux} from './animaux';
import {famille} from './famille';
import {nourriture} from './nourritures';
import {couleurs} from './couleurs';
import {corps} from './corps';
import {verbes} from './verbes';
import {grammaire} from './grammaire';
import {objets} from './objets'

export const categories: CategoryDictionary = {
  'Salutations et expressions courantes': salutations,
  'Nombres': nombres,
  'Temps': temps,
  'Animaux': animaux,
  'Famille': famille,
  'Nourriture': nourriture,
  'Couleurs': couleurs,
  'Corps': corps,
  'Verbes': verbes,
  'Grammaire': grammaire,
  'Objets du quotidien' : objets
  
};

export default categories;