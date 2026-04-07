
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '3',
    name: {
      en: 'Aloe Flowers',
      fr: 'Aloe Flowers',
      es: 'Aloe Flowers'
    },
    subtitle: {
      en: '60x20 cm | unframed',
      fr: '60x20 cm | sans cadre',
      es: '60x20 cm | sin marco'
    },
    price: 76.00,
    description: {
      en: 'Aloe Flowers is an unframed textile piece celebrating the striking beauty of aloe blossoms. With its vibrant colors and organic forms, this artwork brings a touch of nature and life to your interior.',
      fr: 'Aloe Flowers est une toile non encadrée célébrant la beauté saisissante des fleurs d\'aloès. Avec ses couleurs vives et ses formes organiques, cette œuvre apporte une touche de nature et de vie à votre intérieur.',
      es: 'Aloe Flowers es una pieza textil sin enmarcar que celebra la llamativa belleza de las flores de aloe. Con sus colores vibrantes y formas orgánicas, esta obra de arte aporta un toque de naturaleza y vida a su interior.'
    },
    images: [
      'https://storage.googleapis.com/atip_storage/Aloe%20Flower%201.jpg',
      'https://storage.googleapis.com/atip_storage/Aloe%20Flower%202.jpg',
      'https://storage.googleapis.com/atip_storage/Aloe%20Flower%203.jpg',
    ],
  },
  {
    id: '2',
    name: {
      en: 'Festive Night',
      fr: 'Nuit Festive',
      es: 'Noche festiva'
    },
    subtitle: {
      en: '20x60 cm | framed',
      fr: '20x60 cm | encadré',
      es: '20x60 cm | enmarcado'
    },
    // Fix: removed leading zero from numeric literal to resolve parsing error
    price: 89.90,
    paymentLink: 'https://buy.stripe.com/test_festive_night_framed',
    description: {
      en: "On this first day of the year, beneath the glow of fireworks lighting up the night sky, the Sapeurs celebrate and adorn themselves in red. A red that, freed from the Western prism, does not signal danger, but calls forth life and success.\n\nIn Yoruba and Ashanti cultures, the transition between December 31st and January 1st represents a moment of great vulnerability, when the negative energies of the past year seek to make their way into the new one. To guard against this, it is customary to mark the entrance of homes or the foreheads of children with laterite or camwood before the celebration. Recognizable for their deep red tones and known for their protective properties.\n\nThrough this artwork, our wish is that this textile does more than simply adorn your space,  that it brings with it an aura of protection and renewed vitality. By welcoming “Festive Night” into your home, you invite the strength of a heritage that watches over every new beginning.",
      fr: "En ce premier jour de l'année, sous l'éclat des feux d'artifice illuminant le ciel nocturne, les Sapeurs célèbrent et se parent de rouge. Un rouge qui, libéré du prisme occidental, ne signale pas le danger, mais appelle à la vie et au succès.\n\nDans les cultures Yoruba et Ashanti, la transition entre le 31 décembre et le 1er janvier représente un moment de grande vulnérabilité, où les énergies négatives de l'année écoulée cherchent à se frayer un chemin dans la nouvelle. Pour s'en prémunir, il est d'usage de marquer l'entrée des maisons ou le front des enfants avec de la latérite ou du bois de cam avant la célébration. Reconnaissables à leurs tons rouges profonds et connus pour leurs propriétés protectrices.\n\nÀ travers cette œuvre, notre souhait est que ce textile fasse plus que simplement orner votre espace, qu'il apporte avec lui une aura de protection et une vitalité renouvelée. En accueillant « Nuit Festive » dans votre foyer, vous invitez la force d'un héritage qui veille sur chaque nouveau départ.",
      es: "En este primer día del año, bajo el resplandor de los fuegos artificiales que iluminan el cielo nocturno, los Sapeurs celebran y se adornan de rojo. Un rojo que, liberado del prisma occidental, no señala peligro, sino que invoca la vida y el éxito.\n\nEn las culturas Yoruba y Ashanti, la transición entre el 31 de diciembre y el 1 de enero representa un momento de gran vulnerabilidad, cuando las energías negativas del año pasado buscan abrirse camino en el nuevo. Para protegerse contra esto, es costumbre marcar la entrada de las casas o la frente de los niños con laterita o madera de cam antes de la celebración. Reconocibles por sus profundos tonos rojos y conocidos por sus propiedades protectoras.\n\nA través de esta obra de arte, nuestro deseo es que este textil haga más que simplemente adornar su espacio, que traiga consigo un aura de protección y vitalidad renovada. Al dar la bienvenida a “Noche Festiva” en su hogar, invita a la fuerza de una herencia que vela por cada nuevo comienzo."
    },
    images: [
      'https://storage.googleapis.com/atip_storage/Festive-Night_Mask.jpg',
      'https://storage.googleapis.com/atip_storage/ATIP_Textile_Framed_corner.jpg',
      'https://storage.googleapis.com/atip_storage/Festive-Night_Framed.jpg',
    ],
  },
  {
    id: '1',
    name: {
      
      en: 'Festive Night',
      fr: 'Nuit Festive',
      es: 'Noche festiva'
    },
    subtitle: {
      en: '20x60 cm | unframed',
      fr: '20x60 cm | sans cadre',
      es: '20x60 cm | sin marco'
    },
    // Fix: removed leading zero from numeric literal to resolve parsing error
    price: 76.00,
    paymentLink: 'https://buy.stripe.com/test_festive_night_unframed',
    description: {
      en: "On this first day of the year, beneath the glow of fireworks lighting up the night sky, the Sapeurs celebrate and adorn themselves in red. A red that, freed from the Western prism, does not signal danger, but calls forth life and success.\n\nIn Yoruba and Ashanti cultures, the transition between December 31st and January 1st represents a moment of great vulnerability, when the negative energies of the past year seek to make their way into the new one. To guard against this, it is customary to mark the entrance of homes or the foreheads of children with laterite or camwood before the celebration. Recognizable for their deep red tones and known for their protective properties.\n\nThrough this artwork, our wish is that this textile does more than simply adorn your space,  that it brings with it an aura of protection and renewed vitality. By welcoming “Festive Night” into your home, you invite the strength of a heritage that watches over every new beginning.",
      fr: "En ce premier jour de l'année, sous l'éclat des feux d'artifice illuminant le ciel nocturne, les Sapeurs célèbrent et se parent de rouge. Un rouge qui, libéré du prisme occidental, ne signale pas le danger, mais appelle à la vie et au succès.\n\nDans les cultures Yoruba et Ashanti, la transition entre le 31 décembre et le 1er janvier représente un moment de grande vulnérabilité, où les énergies négatives de l'année écoulée cherchent à se frayer un chemin dans la nouvelle. Pour s'en prémunir, il est d'usage de marquer l'entrée des maisons ou le front des enfants avec de la latérite ou du bois de cam avant la célébration. Reconnaissables à leurs tons rouges profonds et connus pour leurs propriétés protectrices.\n\nÀ travers cette œuvre, notre souhait est que ce textile fasse plus que simplement orner votre espace, qu'il apporte avec lui une aura de protection et une vitalité renouvelée. En accueillant « Nuit Festive » dans votre foyer, vous invitez la force d'un héritage qui veille sur chaque nouveau départ.",
      es: "En este primer día del año, bajo el resplandor de los fuegos artificiales que iluminan el cielo nocturno, los Sapeurs celebran y se adornan de rojo. Un rojo que, liberado del prisma occidental, no señala peligro, sino que invoca la vida y el éxito.\n\nEn las culturas Yoruba y Ashanti, la transición entre el 31 de diciembre y el 1 de enero representa un momento de gran vulnerabilidad, cuando las energías negativas del año pasado buscan abrirse camino en el nuevo. Para protegerse contra esto, es costumbre marcar la entrada de las casas o la frente de los niños con laterita o madera de cam antes de la celebración. Reconocibles por sus profundos tonos rojos y conocidos por sus propiedades protectoras.\n\nA través de esta obra de arte, nuestro deseo es que este textil haga más que simplemente adornar su espacio, que traiga consigo un aura de protección y vitalidad renovada. Al dar la bienvenida a “Noche Festiva” en su hogar, invita a la fuerza de una herencia que vela por cada nuevo comienzo."
    },
    images: [
      'https://storage.googleapis.com/atip_storage/ATIP_Framing_side.jpg',
      'https://storage.googleapis.com/atip_storage/ATIP_Framing_pano_vert.jpg',
      'https://storage.googleapis.com/atip_storage/ATIP_Framing_wall_vert.jpg',
    ],
  },
];

/*
  {
    id: '3',
    name: {
      en: 'Prayer to the Rain',
      fr: 'Prière à la Pluie',
      es: 'Oración a la Lluvia'
    },
    price: 1.00,
    description: {
      en: 'A visual tribute to the life-giving force of rain. This piece combines deep blues and soft greys in a pattern that mimics the falling droplets, bringing a sense of calm and renewal to your interior.',
      fr: 'Un hommage visuel à la force vitale de la pluie. Cette pièce combine des bleus profonds et des gris doux dans un motif qui imite les gouttes qui tombent, apportant un sentiment de calme et de renouveau à votre intérieur.',
      es: 'Un tributo visual a la fuerza vivificante de la lluvia. Esta pieza combina azules profundos y grises suaves en un patrón que imita las gotas que caen, aportando una sensación de calma y renovación a su interior.'
    },
    images: [
      'https://storage.googleapis.com/atip_storage/4U3A6245.jpg?v=1',
      'https://storage.googleapis.com/atip_storage/ATIP_Framing_pano_vert.jpg',
    ],
  },
  */
