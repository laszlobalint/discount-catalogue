import { CATEGORIES } from './../_models/models';

export function iconChooser(category: string): string {
  switch (category) {
    case CATEGORIES[1]:
      return 'etel_ital.png';
    case CATEGORIES[2]:
      return 'auto_motor.png';
    case CATEGORIES[3]:
      return 'egeszseg.png';
    case CATEGORIES[4]:
      return 'foto.png';
    case CATEGORIES[5]:
      return 'szabadido.png';
    case CATEGORIES[6]:
      return 'szallas_utazas.png';
    case CATEGORIES[7]:
      return 'egyeb.png';
    case CATEGORIES[8]:
      return 'sport.png';
    case CATEGORIES[9]:
      return 'informatika.png';
    case CATEGORIES[10]:
      return 'konyv.png';
    case CATEGORIES[11]:
      return 'ruha.png';
    case CATEGORIES[12]:
      return 'szepsegapolas.png';
    case CATEGORIES[13]:
      return 'szinhaz_mozi.png';
    case CATEGORIES[14]:
      return 'sportegyesulet.png';
    case CATEGORIES[15]:
      return 'maganoktatas.png';
    case CATEGORIES[16]:
      return 'rendezvenyszervezes.png';
    case CATEGORIES[17]:
      return 'barkacs_haztartas_szerszam.png';
    default:
      return 'egyeb.png';
  }
}
